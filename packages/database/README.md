# Database Package

Prisma schema, migrations, database client, and CRM read/write helpers, shared by `apps/website`, `apps/admin`, and `apps/client-portal`.

## What's here

- `prisma/schema.prisma` — the full data model. Currently in real use: `Lead`, `Opportunity`, `GapAssessment`, `GapAssessmentAnswer`, `Standard`, `StandardClause` (self-referencing parent/child for clause → sub-clause), `Organization`, `Project`, `User` (now with `passwordHash`, used by `apps/client-portal`'s own auth — see `packages/auth`), `OrganizationMembership`. Everything else in the schema (sites, documents, audits, training, assets, etc.) is modeled for future phases but not yet written to by any app.
- `prisma/seed.mjs` — seeds the three live standards (ISO 9001, 45001, 14001) with their assessable sub-clauses. Each sub-clause carries `assessmentQuestion`, `requiredDocuments`, and `highRisk`, which is what `apps/website`'s gap assessment and `apps/admin`'s proposal generator both read from. **This is where assessment content lives** — edit here, not in the apps, then re-run `npm run seed`.
- `src/client.ts` — the shared Prisma client singleton.
- `src/crm.ts` — read/write helpers used by `apps/admin`:
  - `listAssessmentLeads` / `getLeadWithAssessment` — read models for the admin leads list and detail views. `getLeadWithAssessment` also returns the linked organization's `memberships` (with user email), so the admin UI can show whether a client login already exists.
  - `updateOpportunityStage` / `updateOpportunityEstimate` — pipeline mutations.
  - `hydrateWonOpportunity` — auto-creates a client `Organization` + `ACTIVE` `Project` when an opportunity is marked `WON`, advances the `Lead` to `CONVERTED`, and backfills `organizationId` onto the lead's `GapAssessment` record(s) (added after the original version missed this — without it, a client dashboard querying `Organization → GapAssessment` would find nothing). Idempotent and transactional. Called automatically by `updateOpportunityStage` when the target stage is `WON`. **Note:** the `GapAssessment` backfill only applies going forward — see `scripts/backfill-won-assessments.mjs` below for opportunities won before this fix.
  - `createClientLogin(organizationId, email, passwordHash)` — creates or reuses a `User` by email, sets their password hash, and grants `CLIENT_ADMIN` membership on the given organization. Idempotent on email (upserts), so calling it again for the same email resets their password rather than erroring. Used by `apps/admin`'s "create client login" form — pass it an already-hashed password (see `packages/auth/src/password.ts`), never a plaintext one.
- `src/client-portal.ts` — read model for `apps/client-portal`, deliberately kept separate from `crm.ts` (which is admin-only). `getClientProjectView(organizationId)` returns everything the client dashboard shows — project status, readiness score, gaps, required documents — scoped strictly to the one organization passed in. The caller must get `organizationId` from a verified session, never from user input; this function doesn't re-check authorization itself, same pattern as `crm.ts`.
- `scripts/backfill-won-assessments.mjs` — one-off repair for `GapAssessment` rows won before `hydrateWonOpportunity` started backfilling `organizationId` automatically. Plain JS against `@prisma/client` directly (same pattern as `prisma/seed.mjs`), not importing from `src/` — this is deliberate: `tsx` (used elsewhere in this repo for standalone script testing) showed an unexplained module-export-resolution quirk on some files in this project during development, so this script avoids depending on it. Safe to run more than once — only touches rows still missing `organizationId`. Run via `npm run backfill`.

## Commands

Run from this directory:

```bash
npm run generate   # regenerate the Prisma client after any schema change
npm run migrate     # create + apply a migration (prisma migrate dev)
npm run seed         # apply prisma/seed.mjs
npm run backfill     # apply scripts/backfill-won-assessments.mjs (safe to re-run)
npm run studio       # open Prisma Studio
```

## Environment

Requires `DATABASE_URL` in `.env` in this directory. If using Supabase, use the **connection pooler** string (port `6543`, `aws-0-<region>.pooler.supabase.com`) rather than the direct connection (port `5432`, `db.<ref>.supabase.co`) — the direct connection uses IPv6 by default, which some networks silently drop, producing a `P1001` "can't reach database server" error that looks like an outage but is actually a routing issue.
