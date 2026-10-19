import React, { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { NetworkAccess } from "../components/NetworkAccess";
import {
  checked,
  emptyNetworkProfile,
  inviteUrl,
  networkClient,
  type NetworkMessage,
  type NetworkProfile,
  type NetworkTeam,
} from "../lib/network";
import { USER_ROLES } from "../db/userProfile";

const button =
  "px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white";
const input =
  "w-full p-3 rounded-lg bg-slate-900 border border-slate-600 text-slate-100";
const panel = "rounded-xl border border-slate-700 bg-slate-950/80 p-5";
export const NetworkPage: React.FC = () => (
  <NetworkAccess>{(user) => <NetworkWorkspace user={user} />}</NetworkAccess>
);

export function NetworkWorkspace({
  user,
  joinCode,
}: {
  user: User;
  joinCode?: string;
}) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<NetworkProfile>(() =>
    emptyNetworkProfile(user.id),
  );
  const [savedProfile, setSavedProfile] = useState<NetworkProfile | null>(null);
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [teams, setTeams] = useState<NetworkTeam[]>([]);
  const [members, setMembers] = useState<
    { team_id: string; user_id: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState("");
  const [goals, setGoals] = useState("");
  const [teamName, setTeamName] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [link, setLink] = useState("");
  const [preview, setPreview] = useState<{
    creator: string;
    team: string | null;
    expires_at: string;
  } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [channel, setChannel] = useState<{
    type: "team" | "dm";
    id: string;
    name: string;
  } | null>(null);
  const [messages, setMessages] = useState<NetworkMessage[]>([]);
  const [chatError, setChatError] = useState("");
  const [text, setText] = useState("");

  const reload = useCallback(async () => {
    const db = networkClient!;
    const results = await Promise.all([
      db.from("network_profiles").select("*").eq("id", user.id).maybeSingle(),
      db.from("network_profiles").select("*").order("name").limit(200),
      db.from("network_connections").select("user_a,user_b"),
      db
        .from("network_teams")
        .select("*")
        .order("created_at", { ascending: false }),
      db.from("network_members").select("team_id,user_id"),
    ]);
    const own = checked(results[0]) as NetworkProfile | null;
    setSavedProfile(own);
    setProfiles((checked(results[1]) || []) as NetworkProfile[]);
    setConnections(
      (checked(results[2]) || []).map((c) =>
        c.user_a === user.id ? c.user_b : c.user_a,
      ),
    );
    setTeams((checked(results[3]) || []) as NetworkTeam[]);
    setMembers(checked(results[4]) || []);
    return own;
  }, [user.id]);
  useEffect(() => {
    let alive = true;
    reload()
      .then((own) => {
        if (alive) {
          setProfile(own || emptyNetworkProfile(user.id));
          setSkills(own?.skills.join(", ") || "");
          setGoals(own?.goals.join(", ") || "");
          setEditing(!own);
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reload, user.id]);
  useEffect(() => {
    if (!joinCode) return;
    let alive = true;
    networkClient!
      .rpc("network_preview_invite", { invite_code: joinCode })
      .then((result) => {
        if (!alive) return;
        if (result.error) setError(result.error.message);
        else setPreview(result.data);
      });
    return () => {
      alive = false;
    };
  }, [joinCode]);
  // Refresh only while visible. No simulated messages or fabricated collaborators.
  useEffect(() => {
    if (!savedProfile) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible")
        reload().catch((e) => setError(e.message));
    }, 15000);
    return () => window.clearInterval(timer);
  }, [reload, !!savedProfile]);
  useEffect(() => {
    setMessages([]);
    setChatError("");
    setText("");
    if (!channel) return;
    let alive = true;
    const load = async () => {
      let query = networkClient!
        .from("network_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(100);
      if (channel.type === "team") query = query.eq("team_id", channel.id);
      else
        query = query
          .is("team_id", null)
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${channel.id}),and(sender_id.eq.${channel.id},recipient_id.eq.${user.id})`,
          );
      const rows = checked(await query) as NetworkMessage[];
      if (alive) {
        setMessages([...rows].reverse());
        setChatError("");
      }
    };
    const refresh = () =>
      load().catch((e) => {
        if (alive) setChatError(e.message);
      });
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 3000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [channel?.id, channel?.type, user.id]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    await run(async () => {
      const list = (value: string) => [
        ...new Set(
          value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ];
      const safe: NetworkProfile = {
        id: user.id,
        name: profile.name.trim(),
        role: profile.role,
        university: profile.university.trim(),
        location: profile.location.trim(),
        bio: profile.bio.trim(),
        skills: list(skills),
        goals: list(goals),
        is_public: profile.is_public,
      };
      if (safe.skills.length > 30 || safe.goals.length > 20)
        throw new Error("Use up to 30 skills and 20 goals.");
      checked(await networkClient!.from("network_profiles").upsert(safe));
      setProfile(safe);
      await reload();
      setEditing(false);
      setNotice("Network profile saved.");
    });
  }
  async function createInvite(team?: NetworkTeam) {
    await run(async () => {
      const code = checked(
        await networkClient!.rpc("network_create_invite", {
          target_team: team?.id || null,
        }),
      );
      setLink(inviteUrl(code));
      setNotice("Invitation created. It expires in 7 days.");
    });
  }
  const nameFor = (id: string) =>
    profiles.find((p) => p.id === id)?.name ||
    (id === user.id ? profile.name : "Teammate");
  if (loading)
    return (
      <p role="status" className="p-8">
        Loading shared network…
      </p>
    );
  return (
    <div className="p-4 md:p-8 pb-28 space-y-6 text-slate-100 max-w-6xl w-full mx-auto">
      <header className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Teammates & Network</h1>
          <p className="text-slate-400 mt-2">
            {user.email} · {connections.length} connections · {teams.length}{" "}
            teams
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className={button}
            disabled={busy}
            onClick={() => setEditing((v) => !v)}
          >
            Edit network profile
          </button>
          <button
            className="underline"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const result = await networkClient!.auth.signOut();
                if (result.error) throw result.error;
              })
            }
          >
            Sign out of network
          </button>
        </div>
      </header>
      {error && (
        <div role="alert" className="p-4 rounded bg-rose-950 text-rose-200">
          {error}
          <button
            className="ml-4 underline"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await reload();
              })
            }
          >
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="text-teal-200">
          {notice}
        </p>
      )}
      {joinCode && (
        <section className={panel}>
          <h2 className="text-xl font-semibold">Invitation</h2>
          {preview ? (
            <>
              <p className="my-3">
                {preview.creator} invited you{" "}
                {preview.team
                  ? `to join “${preview.team}”`
                  : "to connect on QADAM"}
                . Accepting shares your network profile with{" "}
                {preview.team ? "the team members" : "this person"}, even if it
                is hidden from search.
              </p>
              <p className="text-sm text-slate-400 mb-3">
                Expires {new Date(preview.expires_at).toLocaleString()}
              </p>
              {accepted ? (
                <button className={button} onClick={() => navigate("/network")}>
                  Open network
                </button>
              ) : (
                <button
                  className={button}
                  disabled={busy || !savedProfile}
                  onClick={() =>
                    run(async () => {
                      checked(
                        await networkClient!.rpc("network_accept_invite", {
                          invite_code: joinCode,
                        }),
                      );
                      await reload();
                      setAccepted(true);
                      setNotice("Invitation accepted. You are now connected.");
                    })
                  }
                >
                  Accept invitation
                </button>
              )}
              {!savedProfile && (
                <p className="mt-3 text-amber-200">
                  Save your network profile below before accepting.
                </p>
              )}
            </>
          ) : (
            <p>Checking invitation…</p>
          )}
        </section>
      )}
      {(editing || !savedProfile) && (
        <form onSubmit={save} className={`${panel} space-y-4`}>
          <h2 className="text-xl font-semibold">Your network profile</h2>
          <p className="text-slate-400">
            Only the fields below are shared. CVs, passwords, email, phone
            numbers and identity documents are excluded. Hidden profiles are
            visible to accepted connections and team members.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <label>
              Name
              <input
                className={input}
                required
                minLength={2}
                maxLength={120}
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </label>
            <label>
              Role
              <select
                className={input}
                value={profile.role}
                onChange={(e) =>
                  setProfile({ ...profile, role: e.target.value })
                }
              >
                {USER_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              University
              <input
                className={input}
                maxLength={160}
                value={profile.university}
                onChange={(e) =>
                  setProfile({ ...profile, university: e.target.value })
                }
              />
            </label>
            <label>
              City / location
              <input
                className={input}
                maxLength={120}
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
              />
            </label>
          </div>
          <label className="block">
            Skills, separated by commas
            <input
              className={input}
              maxLength={1500}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </label>
          <label className="block">
            Goals, separated by commas
            <input
              className={input}
              maxLength={1500}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </label>
          <label className="block">
            Short bio
            <textarea
              className={input}
              maxLength={1000}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </label>
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={profile.is_public}
              onChange={(e) =>
                setProfile({ ...profile, is_public: e.target.checked })
              }
            />
            Allow other signed-in QADAM users to find my network profile
          </label>
          <button className={button} disabled={busy}>
            Save network profile
          </button>
        </form>
      )}
      {savedProfile && (
        <>
          <section className={`${panel} space-y-3`}>
            <h2 className="text-xl font-semibold">Invite a teammate</h2>
            <p>
              Share a connection invitation, or use a team’s invitation button
              below.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className={button}
                disabled={busy}
                onClick={() => createInvite()}
              >
                Create connection link
              </button>
              <button
                className="underline"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    checked(
                      await networkClient!.rpc("network_revoke_invites", {
                        target_team: null,
                      }),
                    );
                    setLink("");
                    setNotice(
                      "Your connection invitation links have been revoked.",
                    );
                  })
                }
              >
                Revoke connection links
              </button>
            </div>
            {link && (
              <div className="space-y-2">
                <label className="block">
                  Invitation link
                  <input
                    readOnly
                    className={input}
                    value={link}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <button
                  className={button}
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await navigator.clipboard.writeText(link);
                      setNotice("Link copied.");
                    })
                  }
                >
                  Copy link
                </button>
              </div>
            )}
          </section>
          <section className="space-y-4">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-xl font-semibold">Discover teammates</h2>
              <button
                className="underline"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await reload();
                    setNotice("Network refreshed.");
                  })
                }
              >
                Refresh
              </button>
            </div>
            <input
              aria-label="Search teammates"
              className={input}
              placeholder="Search name, university, city or skills"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid md:grid-cols-2 gap-4">
              {profiles
                .filter(
                  (p) =>
                    p.id !== user.id &&
                    [p.name, p.university, p.location, ...p.skills]
                      .join(" ")
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                )
                .map((p) => (
                  <article key={p.id} className={`${panel} space-y-2`}>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-teal-300">{p.role}</p>
                    <p>
                      {[p.university, p.location].filter(Boolean).join(" · ")}
                    </p>
                    <p>{p.bio}</p>
                    <p className="text-sm text-slate-400">
                      {p.skills.join(" · ")}
                    </p>
                    <p className="text-sm">{p.goals.join(" · ")}</p>
                    {connections.includes(p.id) ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          className={button}
                          onClick={() =>
                            setChannel({ type: "dm", id: p.id, name: p.name })
                          }
                        >
                          Message
                        </button>
                        <button
                          className="underline"
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              checked(
                                await networkClient!
                                  .from("network_connections")
                                  .delete()
                                  .eq("user_a", user.id < p.id ? user.id : p.id)
                                  .eq(
                                    "user_b",
                                    user.id < p.id ? p.id : user.id,
                                  ),
                              );
                              await reload();
                              if (channel?.id === p.id) setChannel(null);
                              setNotice("Connection removed.");
                            })
                          }
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Connect by sharing and accepting an invitation link.
                      </p>
                    )}
                  </article>
                ))}
            </div>
            {!profiles.some((p) => p.id !== user.id) && (
              <p className="text-slate-400">
                No teammates yet. Invite someone or ask them to enable profile
                discovery.
              </p>
            )}
          </section>
          <section className={`${panel} space-y-4`}>
            <h2 className="text-xl font-semibold">Your teams</h2>
            <form
              className="flex flex-wrap gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  checked(
                    await networkClient!.rpc("network_create_team", {
                      team_name: teamName.trim(),
                      opportunity: opportunity.trim(),
                    }),
                  );
                  setTeamName("");
                  setOpportunity("");
                  await reload();
                  setNotice(
                    "Team created. Invite members with its link below.",
                  );
                });
              }}
            >
              <input
                className={`${input} md:!w-64`}
                aria-label="Team name"
                placeholder="Team name"
                required
                minLength={2}
                maxLength={100}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <input
                className={`${input} md:!w-64`}
                aria-label="Opportunity or hackathon"
                placeholder="Opportunity / hackathon (optional)"
                maxLength={200}
                value={opportunity}
                onChange={(e) => setOpportunity(e.target.value)}
              />
              <button className={button} disabled={busy}>
                Create team
              </button>
            </form>
            {teams.map((t) => (
              <article
                key={t.id}
                className="border-t border-slate-700 pt-4 space-y-2"
              >
                <h3 className="font-semibold">{t.name}</h3>
                <p>{t.opportunity_title}</p>
                <p className="text-slate-400">
                  Members:{" "}
                  {members
                    .filter((m) => m.team_id === t.id)
                    .map((m) => nameFor(m.user_id))
                    .join(", ")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className={button}
                    onClick={() =>
                      setChannel({ type: "team", id: t.id, name: t.name })
                    }
                  >
                    Open team chat
                  </button>
                  {t.owner_id === user.id && (
                    <>
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() => createInvite(t)}
                      >
                        Create team invite
                      </button>
                      <button
                        className="underline"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            checked(
                              await networkClient!.rpc(
                                "network_revoke_invites",
                                { target_team: t.id },
                              ),
                            );
                            setLink("");
                            setNotice("Team invitation links revoked.");
                          })
                        }
                      >
                        Revoke team links
                      </button>
                    </>
                  )}
                  <button
                    className="underline text-rose-300"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          t.owner_id === user.id
                            ? "Delete this team and its chat for all members?"
                            : "Leave this team?",
                        )
                      )
                        run(async () => {
                          checked(
                            await networkClient!.rpc("network_leave_team", {
                              target_team: t.id,
                            }),
                          );
                          if (channel?.id === t.id) setChannel(null);
                          await reload();
                          setNotice("Team updated.");
                        });
                    }}
                  >
                    {t.owner_id === user.id ? "Delete team" : "Leave team"}
                  </button>
                </div>
              </article>
            ))}
          </section>
          {channel && (
            <section className={`${panel} space-y-4`}>
              <div className="flex justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  {channel.type === "team" ? "Team chat" : "Direct messages"} ·{" "}
                  {channel.name}
                </h2>
                <button className="underline" onClick={() => setChannel(null)}>
                  Close chat
                </button>
              </div>
              <p className="text-sm text-slate-400">
                Messages refresh every 3 seconds. Showing the latest 100
                messages.
              </p>
              {chatError && (
                <p role="alert" className="text-rose-300">
                  {chatError}
                </p>
              )}
              <div
                className="max-h-96 overflow-y-auto space-y-3"
                aria-live="polite"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg ${m.sender_id === user.id ? "bg-teal-950" : "bg-slate-900"}`}
                  >
                    <p className="text-sm text-teal-300">
                      {nameFor(m.sender_id)} ·{" "}
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                  </div>
                ))}
                {!messages.length && !chatError && (
                  <p>No messages yet. Start the conversation.</p>
                )}
              </div>
              <form
                className="flex gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  const current = channel;
                  run(async () => {
                    const row = checked(
                      await networkClient!
                        .from("network_messages")
                        .insert({
                          sender_id: user.id,
                          content: text.trim(),
                          team_id: current.type === "team" ? current.id : null,
                          recipient_id:
                            current.type === "dm" ? current.id : null,
                        })
                        .select()
                        .single(),
                    ) as NetworkMessage;
                    setMessages((prev) =>
                      [...prev.filter((m) => m.id !== row.id), row].slice(-100),
                    );
                    setText("");
                  });
                }}
              >
                <input
                  className={input}
                  aria-label="Message"
                  maxLength={2000}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message…"
                />
                <button className={button} disabled={busy || !text.trim()}>
                  Send
                </button>
              </form>
            </section>
          )}
          <section className={`${panel} text-sm text-slate-400`}>
            <p>
              Old collaborators and chats saved only in this browser are not
              uploaded or presented as real users.
            </p>
            <button
              className="mt-3 underline text-rose-300"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Delete your shared network profile, connections, sent messages and teams you own? Your local workspace stays on this device.",
                  )
                )
                  run(async () => {
                    checked(
                      await networkClient!
                        .from("network_profiles")
                        .delete()
                        .eq("id", user.id),
                    );
                    setChannel(null);
                    setLink("");
                    setProfile(emptyNetworkProfile(user.id));
                    setSkills("");
                    setGoals("");
                    setEditing(true);
                    await reload();
                    setNotice("Shared network data deleted.");
                  });
              }}
            >
              Delete my network data
            </button>
          </section>
        </>
      )}
    </div>
  );
}
