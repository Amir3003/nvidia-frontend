import React from "react";
import { NetworkAccess } from "../components/NetworkAccess";
import { AmbientBackground } from "../components/AmbientBackground";
import { NetworkWorkspace } from "./NetworkPage";
import { invitationCode } from "../lib/network";

export function JoinPage() {
  const code = invitationCode();
  return (
    <main className="min-h-[100dvh] bg-transparent text-slate-100 relative">
      <AmbientBackground />
      {!code ? (
        <div className="relative z-10 p-8 pb-28 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">Invalid invitation</h1>
          <p className="mt-4">
            Ask your teammate for a new QADAM invitation link.
          </p>
          <a
            className="inline-block mt-6 text-teal-300 underline"
            href="/network"
          >
            Open network
          </a>
        </div>
      ) : (
        <NetworkAccess>
          {(user) => <NetworkWorkspace user={user} joinCode={code} />}
        </NetworkAccess>
      )}
    </main>
  );
}
