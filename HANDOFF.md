# Doubleday OS — Handoff / Status Notes

Last updated: August 5, 2026 (Phase 3 in progress — User.passwordHash and
GapAssessment backfill applied to the real DB; client login system built
end-to-end (password hashing, session, middleware, login page, admin-side
login creation) but not yet tested by the user; dashboard still not built)

This file exists so work can resume cleanly in a new session or with a different
tool, without relying on chat history. If you're picking this up fresh: read
this file, then `README.md`, then the relevant app's own README.

**When you complete a step, list the exact files touched under it** (new
files and edited files, full paths from repo root). This makes it possible
to apply a round's changes without re-diffing the whole zip, and makes gaps
obvious (e.g. "I edited crm.ts but the handoff doesn't mention it" is a
signal something's out of sync).

## What's actually built and working (verified by real testing, not just code review)

### Phase 1 — Marketing site + gap assessment (`apps/website`) — DONE
- Public site + a real ISO gap assessment: `/assessment`.
- Per-standard question sets (ISO 9001 = 27 sub-clauses, 45001 = 20, 14001 = 18),
  each with its own assessment question, required documents, and a `highRisk` flag.
  All of this content lives in `packages/database/prisma/seed.mjs` — edit there,
  not in the app.
- Scoring: each top-level clause (4–10) is averaged from its sub-clause answers,
  then clauses are averaged together (not a flat average across all questions —
  this was a deliberate fix from the original codex version).
- Submission creates a `Lead` + `Opportunity`, and a `GapAssessment` with
  per-clause `GapAssessmentAnswer` records, plus computed `overallScore`,
  `readinessLabel`, `highRiskGaps[]`, `requiredDocumentGaps[]`.
- **Tested end-to-end by the user**, all three standards, correct question
  counts confirmed, submission → email summary flow confirmed.

### Phase 2 — CRM (`apps/admin`) — core slice DONE
- Runs on port 3001, separate from the website (port 3000).
- `/` — leads list, sorted by readiness score ascending (lowest score = most
  sales-ready, surfaces first). Color-coded stage badges (green=WON, grey=LOST).
- `/leads/[id]` — full clause-by-clause breakdown, priority gaps, required
  documents, a pipeline stage dropdown (Discovery → Assessment → Proposal →
  Negotiation → Won/Lost), and a proposal panel.
- **Proposal generation**: downloads a `.docx` built fresh on every request
  (nothing stored — regenerated from live DB data each time, per an explicit
  decision). `apps/admin/app/api/leads/[id]/proposal/document.ts` is the
  builder (uses the `docx` npm package), `route.ts` streams it. This was
  actually rendered and visually verified during development (compiled,
  ran through LibreOffice, inspected as images) — not just reviewed.
- **WON hydration**: marking an opportunity `WON` auto-creates a client
  `Organization` + an `ACTIVE` `Project`, backfills `organizationId` onto
  the `Lead`/`Opportunity`, advances the lead to `CONVERTED`. Idempotent
  (checks for an existing org link first) and transactional. Logic lives in
  `hydrateWonOpportunity` in `packages/database/src/crm.ts`. A read-only
  green confirmation card shows this on the lead detail page — deliberately
  no dashboard/UI beyond that card, per an explicit "seed the data, skip the
  screens" decision.
- **Auth**: shared single password (`ADMIN_PASSWORD`), not per-user accounts.
  Session cookie is HttpOnly + HMAC-signed (`apps/admin/lib/session.ts`,
  built on Web Crypto so it works in both Node and Next's Edge middleware
  runtime — this was a real bug caught and fixed: Node's `crypto` module
  isn't available in Edge middleware). Middleware (`apps/admin/middleware.ts`)
  gates every route except `/login` and `/api/login`. This was actually
  compiled and run with 9 real test cases (forgery rejection, tampering
  rejection, expiry, password compare) — all passing.
  **This is deliberately NOT the right auth model for clients** — see below.

### Documentation
- Root `README.md`, `apps/website/README.md`, `apps/admin/README.md`,
  `packages/database/README.md`, and `DEPLOYMENT_GUIDE.md` are all current
  as of this session. (The root and website READMEs previously described a
  Vite app that no longer exists on disk at all — that drift predated this
  work and has been fixed.)

## What's still a stub (zero code, README-only)
`apps/consultant-portal`, `apps/api`, `packages/documents`,
`packages/audit-engine`, `packages/iso-engine`, `packages/ui`, `packages/shared`,
all of `services/*`. (`apps/client-portal` moved out of this list this
session — it now has a working login system, see below.)

## In progress right now — Phase 3, not yet built

**Decision made, implementation partly started.** Build a minimal read-only
client dashboard. Scope, as agreed with the user:

Show:
1. Project header (name, status, timeline) — read-only.
2. Readiness score from their gap assessment.
3. List of gaps (clause + plain-English summary).
4. Required documents list (reuse the logic already in the proposal
   generator — don't rebuild it).

Explicitly NOT building yet: task tracking, document upload/acknowledgement,
messaging, any editing.

**Key design decision made:** client auth must be genuinely separate from
admin auth, not the same shared-password approach. Reasoning: admin auth
only needs to answer "is this one of ~2 trusted internal people" — shared
password is proportionate. Client auth needs to answer "is this person
authorized to see *this specific organization's* data and no other's" —
that's an isolation requirement, not just a keep-out gate, so it needs real
per-user identity tied to a specific `Organization`. The `User` and
`OrganizationMembership` models already exist in the schema for exactly
this, plus `packages/auth`'s role/permission map (`CLIENT_ADMIN`,
`CLIENT_VIEWER`, etc.) — none of it has ever been wired to anything working
yet.

**Credential creation decision made:** simple and manual for now — an admin
manually sets a password for a client and emails it to them. Explicitly
NOT building magic-link email auth yet, since that needs transactional
email infrastructure (sender domain, deliverability) that doesn't exist.

### Step 1 — DONE: add password storage to User
`User` had `authProviderId` (reserved for an eventual external auth
provider) but no field to store a password hash for our own auth. Added
`passwordHash String?` — nullable, since a future provider-backed user
wouldn't need one. Migration hand-written (same reason as before: Prisma
engine binaries aren't reachable in this sandbox, so `prisma migrate dev`
can't be run here — the migration file matches the schema change and
follows the same hand-written pattern as `20260802120000_gap_assessment_scoring`).

Files touched:
- `packages/database/prisma/schema.prisma` (added `passwordHash` to `User`)
- `packages/database/prisma/migrations/20260805120000_user_password_auth/migration.sql` (new)

**Applied by the user** — `npx prisma migrate dev` ran successfully against
the real DB.

### Step 2 — DONE: backfill GapAssessment.organizationId on WON
`GapAssessment` links via `leadId` (set at submission time, before any
`Organization` exists) and separately via `organizationId` (nullable) — but
nothing ever populated the latter. A client dashboard querying
`Organization → GapAssessment` would find nothing for a won client, even
though the assessment data exists. Fixed by adding a
`tx.gapAssessment.updateMany({ where: { leadId }, data: { organizationId } })`
inside `hydrateWonOpportunity`'s existing transaction — same idempotency
and atomicity guarantees as the rest of that function, no new ones needed.

**Real gap this doesn't cover, worth knowing:** this only runs on *new*
WON transitions going forward. Any opportunity already marked WON before
this fix (e.g. "okok schools" from earlier testing) still has a
`GapAssessment` with `organizationId: null` — it won't show up correctly
once the dashboard is built, until it's backfilled. A one-off script or
manual `UPDATE` may be needed for pre-existing won deals before the
dashboard ships, depending on how many exist by then.

Files touched:
- `packages/database/src/crm.ts` (edited — added the `updateMany` call
  inside `hydrateWonOpportunity`)

### Step 3 — DONE (built, not yet tested by the user): client login system

Built a complete, separate auth system for `apps/client-portal`, distinct
from `apps/admin`'s shared password (see the design decision above for
why). Pieces:

- **Password hashing** — `packages/auth/src/password.ts`, new file.
  `hashPassword`/`verifyPassword` on Node's `scrypt` (memory-hard, correct
  choice for passwords — NOT the same as the HMAC signing used for session
  cookies, which is fast-by-design and would be wrong here). New export
  added to `packages/auth/package.json` (`./password`). **Actually
  compiled and run with 7 real test cases** (correct/wrong password,
  salting produces different hashes but both still verify, malformed hash
  handled safely without throwing, case sensitivity) — all passing.
- **Client portal app scaffold** — `apps/client-portal/*`, new Next.js app
  (previously a README-only stub), same config pattern as `apps/admin`,
  runs on port 3002.
- **Session signing** — `apps/client-portal/lib/session.ts`, new file. Same
  HMAC-over-Web-Crypto shape as `apps/admin/lib/session.ts` (Edge-runtime
  safe), but: (a) a completely separate cookie name
  (`doubleday_client_session` vs admin's `doubleday_admin_session`) and
  separate secret env var (`CLIENT_SESSION_SECRET` vs `SESSION_SECRET`) —
  deliberately, so the two systems can never forge each other's sessions
  even if ever deployed on the same domain; (b) the payload carries
  `userId` AND `organizationId`, not just "is this valid" — every client
  portal query has to be scoped to one organization, so that scoping
  travels with the signed session itself rather than being looked up
  separately in a way that could be tampered with. Deliberately avoided
  Node's `Buffer` for the base64url encoding (used `btoa`/`atob` +
  `TextEncoder`/`TextDecoder` instead) since Buffer's Edge-runtime support
  has genuinely changed across Next.js versions and the search results on
  this were mixed — safer not to depend on it either way. **Actually
  compiled and run with 6 real test cases** (userId/organizationId
  round-trip correctly, tampered token rejected, garbage/undefined
  rejected, special characters in ids survive) — all passing.
- **Middleware** — `apps/client-portal/middleware.ts`, new file. Same gate
  shape as admin's.
- **Login route + page** — `apps/client-portal/app/api/login/route.ts` +
  `app/login/page.tsx`, new files. Looks up `User` by email, verifies
  password via `@doubleday/auth/password`, requires at least one
  `OrganizationMembership` to exist, issues the session scoped to that
  membership's `organizationId`. Deliberately generic error message
  ("Incorrect email or password") for every failure mode (no such user, no
  password set, wrong password, no membership) so a caller can't probe for
  which emails exist.
- **Logout route** — `apps/client-portal/app/api/logout/route.ts`, new file.
- **Placeholder homepage** — `apps/client-portal/app/page.tsx`, new file.
  Just confirms login worked and offers sign-out; will be replaced by the
  real dashboard in the next step.
- **Admin-side login creation** — the actual way a `User` +
  `OrganizationMembership` first come into existence:
  - `packages/database/src/crm.ts` (edited) — added
    `createClientLogin(organizationId, email, passwordHash)`. Upserts the
    `User` by email (so calling it again resets their password rather than
    erroring — lets an admin "recreate" a login to reset it) and upserts
    the `OrganizationMembership` with role `CLIENT_ADMIN`. Also extended
    `getLeadWithAssessment` to fetch the organization's existing
    `memberships` (with user email) so the admin UI can show whether a
    login already exists.
  - `apps/admin/app/leads/[id]/actions.ts` (edited) — added
    `createClientPortalLogin` server action: validates email format and an
    8-character password minimum, hashes the password, calls
    `createClientLogin`.
  - `apps/admin/app/leads/[id]/client-login-form.tsx` (new) — the actual
    form, rendered inside the WON confirmation card. Password input is
    deliberately `type="text"` not `type="password"` — the admin is
    *setting* a password to hand to the client, not entering a secret of
    their own, so visibility helps avoid a typo that locks the client out.
  - `apps/admin/app/leads/[id]/page.tsx` (edited) — wired the form into the
    WON confirmation card, passing existing member emails.
  - `apps/admin/package.json` (edited) — added `@doubleday/auth` dependency
    (wasn't there before; admin never needed password hashing until now).
- **Env examples + root scripts** — `apps/client-portal/.env.example` (new,
  needs `DATABASE_URL` + `CLIENT_SESSION_SECRET`), root `package.json`
  (edited — added `dev:client`/`build:client`/`start:client`).
- **Docs** — `apps/client-portal/README.md` (rewritten from stub),
  `packages/auth/README.md` (rewritten from stub — now documents the real
  password module and notes the role/permission map is still unused),
  `packages/database/README.md`, root `README.md`, `DEPLOYMENT_GUIDE.md`
  (all edited to reflect the above).

**Not yet tested by the user** — this is the first round where the
Next.js-level wiring (not just the standalone crypto/password logic)
hasn't been run for real yet. Needs: `npm install` (new deps:
`@doubleday/auth` added to admin; client-portal is an entirely new
workspace), set `CLIENT_SESSION_SECRET` in
`apps/client-portal/.env.local`, then a real end-to-end pass: create a
login from a won lead in admin, sign in at the client portal with those
exact credentials, confirm the placeholder page loads, confirm signing out
and back in works, confirm a wrong password is rejected.

## Remaining next steps (in order)

1. User tests Step 3 end-to-end (see above) and reports back.
2. Build the read-only dashboard — project header, readiness score, gap
   list, required documents (reuse the proposal generator's gap logic,
   don't rebuild it). This is the last piece of the originally-agreed
   Phase 3 MVP scope.
3. Handle the pre-existing-WON-deals gap noted under Step 2 above — any
   lead marked WON before that fix still has `GapAssessment.organizationId:
   null` and needs a manual backfill before the dashboard will show its
   data correctly.

## Known constraints worth knowing about upfront

- **This assistant (Claude, working in a sandboxed environment) cannot run
  a live Next.js dev server, cannot reach a real Postgres database, and
  cannot download Prisma's engine binaries** (network allowlist blocks
  `binaries.prisma.sh`). Every schema/route change has been hand-verified
  against the actual Prisma schema field names, and where possible
  (pure logic — the docx builder, the session signing) actually compiled
  and run standalone with real test cases. But nothing gets a real
  `npm run build` or `prisma migrate dev` until the user runs it locally.
  This has caught real bugs before (Edge runtime crypto incompatibility,
  a wrong relative import path, dead code) — the pattern of "build it,
  then say plainly what wasn't verified" has been the reliable one.
- **Supabase connection**: must use the connection pooler
  (`aws-0-<region>.pooler.supabase.com:6543`), not the direct connection
  (`db.<ref>.supabase.co:5432`) — the direct connection defaults to IPv6,
  which the user's network silently dropped, producing a `P1001` error
  that looked like a DB outage but wasn't. Already fixed and documented
  in `packages/database/README.md`.
- **Whoever continues this should re-run `npm install`** if new
  dependencies were added, or a new workspace (app/package) was added, in a
  round they didn't apply yet. This has tripped the handoff once already
  (the `docx` package). This round adds a genuinely new workspace
  (`apps/client-portal`) plus a new dependency on an existing one
  (`apps/admin` now depends on `@doubleday/auth`) — both need `npm install`
  from the repo root before anything in Step 3 will run.
- The user (Paul) tests every round personally against a real Supabase DB
  and real `npm run dev` — that real-world test has been the actual
  verification step for the Next.js-specific parts, not anything done in
  this sandbox.

## What "done" means in this codebase

Every round in this project has followed the same pattern, worth continuing:
build it, then actually try to verify it (compile standalone, run real test
cases, render and visually inspect output) rather than just reviewing code
by eye — and when verification isn't possible (no live DB, no Prisma engine
access), say so plainly rather than imply confidence that wasn't earned.
