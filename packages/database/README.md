# Database Package

Prisma schema, migrations, database client, and CRM read/write helpers, shared by `apps/website` and `apps/admin`.

## What's here

- `prisma/schema.prisma` — the full data model. Currently in real use: `Lead`, `Opportunity`, `GapAssessment`, `GapAssessmentAnswer`, `Standard`, `StandardClause` (self-referencing parent/child for clause → sub-clause), `Organization`, `Project`. Everything else in the schema (sites, documents, audits, training, assets, etc.) is modeled for future phases but not yet written to by any app.
- `prisma/seed.mjs` — seeds the three live standards (ISO 9001, 45001, 14001) with their assessable sub-clauses. Each sub-clause carries `assessmentQuestion`, `requiredDocuments`, and `highRisk`, which is what `apps/website`'s gap assessment and `apps/admin`'s proposal generator both read from. **This is where assessment content lives** — edit here, not in the apps, then re-run `npm run seed`.
- `src/client.ts` — the shared Prisma client singleton.
- `src/crm.ts` — read/write helpers used by `apps/admin`:
  - `listAssessmentLeads` / `getLeadWithAssessment` — read models for the leads list and detail views.
  - `updateOpportunityStage` / `updateOpportunityEstimate` — pipeline mutations.
  - `hydrateWonOpportunity` — auto-creates a client `Organization` + `ACTIVE` `Project` when an opportunity is marked `WON`, and advances the `Lead` to `CONVERTED`. Idempotent (checks for an existing `organizationId` before creating anything) and transactional. Called automatically by `updateOpportunityStage` when the target stage is `WON` — not meant to be called standalone except for backfilling.

## Commands

Run from this directory:

```bash
npm run generate   # regenerate the Prisma client after any schema change
npm run migrate     # create + apply a migration (prisma migrate dev)
npm run seed         # apply prisma/seed.mjs
npm run studio       # open Prisma Studio
```

## Environment

Requires `DATABASE_URL` in `.env` in this directory. If using Supabase, use the **connection pooler** string (port `6543`, `aws-0-<region>.pooler.supabase.com`) rather than the direct connection (port `5432`, `db.<ref>.supabase.co`) — the direct connection uses IPv6 by default, which some networks silently drop, producing a `P1001` "can't reach database server" error that looks like an outage but is actually a routing issue.
