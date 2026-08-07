# Client Portal

Client-facing workspace for Doubleday's customers. Next.js (App Router), TypeScript, Tailwind. Runs on `http://localhost:3002`.

After signing in, a client sees a dashboard: their project status, ISO readiness score, a list of open gaps (priority ones called out separately) each with a status toggle they control (Not started / In progress / Acknowledged — self-reported, read-only to Doubleday), and the documents they'll likely need. No document upload, messaging, or Doubleday-side editing of client status yet — deliberately, see `HANDOFF.md` at the repo root for what's next.

## What's here

- `app/page.tsx` — the dashboard. Reads the session cookie server-side to get the signed-in client's `organizationId`, then calls `getClientProjectView` (`packages/database/src/client-portal.ts`) to fetch everything scoped to that one organization. Fails closed (shows nothing, not another client's data) if the session is somehow missing despite middleware.
- `app/gap-status-selector.tsx` + `app/gap-status-actions.ts` — the per-gap status toggle and its server action. The action re-derives `organizationId` from the session itself rather than trusting it as a parameter — a server action's arguments are still client-supplied input, so the only trustworthy source of "which org can this user write to" is the session, checked server-side, same as the dashboard read.
- `app/login/page.tsx` + `app/api/login/route.ts` — email + password login (see "Authentication" below).
- `app/api/logout/route.ts` — clears the session cookie.

## Authentication — separate from apps/admin, deliberately

This is **not** the same shared-password gate as `apps/admin`. Admin auth only needs to answer "is this one of Doubleday's ~2 trusted staff" — a shared password is proportionate for that. Client auth needs to answer "is this person authorized to see *this specific organization's* data and no other's" — that's an isolation requirement between clients, not just a keep-out gate, so it needs real per-user identity.

- Each client gets a real `User` row (email + `passwordHash`, hashed with scrypt via `@doubleday/auth/password` — see that package for why scrypt, not a fast hash) and an `OrganizationMembership` tying them to exactly one `Organization`.
- The session cookie (`lib/session.ts`) carries both `userId` and `organizationId`, HMAC-signed with `CLIENT_SESSION_SECRET` — a **different secret from `apps/admin`'s `SESSION_SECRET`**. This is intentional: sharing a secret between the two systems would let either forge the other's sessions.
- `middleware.ts` gates every route except `/login` and `/api/login`, same shape as admin's but checking this app's own session.
- The dashboard itself re-derives `organizationId` from the session on every load rather than trusting anything passed from the client — the isolation guarantee lives in the session, checked server-side, every time.

## How a client gets an account

There's no self-signup. An admin creates the login from `apps/admin`'s lead detail page, on the WON confirmation card, after a deal is won and the client's `Organization` exists. The admin sets an email and a password and hands it to the client directly (phone/email/in person) — there's no automated email delivery yet, since that needs transactional email infrastructure that doesn't exist.

## A known data gap, and its fix

`GapAssessment` records created before a fix in `hydrateWonOpportunity` (see `packages/database/src/crm.ts`) won't have `organizationId` set, so a client whose deal was won before that fix won't see their assessment data here even though it exists. Run `npm run backfill --workspace=@doubleday/database` once to repair any pre-existing won deals — safe to run more than once, it only touches rows still missing `organizationId`.

## Environment

Requires two variables — copy `.env.example` to `.env.local`:

- `DATABASE_URL` — same connection string used elsewhere in the monorepo.
- `CLIENT_SESSION_SECRET` — a random 32+ character string, **different from** `apps/admin`'s `SESSION_SECRET`. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Commands

```bash
npm run dev      # http://localhost:3002 (from repo root: npm run dev:client)
npm run build
npm run start
```
