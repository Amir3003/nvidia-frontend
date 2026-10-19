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
  "h-10 px-4 rounded-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-mini font-mono font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const ghostButton =
  "h-10 px-4 rounded-btn bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 text-mini font-mono font-semibold transition-colors cursor-pointer disabled:opacity-50";
const linkButton =
  "text-mini font-mono text-teal-800 hover:text-emerald-700 underline cursor-pointer disabled:opacity-50";
const dangerLink =
  "text-mini font-mono text-rose-600 hover:text-rose-700 underline cursor-pointer disabled:opacity-50";
const input =
  "w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-xl text-base md:text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors";
const label =
  "block space-y-1 text-mini font-mono uppercase tracking-wider text-teal-900 font-semibold";
const panel =
  "rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] p-5 sm:p-6 text-slate-900";
const heading = "text-[17px] font-bold text-indigo-950";
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
      <p role="status" className="p-8 text-teal-100 font-mono text-mini text-center">
        Loading shared network...
      </p>
    );

  const friends = connections
    .map((id) => profiles.find((p) => p.id === id))
    .filter((p): p is NetworkProfile => Boolean(p));
  const discover = profiles.filter(
    (p) =>
      p.id !== user.id &&
      [p.name, p.university, p.location, ...p.skills]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const chatItem = (active: boolean) =>
    `w-full text-left px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
      active
        ? "bg-emerald-50 border-emerald-300 text-indigo-950"
        : "bg-white/70 border-teal-200/70 hover:bg-white text-slate-800"
    }`;

  return (
    <div className="relative z-10 p-4 sm:p-6 pb-28 lg:pb-8 space-y-6 max-w-6xl w-full mx-auto">
      <header className={`${panel} flex flex-wrap gap-4 justify-between items-center`}>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/brand/qadam-icon.png"
            alt="QADAM Logo"
            className="w-9 h-9 object-contain rounded-md"
          />
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-indigo-950 leading-tight">
              Teammates & Network
            </h1>
            <p className="text-mini font-mono text-teal-800 truncate">
              {user.email} · {connections.length} connections · {teams.length}{" "}
              teams
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            className={ghostButton}
            disabled={busy}
            onClick={() => setEditing((v) => !v)}
          >
            Edit network profile
          </button>
          <button
            className={linkButton}
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
        <div
          role="alert"
          className="p-3 rounded-btn bg-rose-50 border border-rose-200 text-mini font-mono text-rose-700"
        >
          {error}
          <button
            className="ml-4 underline cursor-pointer"
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
        <p
          role="status"
          className="p-3 rounded-btn bg-emerald-50 border border-emerald-200 text-mini font-mono text-emerald-800"
        >
          {notice}
        </p>
      )}

      {joinCode && (
        <section className={`${panel} space-y-3`}>
          <h2 className={heading}>Invitation</h2>
          {preview ? (
            <>
              <p className="text-[13px] text-teal-950 leading-relaxed">
                <b>{preview.creator}</b> invited you{" "}
                {preview.team
                  ? `to join “${preview.team}”`
                  : "to connect on QADAM"}
                . Accepting shares your network profile with{" "}
                {preview.team ? "the team members" : "this person"}, even if it
                is hidden from search.
              </p>
              <p className="text-mini font-mono text-teal-800">
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
                <p className="text-mini font-mono text-amber-800">
                  Save your network profile below before accepting.
                </p>
              )}
            </>
          ) : (
            <p className="text-[13px] text-teal-950">Checking invitation...</p>
          )}
        </section>
      )}

      {(editing || !savedProfile) && (
        <form onSubmit={save} className={`${panel} space-y-4`}>
          <h2 className={heading}>Your network profile</h2>
          <p className="text-[13px] text-teal-950 leading-relaxed">
            Only the fields below are shared. CVs, passwords, email, phone
            numbers and identity documents are excluded. Hidden profiles are
            visible to accepted connections and team members.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <label className={label}>
              <span>Name</span>
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
            <label className={label}>
              <span>Role</span>
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
            <label className={label}>
              <span>University</span>
              <input
                className={input}
                maxLength={160}
                value={profile.university}
                onChange={(e) =>
                  setProfile({ ...profile, university: e.target.value })
                }
              />
            </label>
            <label className={label}>
              <span>City / location</span>
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
          <label className={label}>
            <span>Skills, separated by commas</span>
            <input
              className={input}
              maxLength={1500}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </label>
          <label className={label}>
            <span>Goals, separated by commas</span>
            <input
              className={input}
              maxLength={1500}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </label>
          <label className={label}>
            <span>Short bio</span>
            <textarea
              className={`${input} h-24 py-2.5`}
              maxLength={1000}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </label>
          <label className="flex gap-3 items-center text-[13px] text-teal-950">
            <input
              type="checkbox"
              className="w-4 h-4 accent-emerald-600"
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
          {/* Chats: accepted connections and teams, with the conversation beside them */}
          <section className={`${panel} space-y-4`}>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className={heading}>Chats</h2>
              <button
                className={linkButton}
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
            <div className="grid md:grid-cols-[260px_1fr] gap-4">
              <div className="space-y-2">
                <div className="text-mini font-mono uppercase tracking-wider text-teal-800 font-semibold">
                  Friends
                </div>
                {friends.map((p) => (
                  <button
                    key={p.id}
                    className={chatItem(channel?.type === "dm" && channel.id === p.id)}
                    onClick={() => setChannel({ type: "dm", id: p.id, name: p.name })}
                  >
                    <div className="text-[13px] font-semibold truncate">{p.name}</div>
                    <div className="text-mini font-mono text-teal-800 truncate">
                      {[p.role, p.university].filter(Boolean).join(" · ")}
                    </div>
                  </button>
                ))}
                {!friends.length && (
                  <p className="text-mini font-mono text-teal-800">
                    No friends yet. Send an invitation link below.
                  </p>
                )}
                <div className="pt-2 text-mini font-mono uppercase tracking-wider text-teal-800 font-semibold">
                  Teams
                </div>
                {teams.map((t) => (
                  <button
                    key={t.id}
                    className={chatItem(channel?.type === "team" && channel.id === t.id)}
                    onClick={() => setChannel({ type: "team", id: t.id, name: t.name })}
                  >
                    <div className="text-[13px] font-semibold truncate">{t.name}</div>
                    <div className="text-mini font-mono text-teal-800 truncate">
                      {members.filter((m) => m.team_id === t.id).length} members
                    </div>
                  </button>
                ))}
                {!teams.length && (
                  <p className="text-mini font-mono text-teal-800">No teams yet.</p>
                )}
              </div>

              <div className="rounded-xl bg-white/80 border border-teal-200/80 flex flex-col min-h-[360px]">
                {channel ? (
                  <>
                    <div className="px-4 py-3 border-b border-teal-200/80 flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-indigo-950 truncate">
                          {channel.name}
                        </div>
                        <div className="text-mini font-mono text-teal-800">
                          {channel.type === "team" ? "Team chat" : "Direct messages"} ·
                          refreshes every 3 seconds
                        </div>
                      </div>
                      <button className={linkButton} onClick={() => setChannel(null)}>
                        Close chat
                      </button>
                    </div>
                    {chatError && (
                      <p role="alert" className="px-4 pt-3 text-mini font-mono text-rose-700">
                        {chatError}
                      </p>
                    )}
                    <div
                      className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3"
                      aria-live="polite"
                    >
                      {messages.map((m) => {
                        const mine = m.sender_id === user.id;
                        return (
                          <div
                            key={m.id}
                            className={`max-w-[85%] p-3 rounded-xl ${
                              mine
                                ? "ml-auto bg-emerald-100 border border-emerald-200"
                                : "bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <p className="text-mini font-mono text-teal-800">
                              {nameFor(m.sender_id)} ·{" "}
                              {new Date(m.created_at).toLocaleString()}
                            </p>
                            <p className="text-[13px] text-slate-900 whitespace-pre-wrap break-words">
                              {m.content}
                            </p>
                          </div>
                        );
                      })}
                      {!messages.length && !chatError && (
                        <p className="text-[13px] text-teal-900">
                          No messages yet. Start the conversation.
                        </p>
                      )}
                    </div>
                    <form
                      className="p-3 border-t border-teal-200/80 flex gap-3"
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
                        placeholder="Write a message..."
                      />
                      <button className={button} disabled={busy || !text.trim()}>
                        Send
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-6 text-center text-[13px] text-teal-900">
                    Choose a friend or a team on the left to open the chat.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={`${panel} space-y-3`}>
            <h2 className={heading}>Invite a teammate</h2>
            <p className="text-[13px] text-teal-950 leading-relaxed">
              Create a link and send it to a friend. When they open it, sign in
              and accept, you both appear in each other&apos;s chats.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                className={button}
                disabled={busy}
                onClick={() => createInvite()}
              >
                Create connection link
              </button>
              <button
                className={linkButton}
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
                <label className={label}>
                  <span>Invitation link</span>
                  <input
                    readOnly
                    className={input}
                    value={link}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <button
                  className={ghostButton}
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

          <section className={`${panel} space-y-4`}>
            <h2 className={heading}>Your teams</h2>
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
                className="border-t border-teal-200/80 pt-4 space-y-2"
              >
                <h3 className="text-[14px] font-bold text-indigo-950">{t.name}</h3>
                {t.opportunity_title && (
                  <p className="text-[13px] text-teal-950">{t.opportunity_title}</p>
                )}
                <p className="text-mini font-mono text-teal-800">
                  Members:{" "}
                  {members
                    .filter((m) => m.team_id === t.id)
                    .map((m) => nameFor(m.user_id))
                    .join(", ")}
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    className={ghostButton}
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
                        className={linkButton}
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
                    className={dangerLink}
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

          <section className={`${panel} space-y-4`}>
            <h2 className={heading}>Discover teammates</h2>
            <input
              aria-label="Search teammates"
              className={input}
              placeholder="Search name, university, city or skills"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid md:grid-cols-2 gap-4">
              {discover.map((p) => (
                <article
                  key={p.id}
                  className="rounded-xl bg-white/80 border border-teal-200/80 p-4 space-y-2"
                >
                  <h3 className="text-[15px] font-bold text-indigo-950">{p.name}</h3>
                  <p className="text-mini font-mono text-emerald-700 font-semibold">{p.role}</p>
                  {(p.university || p.location) && (
                    <p className="text-[13px] text-teal-950">
                      {[p.university, p.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {p.bio && <p className="text-[13px] text-slate-700">{p.bio}</p>}
                  {p.skills.length > 0 && (
                    <p className="text-mini font-mono text-teal-800">
                      {p.skills.join(" · ")}
                    </p>
                  )}
                  {p.goals.length > 0 && (
                    <p className="text-mini font-mono text-slate-600">{p.goals.join(" · ")}</p>
                  )}
                  {connections.includes(p.id) ? (
                    <div className="flex flex-wrap gap-3 items-center">
                      <button
                        className={button}
                        onClick={() =>
                          setChannel({ type: "dm", id: p.id, name: p.name })
                        }
                      >
                        Message
                      </button>
                      <button
                        className={dangerLink}
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
                    <p className="text-mini font-mono text-teal-800">
                      Connect by sharing and accepting an invitation link.
                    </p>
                  )}
                </article>
              ))}
            </div>
            {!profiles.some((p) => p.id !== user.id) && (
              <p className="text-[13px] text-teal-900">
                No teammates yet. Invite someone or ask them to enable profile
                discovery.
              </p>
            )}
          </section>

          <section className={`${panel} text-[13px] text-teal-950`}>
            <p>
              Old collaborators and chats saved only in this browser are not
              uploaded or presented as real users.
            </p>
            <button
              className={`mt-3 ${dangerLink}`}
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
