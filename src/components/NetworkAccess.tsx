import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { checked, networkClient } from "../lib/network";

export function NetworkAccess({
  children,
}: {
  children: (user: User) => React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!networkClient) {
      setLoading(false);
      return;
    }
    let alive = true;
    networkClient.auth.getSession().then(({ data, error }) => {
      if (alive) {
        setUser(data.session?.user || null);
        setLoading(false);
        if (error) setError(error.message);
      }
    });
    const { data } = networkClient.auth.onAuthStateChange((_event, session) => {
      if (alive) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  if (!networkClient)
    return (
      <div className="p-8 max-w-xl mx-auto text-slate-100">
        <h1 className="text-2xl font-bold mb-4">
          Shared network is not connected yet
        </h1>
        <p>
          The team needs to finish setting up the shared network service.
          Profiles, invitations and chats will become available here once it is
          connected.
        </p>
        <a
          className="inline-block mt-6 underline text-teal-300"
          href="/welcome"
        >
          Back to QADAM
        </a>
      </div>
    );
  if (loading)
    return (
      <p className="p-8 text-slate-100" role="status">
        Checking network account…
      </p>
    );
  if (user)
    return <React.Fragment key={user.id}>{children(user)}</React.Fragment>;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!sent) {
        checked(
          await networkClient!.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
          }),
        );
        setSent(true);
      } else
        checked(
          await networkClient!.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: "email",
          }),
        );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to sign in. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="p-6 max-w-lg mx-auto my-12 text-slate-100">
      <h1 className="text-2xl font-bold">Sign in to the shared network</h1>
      <p className="my-4 text-slate-300">
        Verify your email to connect with real teammates on any device. Your
        existing local workspace stays on this device.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            disabled={sent || busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full p-3 mt-1 rounded bg-slate-900 border border-slate-600"
          />
        </label>
        {sent && (
          <label className="block">
            Code from your email
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="block w-full p-3 mt-1 rounded bg-slate-900 border border-slate-600"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-rose-300">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="bg-teal-600 rounded px-5 py-3 disabled:opacity-50"
        >
          {busy
            ? "Please wait…"
            : sent
              ? "Verify and continue"
              : "Send sign-in code"}
        </button>
        {sent && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setSent(false);
              setCode("");
              setError("");
            }}
            className="block underline"
          >
            Use another email / resend code
          </button>
        )}
      </form>
      <a href="/welcome" className="block mt-6 text-teal-300 underline">
        Back to QADAM
      </a>
    </div>
  );
}
