import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Run production migration in embedded Postgres. PGlite has no pgcrypto binary;
// these test-only shims use core SHA-256 and UUIDs, leaving production SQL untouched.
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create schema extensions;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
    create function extensions.gen_random_bytes(n integer) returns bytea language sql as
      $$ select decode(replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-',''),'hex') $$;
    create function extensions.digest(t text, algo text) returns bytea language sql as
      $$ select sha256(convert_to(t,'UTF8')) $$;
    grant usage on schema public to authenticated, anon;`);
  const sql = await fs.readFile(
    new URL("../supabase/migrations/202610180001_network.sql", import.meta.url),
    "utf8",
  );
  await db.exec(
    sql.replace(
      "create extension if not exists pgcrypto with schema extensions;",
      "",
    ),
  );
  return db;
}
const ids = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
  "00000000-0000-0000-0000-000000000003",
];
async function as(db, id) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  await db.exec("set role authenticated");
}
const rows = async (db, sql, params = []) => (await db.query(sql, params)).rows;
const rpc = async (db, fn, params = []) =>
  (
    await rows(
      db,
      `select public.${fn}(${params.map((_, i) => "$" + (i + 1)).join(",")}) as result`,
      params,
    )
  )[0].result;

test("shared network: identity, consent, private profiles, team invites and chat isolation", async () => {
  const db = await setup();
  try {
    for (const id of ids)
      await db.query("insert into auth.users values($1)", [id]);
    for (let i = 0; i < ids.length; i++) {
      await as(db, ids[i]);
      await db.query(
        "insert into network_profiles(id,name,is_public) values($1,$2,$3)",
        [ids[i], ["Alice", "Bob", "Carol"][i], i === 2],
      );
    }
    await as(db, ids[0]);
    assert.deepEqual(
      (await rows(db, "select name from network_profiles order by name")).map(
        (r) => r.name,
      ),
      ["Alice", "Carol"],
    );
    await assert.rejects(
      db.query("insert into network_profiles(id,name) values($1,$2)", [
        ids[1],
        "Impersonation",
      ]),
      /row-level security|duplicate key/,
    );
    const invite = await rpc(db, "network_create_invite", [null]);
    assert.equal(invite.length, 64);
    await as(db, ids[1]);
    assert.equal(
      (await rpc(db, "network_preview_invite", [invite])).creator,
      "Alice",
    );
    await rpc(db, "network_accept_invite", [invite]);
    await rpc(db, "network_accept_invite", [invite]); // Idempotent, no duplicate connection.
    assert.equal(
      (await rows(db, "select * from network_connections")).length,
      1,
    );
    assert.equal(
      (
        await rows(db, "select name from network_profiles where id=$1", [
          ids[0],
        ])
      )[0].name,
      "Alice",
    );
    await db.query(
      "insert into network_messages(sender_id,recipient_id,content) values($1,$2,$3)",
      [ids[1], ids[0], "Hello Alice"],
    );
    await as(db, ids[0]);
    assert.equal(
      (await rows(db, "select content from network_messages"))[0].content,
      "Hello Alice",
    );
    await as(db, ids[2]);
    assert.equal((await rows(db, "select * from network_messages")).length, 0);
    await assert.rejects(
      db.query(
        "insert into network_messages(sender_id,recipient_id,content) values($1,$2,$3)",
        [ids[2], ids[0], "Unsolicited"],
      ),
      /row-level security/,
    );
    await assert.rejects(
      db.query("insert into network_connections values($1,$2)", [
        ids[0],
        ids[2],
      ]),
      /permission denied/,
    );
    await as(db, ids[0]);
    const team = await rpc(db, "network_create_team", ["QADAM", "Hackathon"]);
    assert.equal((await rows(db, "select * from network_members")).length, 1);
    const teamInvite = await rpc(db, "network_create_invite", [team]);
    await as(db, ids[2]);
    assert.equal((await rows(db, "select * from network_teams")).length, 0);
    await assert.rejects(
      rpc(db, "network_create_invite", [team]),
      /Only the team owner/,
    );
    await assert.rejects(
      db.query(
        "insert into network_messages(sender_id,team_id,content) values($1,$2,$3)",
        [ids[2], team, "Intruder"],
      ),
      /row-level security/,
    );
    await as(db, ids[1]);
    await rpc(db, "network_accept_invite", [teamInvite]);
    assert.equal((await rows(db, "select * from network_members")).length, 2);
    await as(db, ids[0]);
    await db.query(
      "insert into network_messages(sender_id,team_id,content) values($1,$2,$3)",
      [ids[0], team, "Team-only message"],
    );
    await assert.rejects(
      db.query(
        "insert into network_messages(sender_id,team_id,content) values($1,$2,$3)",
        [ids[0], team, "Too fast"],
      ),
      /wait a second/,
    );
    await as(db, ids[1]);
    assert.equal(
      (
        await rows(db, "select * from network_messages where team_id=$1", [
          team,
        ])
      ).length,
      1,
    );
    await rpc(db, "network_leave_team", [team]);
    assert.equal(
      (
        await rows(db, "select * from network_messages where team_id=$1", [
          team,
        ])
      ).length,
      0,
    );
    await as(db, ids[0]);
    await rpc(db, "network_revoke_invites", [team]);
    await as(db, ids[2]);
    await assert.rejects(
      rpc(db, "network_accept_invite", [teamInvite]),
      /invalid or expired/,
    );
    await as(db, ids[0]);
    await assert.rejects(
      rpc(db, "network_accept_invite", [invite]),
      /another account/,
    );
    await db.exec("reset role");
    await db.exec(
      "update network_invites set expires_at=now()-interval '1 day'",
    );
    await as(db, ids[2]);
    await assert.rejects(
      rpc(db, "network_preview_invite", [invite]),
      /invalid or expired/,
    );
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from network_profiles"),
      /permission denied/,
    );
    await assert.rejects(
      rpc(db, "network_preview_invite", [invite]),
      /permission denied/,
    );
    await as(db, ids[0]);
    await db.query("delete from network_profiles where id=$1", [ids[0]]);
    await as(db, ids[1]);
    assert.equal((await rows(db, "select * from network_teams")).length, 0);
    assert.equal(
      (await rows(db, "select * from network_connections")).length,
      0,
    );
    assert.equal((await rows(db, "select * from network_messages")).length, 0);
  } finally {
    await db.close();
  }
});
