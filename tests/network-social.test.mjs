import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Applies both production migrations in embedded Postgres with test Auth roles and
// test-only pgcrypto shims (see network-db.test.mjs).
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
  for (const name of ["202610180001_network.sql", "202610200001_social.sql"]) {
    const sql = await fs.readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8");
    await db.exec(sql.replace("create extension if not exists pgcrypto with schema extensions;", ""));
  }
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
const call = async (db, fn, params = []) =>
  (await rows(db, `select public.${fn}(${params.map((_, i) => "$" + (i + 1)).join(",")}) as result`, params))[0].result;

test("social network: discovery, friend requests, presence and adding friends to groups", async () => {
  const db = await setup();
  try {
    for (const id of ids) await db.query("insert into auth.users values($1)", [id]);
    // Alice and Bob use the new default (discoverable); Carol hides her profile.
    for (let i = 0; i < ids.length; i++) {
      await as(db, ids[i]);
      if (i === 2) await db.query("insert into network_profiles(id,name,is_public) values($1,'Carol',false)", [ids[i]]);
      else await db.query("insert into network_profiles(id,name) values($1,$2)", [ids[i], ["Alice", "Bob"][i]]);
    }
    await as(db, ids[0]);
    assert.deepEqual((await rows(db, "select name from network_profiles order by name")).map((r) => r.name), ["Alice", "Bob"]);
    await assert.rejects(call(db, "network_send_friend_request", [ids[2]]), /Profile not found/);
    await assert.rejects(call(db, "network_send_friend_request", [ids[0]]), /cannot add yourself/);
    await assert.rejects(db.query("insert into network_friend_requests values($1,$2)", [ids[0], ids[1]]), /permission denied/);

    assert.equal(await call(db, "network_send_friend_request", [ids[1]]), "requested");
    assert.equal(await call(db, "network_send_friend_request", [ids[1]]), "requested"); // Idempotent.
    await as(db, ids[2]);
    assert.equal((await rows(db, "select * from network_friend_requests")).length, 0);
    await as(db, ids[1]);
    assert.equal((await rows(db, "select * from network_friend_requests where recipient_id=$1", [ids[1]])).length, 1);
    await call(db, "network_respond_friend_request", [ids[0], true]);
    assert.equal((await rows(db, "select * from network_connections")).length, 1);
    assert.equal((await rows(db, "select * from network_friend_requests")).length, 0);
    await assert.rejects(call(db, "network_respond_friend_request", [ids[0], true]), /Request not found/);
    assert.equal(await call(db, "network_send_friend_request", [ids[0]]), "already");

    // Carol (hidden) asks Alice: Alice can now see Carol, and a mutual request connects them.
    await as(db, ids[2]);
    assert.equal(await call(db, "network_send_friend_request", [ids[0]]), "requested");
    await as(db, ids[0]);
    assert.equal((await rows(db, "select name from network_profiles where id=$1", [ids[2]]))[0].name, "Carol");
    assert.equal(await call(db, "network_send_friend_request", [ids[2]]), "connected");
    await as(db, ids[2]);
    await call(db, "network_cancel_friend_request", [ids[0]]);

    // Declining removes the request without connecting.
    await as(db, ids[2]);
    assert.equal(await call(db, "network_send_friend_request", [ids[1]]), "requested");
    await as(db, ids[1]);
    await call(db, "network_respond_friend_request", [ids[2], false]);
    assert.equal((await rows(db, "select * from network_connections where $1 in (user_a,user_b)", [ids[1]])).length, 1);

    // Presence updates only your own row.
    await call(db, "network_heartbeat");
    assert.ok((await rows(db, "select last_seen_at from network_profiles where id=$1", [ids[1]]))[0].last_seen_at);
    assert.equal((await rows(db, "select last_seen_at from network_profiles where id=$1", [ids[0]]))[0].last_seen_at, null);

    // Owners add friends to groups directly; non-friends and non-owners are refused.
    await as(db, ids[0]);
    const team = await call(db, "network_create_team", ["Hackathon", ""]);
    await call(db, "network_add_team_member", [team, ids[1]]);
    await call(db, "network_add_team_member", [team, ids[1]]); // Idempotent.
    assert.equal((await rows(db, "select * from network_members where team_id=$1", [team])).length, 2);
    await as(db, ids[1]);
    await assert.rejects(call(db, "network_add_team_member", [team, ids[2]]), /Only the group owner/);
    await db.query("insert into network_messages(sender_id,team_id,content) values($1,$2,'hi team')", [ids[1], team]);
    await db.exec("set role anon");
    await assert.rejects(call(db, "network_send_friend_request", [ids[0]]), /permission denied/);
  } finally {
    await db.close();
  }
});
