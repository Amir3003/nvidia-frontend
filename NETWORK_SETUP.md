# Shared profiles, invitations, teams and chats

This feature uses Supabase Auth and PostgreSQL instead of browser-only collaborators.
It is independent of the opportunity scanner and Telegram/Discord services. Those
continue to run as before; the Oracle VM does not need another process.

## 1. Create and configure the database

1. Create a Supabase project in your team's account. Review the selected plan and
   region with the person responsible for data/security.
2. In its SQL editor, run `supabase/migrations/202610180001_network.sql` **once**.
   It creates tables, invitation RPCs and row-level security policies. Do not rerun
   this initial migration on an existing installation; use later migrations.
3. Enable Email authentication in Authentication → Providers.
4. In Authentication → Email templates → Magic Link, include the code token:

   ```html
   <h2>Your QADAM sign-in code</h2>
   <p>{{ .Token }}</p>
   <p>Enter this code in the QADAM network sign-in form.</p>
   ```

5. Configure a production SMTP sender for real users. Supabase's built-in email
   service restricts recipients and sending rates; it is not a general public mail
   delivery service. For an initial test, use the explicitly allowed team email
   addresses. Keep email verification, OTP expiry and Auth rate limits enabled.
6. Obtain the project URL and **publishable / anon client key** from project settings.
   Do not use a secret or `service_role` key in the frontend.

## 2. Configure Vercel

Add these environment variables to the existing Vercel project, including the
Preview environment if you will test the PR preview:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY
```

Deploy the branch containing this change, or merge its PR and redeploy production.
Vite embeds these **public client credentials** at build time. Database access is
protected by verified user JWTs and RLS, not by hiding this client key. Never put
Nebius, Tavily, Telegram, Discord or Supabase server credentials in `VITE_*` variables.

For local development use the same variables in your ignored `.env` file, then
`npm install` and `npm run dev`.

## 3. Test with two real devices/accounts

1. Device A: open `/network`, enter an email, receive a code and verify it.
2. Save a network profile. Discovery is **off by default**; enable it explicitly if
   you want other signed-in users to discover your profile.
3. Generate a connection link and copy it. It uses the domain you actually opened,
   e.g. `https://nvidia-pathfinder.vercel.app/join#code=...`.
4. Device B (or a separate browser profile): open that link. `/join` works without
   local onboarding. Sign in with **a different email**, save a profile and
   explicitly accept the invitation.
5. Refresh A. Both users now appear as connected and can message each other.
   Messages refresh every 3 seconds while the tab is visible.
6. Create a team on A and generate its team invite. Accept it on B, refresh A,
   check both member names and send messages in its team chat.
7. Sign in as a third account and confirm it cannot see that team's members/chat
   or the direct messages. Hidden profiles must not appear unless there is an
   accepted connection or shared team.
8. Revoke the link, then test it with another account: acceptance must fail.
   Invitations also expire after 7 days; accepting an existing invitation twice
   does not create duplicate connections or memberships.
9. Leave a team as a member: its chat becomes inaccessible. Deleting a team as
   owner removes its memberships, links and team messages.
10. Delete network data via the page: profile, relationships, sent messages and
    owned teams are deleted. This does not delete the Supabase Auth identity or
    the existing local workspace; a verified user can create a new network profile.

## Identity and privacy boundary

- Existing QADAM onboarding is a **local workspace**, not server authentication.
  Network sign-in is separately labelled and uses email OTP. We do not trust the
  local profile's email/password or automatically claim its identity.
- The network profile form is the only source of shared profile fields: name,
  role, university, location, bio, skills, goals and discovery preference.
- CV text, passwords, national ID, phone, private email and webhook URLs are not
  uploaded to network tables. Existing local data is not silently migrated.
- The discovery toggle applies to this shared network profile. Existing local
  `UserProfile.isPublic` remains a local setting; account-wide cloud identity/profile
  migration is a separate follow-up, and should not be presented as complete.
- Hidden profiles are visible to accepted connections and fellow team members.
  The invitation screen explains this before acceptance.
- Only the owner issues/revokes team links. Links can be reused by invitees until
  expiry/revocation, so share them only with intended members. Revoking a link
  does not remove users who already accepted it.
- Links carry 256-bit random tokens; only hashes are stored in the database. The
  URL fragment keeps the token out of web server request logs. There is also
  support for a `?code=` link, but generated links always use the fragment.
- A sender cannot impersonate another user's ID. DM sends require an accepted
  connection; team sends and reads require membership. Disconnecting prevents
  new DMs but leaves historical DMs readable by their original participants.
- PostgreSQL enforces a per-user one-second message interval, 2,000-character
  messages, max 20 owned teams, max 30 members per team and limited invite creation.
- Chat is ordinary server-stored text, **not end-to-end encrypted**. Do not claim
  E2EE, CV protection or OpenShell isolation based on this feature.
- Sessions are kept in localStorage on this device until "Sign out of network". A new device
  verifies its email again. Sign out of network is separate from local workspace logout.

## Verification

```bash
npm run test:network
npm run build
npm run test:network-ui
```

The database integration test runs the production migration in embedded Postgres
(PGlite) with test Auth roles and test-only pgcrypto shims. It covers privacy,
consent, impersonation, private chats, team membership, revocation, expiry and
cascading deletion. It does **not** verify hosted email delivery or Vercel/Supabase
credentials; the two-device checklist above is required after configuration.

## Current MVP limits

- The directory fetches up to 200 visible profiles; server-side search/pagination
  should replace this for larger deployments.
- Chats poll rather than use realtime subscriptions, and show the latest 100
  messages. Add history pagination and reporting/moderation before broad rollout.
- Email/Supabase availability and delivery limits must be monitored.
- This is shared networking only. It does not implement CV uploads, the agent,
  personal opportunity matching, or Telegram/Discord account linking.

References: https://supabase.com/docs/guides/auth/auth-email-passwordless,
https://supabase.com/docs/guides/auth/auth-smtp,
https://supabase.com/docs/guides/database/postgres/row-level-security.
