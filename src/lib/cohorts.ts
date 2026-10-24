import { checked, networkClient } from './network';
import type { UserProfile } from '../db/userProfile';
import type { Opportunity } from '../db/opportunities';

// Phase 2 data layer: institutions, cohorts, invite codes, learner progress.
// Tables, policies and RPCs: supabase/migrations/202610240002_cohorts.sql.

export type ActivityStatus = 'saved' | 'preparing' | 'applied';

export interface Membership {
  userId: string;
  cohortId: string;
  cohortName: string;
  institutionName: string;
}

export interface Institution {
  id: string;
  name: string;
  city: string;
}

export interface Cohort {
  id: string;
  institution_id: string;
  name: string;
  starts_on: string | null;
  ends_on: string | null;
  invite_code: string;
  created_at: string;
}

export interface RosterRow {
  user_id: string;
  email: string;
  full_name: string;
  track: string;
  profile_completion: number;
  saved: number;
  preparing: number;
  applied: number;
  next_deadline: string | null;
  joined_at: string;
  last_active: string | null;
}

const MEMBERSHIP_KEY = 'qadam_cohort_membership';
const ACTIVITY_KEY = 'qadam_opportunity_status';

function client() {
  if (!networkClient) throw new Error('The QADAM account service is not configured yet.');
  return networkClient;
}

/* Local cache of the learner's cohort, used to gate the app without a network round trip. */

export function loadMembership(): Membership | null {
  try {
    const raw = localStorage.getItem(MEMBERSHIP_KEY);
    const parsed = raw ? (JSON.parse(raw) as Membership) : null;
    return parsed?.cohortId && parsed.userId ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMembership(membership: Membership) {
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(membership));
}

export function clearMembership() {
  localStorage.removeItem(MEMBERSHIP_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
}

export function normalizeInviteCode(code: string) {
  return code.replace(/[^0-9a-z]/gi, '').toUpperCase();
}

export function studentInviteUrl(code: string) {
  return `${window.location.origin}/student?code=${encodeURIComponent(code)}`;
}

/* Learner side */

export async function inviteInfo(code: string): Promise<{ cohortName: string; institutionName: string } | null> {
  const rows = checked(await client().rpc('cohort_invite_info', { code: normalizeInviteCode(code) })) as
    | { cohort_name: string; institution_name: string }[]
    | null;
  const row = rows?.[0];
  return row ? { cohortName: row.cohort_name, institutionName: row.institution_name } : null;
}

export async function joinCohort(code: string, userId: string): Promise<Membership> {
  checked(await client().rpc('join_cohort', { code: normalizeInviteCode(code) }));
  const membership = await fetchMembership(userId);
  if (!membership) throw new Error('Joined, but the cohort could not be loaded. Please retry.');
  return membership;
}

// The cohort this signed-in user belongs to (latest join), or null.
export async function fetchMembership(userId: string): Promise<Membership | null> {
  const rows = checked(
    await client()
      .from('cohort_learners')
      .select('cohort_id, joined_at, cohorts(name, institutions(name))')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(1)
  ) as unknown as { cohort_id: string; cohorts: { name: string; institutions: { name: string } | null } | null }[];
  const row = rows[0];
  if (!row) return null;
  return {
    userId,
    cohortId: row.cohort_id,
    cohortName: row.cohorts?.name || 'Your cohort',
    institutionName: row.cohorts?.institutions?.name || '',
  };
}

const COMPLETION_FIELDS: ((p: UserProfile) => boolean)[] = [
  (p) => Boolean(p.name?.trim() && p.surname?.trim()),
  (p) => Boolean(p.university?.trim()),
  (p) => Boolean(p.major?.trim()),
  (p) => Boolean(p.location?.trim()),
  (p) => (p.skills?.length || 0) >= 3,
  (p) => (p.goals?.length || 0) >= 1,
  (p) => (p.cvText?.trim().length || 0) >= 200,
  (p) => Boolean(p.github?.trim() || p.linkedin?.trim()),
];

export function profileCompletion(profile: UserProfile): number {
  const done = COMPLETION_FIELDS.filter((check) => check(profile)).length;
  return Math.round((done / COMPLETION_FIELDS.length) * 100);
}

// Only a summary leaves the device: name, track and completion. Never CV text.
export async function syncLearnerProgress(userId: string, profile: UserProfile) {
  checked(
    await client()
      .from('learner_progress')
      .upsert({
        user_id: userId,
        full_name: `${profile.name || ''} ${profile.surname || ''}`.trim().slice(0, 120),
        track: (profile.major || profile.role || '').trim().slice(0, 120),
        profile_completion: profileCompletion(profile),
        updated_at: new Date().toISOString(),
      })
  );
}

export function loadLocalStatuses(): Record<string, ActivityStatus> {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}');
  } catch {
    return {};
  }
}

export async function setOpportunityStatus(userId: string, opp: Opportunity, status: ActivityStatus | null) {
  const statuses = loadLocalStatuses();
  if (status) statuses[opp.id] = status;
  else delete statuses[opp.id];
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(statuses));
  const table = client().from('learner_activity');
  if (!status) {
    checked(await table.delete().eq('user_id', userId).eq('opportunity_id', opp.id));
    return;
  }
  checked(
    await table.upsert({
      user_id: userId,
      opportunity_id: opp.id.slice(0, 200),
      opportunity_title: opp.title.slice(0, 300),
      deadline: (opp.deadlineDate || '').slice(0, 40),
      status,
      updated_at: new Date().toISOString(),
    })
  );
}

export async function fetchMyStatuses(userId: string): Promise<Record<string, ActivityStatus>> {
  const rows = checked(
    await client().from('learner_activity').select('opportunity_id, status').eq('user_id', userId)
  ) as { opportunity_id: string; status: ActivityStatus }[];
  const statuses = Object.fromEntries(rows.map((row) => [row.opportunity_id, row.status]));
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(statuses));
  return statuses;
}

/* Staff side */

export async function myInstitutions(userId: string): Promise<Institution[]> {
  const rows = checked(
    await client().from('institution_members').select('institutions(id, name, city)').eq('user_id', userId)
  ) as unknown as { institutions: Institution | null }[];
  return rows.map((row) => row.institutions).filter((inst): inst is Institution => Boolean(inst));
}

export async function listCohorts(institutionId: string): Promise<Cohort[]> {
  return checked(
    await client()
      .from('cohorts')
      .select('id, institution_id, name, starts_on, ends_on, invite_code, created_at')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false })
  ) as Cohort[];
}

export async function createCohort(institutionId: string, name: string, startsOn: string, endsOn: string): Promise<Cohort> {
  const rows = checked(
    await client()
      .from('cohorts')
      .insert({ institution_id: institutionId, name: name.trim(), starts_on: startsOn || null, ends_on: endsOn || null })
      .select('id, institution_id, name, starts_on, ends_on, invite_code, created_at')
  ) as Cohort[];
  return rows[0];
}

export async function cohortRoster(cohortId: string): Promise<RosterRow[]> {
  return (checked(await client().rpc('cohort_roster', { c: cohortId })) as RosterRow[]) || [];
}

export async function removeLearner(cohortId: string, userId: string) {
  checked(await client().from('cohort_learners').delete().eq('cohort_id', cohortId).eq('user_id', userId));
}

function csvCell(value: string | number | null) {
  let text = value === null ? '' : String(value);
  // Learner-typed names must not run as spreadsheet formulas.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function rosterCsv(rows: RosterRow[]): string {
  const header = ['Name', 'Email', 'Track', 'Profile %', 'Saved', 'Preparing', 'Applied', 'Next deadline', 'Joined', 'Last active'];
  const lines = rows.map((r) =>
    [r.full_name, r.email, r.track, r.profile_completion, r.saved, r.preparing, r.applied, r.next_deadline, r.joined_at.slice(0, 10), r.last_active?.slice(0, 10) || '']
      .map(csvCell)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}
