# Doubleday OS

Doubleday OS is the product platform for Doubleday Expressions: a compliance and management-systems operating system for ISO consultants and their clients.

The target OS architecture, domain model, and phased delivery scope are documented in [`docs/`](docs/).

- [Product scope](docs/PRODUCT_SCOPE.md)
- [Core domain model](docs/DOMAIN_MODEL.md)
- [Architecture direction](docs/ARCHITECTURE.md)

## What's live today

| App | Path | Status |
|---|---|---|
| Marketing website + ISO gap assessment | [`apps/website`](apps/website) | Live — public-facing, Next.js |
| Internal admin (leads, CRM pipeline, proposals) | [`apps/admin`](apps/admin) | Live — internal-only, Next.js, runs on port 3001 |
| Client portal | [`apps/client-portal`](apps/client-portal) | Live — login + read-only dashboard, Next.js, runs on port 3002 |

Everything else under `apps/`, `packages/`, and `services/` is still a stub (see each directory's own README for its planned scope). The original Vite marketing site that used to live at the repository root has been fully replaced by `apps/website` and no longer exists in this repo.

## Current end-to-end workflow

1. A prospect completes the ISO gap assessment on the public website (`apps/website/app/assessment`), answering clause-level questions specific to their chosen standard (ISO 9001, 45001, or 14001).
2. Submission creates a `Lead` and `Opportunity` and computes a weighted readiness score, priority (high-risk) gap list, and required-documents list — all persisted via `packages/database`.
3. A consultant reviews submissions in the admin app (`apps/admin`), sorted by readiness score, and opens a lead to see the full clause-by-clause breakdown.
4. The consultant can move the opportunity through its pipeline stage (Discovery → Assessment → Proposal → Negotiation → Won/Lost), set an estimated engagement value, and download a Word proposal generated on the fly from the assessment's gaps — nothing is stored, it's rebuilt from live data on every download.
5. Marking an opportunity **Won** automatically creates a client `Organization` and an `ACTIVE` `Project` record, and advances the lead to `CONVERTED` — seeding the data model for the client-facing work (document control, audits, etc.) that hasn't been built yet, without requiring a manual backfill later.
6. From the won lead's page, an admin can issue that client a portal login (email + a password the admin sets and hands over directly — no self-signup, no automated email yet). The client signs in at `apps/client-portal` and sees a read-only dashboard: project status, their readiness score, open gaps (priority ones called out), and the documents they'll need — all reusing the same gap/document logic as the proposal generator, not a separate calculation.

## Getting started

See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for local setup, database configuration, and deployment notes.

```bash
npm install

# public website — http://localhost:3000
npm run dev

# internal admin — http://localhost:3001
npm run dev:admin

# client portal — http://localhost:3002
npm run dev:client
```

## Support

For questions about the Doubleday Expressions business itself:
- Email: doubledayexpressions@gmail.com
- Phone: +234 803 335 3229
