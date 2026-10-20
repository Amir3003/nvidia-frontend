import { useEffect, useSyncExternalStore } from "react";
import { networkClient, type NetworkMessage } from "./network";

// Unread tracking for the shared network. Read positions are per device (localStorage),
// keyed by the signed-in network user. One poller is shared by every component that
// subscribes (the sidebar badge and the network page), and it only runs while visible.

export type ChannelKey = `dm:${string}` | `team:${string}`;

export interface ChannelSummary {
  last: NetworkMessage;
  unread: number;
}

export interface InboxState {
  userId: string | null;
  channels: Record<string, ChannelSummary>;
  totalUnread: number;
  incomingRequests: number;
}

const POLL_MS = 5000;
const HEARTBEAT_MS = 60000;
const EMPTY: InboxState = { userId: null, channels: {}, totalUnread: 0, incomingRequests: 0 };

let state: InboxState = EMPTY;
let timer: number | null = null;
let heartbeatTimer: number | null = null;
let subscribers = 0;
const listeners = new Set<() => void>();

const readKey = (userId: string) => `qadam-network-read:${userId}`;

function loadRead(userId: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(readKey(userId));
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function saveRead(userId: string, read: Record<string, string>) {
  try {
    localStorage.setItem(readKey(userId), JSON.stringify(read));
  } catch {
    // Storage unavailable: unread counts reset on reload, nothing else breaks.
  }
}

export function channelKeyOf(message: NetworkMessage, userId: string): ChannelKey {
  if (message.team_id) return `team:${message.team_id}`;
  const other = message.sender_id === userId ? message.recipient_id : message.sender_id;
  return `dm:${other}`;
}

function setState(next: InboxState) {
  state = next;
  if (typeof document !== "undefined") {
    const count = next.totalUnread + next.incomingRequests;
    const base = document.title.replace(/^\(\d+\)\s/, "");
    document.title = count ? `(${count}) ${base}` : base;
  }
  listeners.forEach((listener) => listener());
}

async function refresh() {
  if (!networkClient) return;
  const { data: session } = await networkClient.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) {
    if (state.userId) setState(EMPTY);
    return;
  }
  // RLS limits this to the user's own direct messages and their teams' messages.
  const { data, error } = await networkClient
    .from("network_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error || !data) return;

  const latest: Record<string, NetworkMessage> = {};
  for (const message of data as NetworkMessage[]) {
    const key = channelKeyOf(message, userId);
    if (!latest[key]) latest[key] = message;
  }

  // First run on this device: treat existing history as read instead of a wall of badges.
  let read = loadRead(userId);
  if (!read) {
    read = Object.fromEntries(Object.entries(latest).map(([key, m]) => [key, m.created_at]));
    saveRead(userId, read);
  }

  const channels: Record<string, ChannelSummary> = {};
  for (const [key, last] of Object.entries(latest)) channels[key] = { last, unread: 0 };
  for (const message of data as NetworkMessage[]) {
    if (message.sender_id === userId) continue;
    const key = channelKeyOf(message, userId);
    const seen = read[key];
    if (!seen || message.created_at > seen) channels[key].unread += 1;
  }
  const totalUnread = Object.values(channels).reduce((sum, c) => sum + c.unread, 0);
  // Missing before the social migration runs: the count simply stays at zero.
  const requests = await networkClient
    .from("network_friend_requests")
    .select("sender_id", { count: "exact", head: true })
    .eq("recipient_id", userId);
  setState({ userId, channels, totalUnread, incomingRequests: requests.count || 0 });
}

const refreshSafely = () => {
  refresh().catch(() => undefined);
};

// Marks this user online for friends; ignored until the social migration runs.
const heartbeat = () => {
  if (document.visibilityState !== "visible" || !networkClient) return;
  networkClient.auth.getSession().then(({ data }) => {
    if (data.session) networkClient!.rpc("network_heartbeat").then(() => undefined, () => undefined);
  });
};

function start() {
  subscribers += 1;
  if (subscribers > 1) return;
  refreshSafely();
  timer = window.setInterval(() => {
    if (document.visibilityState === "visible") refreshSafely();
  }, POLL_MS);
  heartbeat();
  heartbeatTimer = window.setInterval(heartbeat, HEARTBEAT_MS);
  document.addEventListener("visibilitychange", refreshSafely);
  document.addEventListener("visibilitychange", heartbeat);
}

function stop() {
  subscribers -= 1;
  if (subscribers > 0) return;
  if (timer !== null) window.clearInterval(timer);
  if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
  timer = null;
  heartbeatTimer = null;
  document.removeEventListener("visibilitychange", refreshSafely);
  document.removeEventListener("visibilitychange", heartbeat);
}

// Marks a channel read up to `upTo` (a message created_at) and updates badges right away.
export function markChannelRead(key: ChannelKey, upTo: string) {
  const { userId } = state;
  if (!userId) return;
  const read = loadRead(userId) || {};
  if (read[key] && read[key] >= upTo) return;
  read[key] = upTo;
  saveRead(userId, read);
  const channel = state.channels[key];
  if (!channel || !channel.unread) return;
  const channels = { ...state.channels, [key]: { ...channel, unread: 0 } };
  setState({ ...state, channels, totalUnread: state.totalUnread - channel.unread });
}

export const refreshInbox = refreshSafely;

export function useNetworkInbox(): InboxState {
  useEffect(() => {
    if (!networkClient) return;
    start();
    const { data } = networkClient.auth.onAuthStateChange(() => refreshSafely());
    return () => {
      data.subscription.unsubscribe();
      stop();
    };
  }, []);
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => EMPTY,
  );
}
