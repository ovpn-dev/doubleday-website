# Website Application

The public Doubleday marketing website and ISO gap assessment tool. Next.js (App Router), TypeScript, Tailwind. Runs on `http://localhost:3000`.

The previous Vite application that lived at the repository root has been fully migrated here and no longer exists.

## What's here

- `app/page.tsx` — marketing homepage.
- `app/assessment/page.tsx` — the ISO gap assessment. Loads clause-level questions per standard from `/api/standards`, computes a parent-clause-weighted readiness score client-side, and submits the result to `/api/assessments`.
- `app/api/standards/route.ts` — returns a standard's assessable sub-clauses (question, required documents, high-risk flag) from the database.
- `app/api/assessments/route.ts` — persists a submitted assessment: creates a `Lead` + `Opportunity`, then a `GapAssessment` with per-clause `GapAssessmentAnswer` records and the computed score/gap/risk output.

## Adding or changing assessment questions

Assessment content (clauses, questions, required documents, risk flags) lives in `packages/database/prisma/seed.mjs`, not in this app. Edit the seed data and re-run `npm run seed --workspace=@doubleday/database`, then restart the dev server — this app always reads current data from the database, it doesn't hardcode question content.

## Environment

Requires `DATABASE_URL` to be resolvable at runtime (via `.env`/`.env.local` in this directory, or inherited from the monorepo root depending on your setup — see the root `DEPLOYMENT_GUIDE.md`).

## Commands

```bash
npm run dev     # http://localhost:3000
npm run build
npm run start
```
