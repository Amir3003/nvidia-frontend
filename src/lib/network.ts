import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const networkClient =
  url && key
    ? createClient(url, key, {
        auth: {
          // Persist the network sign-in on this device until the user signs out.
          storage: window.localStorage,
          storageKey: "qadam-network-auth",
          detectSessionInUrl: false,
        },
      })
    : null;

export interface NetworkProfile {
  id: string;
  name: string;
  role: string;
  university: string;
  location: string;
  bio: string;
  skills: string[];
  goals: string[];
  is_public: boolean;
}
export interface NetworkTeam {
  id: string;
  owner_id: string;
  name: string;
  opportunity_title: string;
  created_at: string;
}
export interface NetworkMessage {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  team_id: string | null;
  content: string;
  created_at: string;
}
export const emptyNetworkProfile = (id: string): NetworkProfile => ({
  id,
  name: "",
  role: "Student / Learner",
  university: "",
  location: "",
  bio: "",
  skills: [],
  goals: [],
  is_public: false,
});
export function checked<T>(result: {
  data: T;
  error: { message: string } | null;
}): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export function inviteUrl(code: string) {
  // Fragment prevents invitation codes being sent to web server access logs/referrers.
  return `${window.location.origin}/join#code=${encodeURIComponent(code)}`;
}
export function invitationCode() {
  const code =
    new URLSearchParams(window.location.hash.slice(1)).get("code") ||
    new URLSearchParams(window.location.search).get("code");
  return code && /^[a-f0-9]{64}$/.test(code) ? code : null;
}
