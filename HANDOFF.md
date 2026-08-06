# Doubleday OS — Handoff / Status Notes

Last updated: August 5, 2026 (Phase 3 started — User.passwordHash added,
GapAssessment WON-hydration backfill fixed; client login and dashboard not
yet built)

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
`apps/client-portal`, `apps/consultant-portal`, `apps/api`, `packages/documents`,
`packages/audit-engine`, `packages/iso-engine`, `packages/ui`, `packages/shared`,
all of `services/*`.

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

**Not yet applied by the user** — needs `npx prisma migrate dev` run against
the real DB, same as every schema change so far.

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

## Remaining next steps (in order)

1. Build client login (separate from `/admin`'s shared password) — likely
   `apps/client-portal`, which is currently a stub with no code at all.
2. Build the read-only dashboard per the scope above.
3. Build the admin-side "create a client login" action (probably added to
   the WON confirmation card in `apps/admin/app/leads/[id]/page.tsx`, since
   that's the natural moment an admin would want to issue credentials).
4. Before or alongside step 2: handle the pre-existing-WON-deals gap noted
   under Step 2 above.

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
  dependencies were added in a round they didn't apply yet — this has
  tripped the handoff once already (the `docx` package).
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
