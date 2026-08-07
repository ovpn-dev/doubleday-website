# Doubleday OS — Handoff / Status Notes

Last updated: August 7, 2026 — Phase 1, 2, and the Phase 3 MVP (login +
read-only dashboard) are built and user-tested end-to-end, twice, across
both a pre-existing lead and two fresh leads (ISO 9001 and ISO 45001).
Step 5 (client can mark gaps in-progress/acknowledged) is built, not yet
tested.

This file exists so work can resume cleanly in a new session or with a
different tool, without relying on chat history. Read this file, then
`README.md`, then the relevant app's own README.

**When you complete a step, list files touched** (path + one-line
purpose). Full reasoning belongs here only while a decision is still open
or contested — once something's built and tested, condense it. Rationale
for settled decisions still lives in code comments and READMEs; this file
doesn't need to repeat it.

## Built and tested — summary

| Area | What | Where |
|---|---|---|
| Marketing + assessment | Public site, ISO 9001/45001/14001 gap assessment, weighted scoring, per-standard questions | `apps/website` |
| Assessment content | Questions, required docs, `highRisk` flags per sub-clause | `packages/database/prisma/seed.mjs` — edit here, not in apps |
| CRM | Leads list, pipeline stages, proposal `.docx` generation (regenerated fresh every download, nothing stored) | `apps/admin` |
| WON hydration | Marking `WON` auto-creates `Organization` + `Project`, advances `Lead` to `CONVERTED`, backfills `GapAssessment.organizationId`. Idempotent + transactional. | `hydrateWonOpportunity` in `packages/database/src/crm.ts` |
| Admin auth | Shared password (`ADMIN_PASSWORD`), HMAC-signed session cookie. Deliberately not per-user — see `apps/admin/README.md` for why that's proportionate here. | `apps/admin/middleware.ts`, `apps/admin/lib/session.ts` |
| Client auth | Real per-user login (`User.passwordHash` via scrypt, `OrganizationMembership`), separate session system/secret from admin. Admin issues logins from a won lead's page. | `apps/client-portal`, `packages/auth/src/password.ts` |
| Client dashboard | Read-only project status, readiness score, gaps, required documents, scoped to the signed-in user's own organization | `apps/client-portal/app/page.tsx`, read model in `packages/database/src/client-portal.ts` |
| Docs | Root `README.md`, every app/package README, `DEPLOYMENT_GUIDE.md` — all current | — |

## What's still a stub (zero code, README-only)
`apps/consultant-portal`, `apps/api`, `packages/documents`,
`packages/audit-engine`, `packages/iso-engine`, `packages/ui`,
`packages/shared`, all of `services/*`.

## Step 5 — DONE (built, not yet tested): client can mark gaps in-progress/acknowledged

Closes the "read-only ceiling" on the dashboard without opening document
uploads (deliberately deferred — uploads need storage/versioning/approval,
a different-sized project; see the user's own reasoning if this comes up
again). **Constraint: client-only input** — admin can see it, never edit it.

Files:
- `packages/database/prisma/schema.prisma` — new `GapClientStatus` enum, `clientStatus` field on `GapAssessmentAnswer`.
- `packages/database/prisma/migrations/20260807090000_gap_client_status/migration.sql` — new, hand-written (no Prisma engine access in this sandbox, same as every migration so far).
- `packages/database/src/client-portal.ts` — `gaps[]` now includes `id` + `clientStatus`; new `updateGapClientStatus(organizationId, answerId, status)`, ownership verified by explicit fetch-then-check-then-update (not a relation filter inside `updateMany`'s `where` — that pattern wasn't confirmed safe in this codebase, so used the version that's certain to be correct for a security check).
- `apps/client-portal/app/gap-status-actions.ts` — new server action, re-derives `organizationId` from session (never trusts a client-supplied value).
- `apps/client-portal/app/gap-status-selector.tsx` — new 3-way toggle.
- `apps/client-portal/app/page.tsx` — toggle wired into both gap lists.
- `apps/admin/app/leads/[id]/page.tsx` — read-only per-answer status tag + "Client progress: X/Y acknowledged" summary card.

**Not yet tested.** Needs: `npx prisma migrate dev`, toggle a gap as the
client, confirm it persists on refresh, confirm the admin summary
reflects it, confirm admin has no way to edit it.

## Remaining next steps

1. User tests Step 5 (see above).
2. Nothing else currently agreed/scoped — next phase needs a fresh
   decision, same as every phase boundary so far.

## Known constraints — still relevant, don't rediscover these

- **No live DB/Next.js/Prisma engine access in this sandbox** — every
  schema change is hand-verified against actual field names; pure logic
  (docx builder, session signing, password hashing) gets compiled and run
  standalone with real test cases where possible. Nothing gets a real
  `npm run build` or `prisma migrate dev` until the user runs it. Real
  bugs have been caught this way before (Edge runtime crypto
  incompatibility, a wrong relative import path, a same-tab download
  racing an in-flight server action) — keep verifying what's checkable,
  say plainly what isn't.
- **Supabase**: use the connection pooler
  (`aws-0-<region>.pooler.supabase.com:6543`), not the direct connection
  (`db.<ref>.supabase.co:5432`) — direct defaults to IPv6, which silently
  fails on some networks and looks like a DB outage. Documented in
  `packages/database/README.md`.
- **Re-run `npm install`** after any round that adds a dependency or a new
  workspace — has tripped this project up before (the `docx` package,
  then the entire `apps/client-portal` workspace).
- **`tsx` has an unexplained quirk**: a TypeScript file with a correct
  named export sometimes reports only `{ default }` when introspected via
  `tsx`, even though `tsc` compiles it cleanly. No root cause found across
  two occurrences. For standalone scripts outside Next.js's bundler,
  prefer plain JS against `@prisma/client` directly (see `prisma/seed.mjs`,
  `scripts/backfill-won-assessments.mjs`) over importing TS source via `tsx`.
- The user (Paul) is the real test suite for anything Next.js-specific —
  he runs every round against a live Supabase DB and real `npm run dev`.
