# Admin Application

Internal operations console for Doubleday Expressions. Next.js (App Router), TypeScript, Tailwind. Runs on `http://localhost:3001` (separate port from the public website so both can run at once locally).

**Not publicly deployed and has no authentication yet.** Add access control before this is reachable outside your local machine or a private network — see "Known gaps" below.

## What's here

- `app/page.tsx` — leads list: every gap-assessment submission, sorted by readiness score ascending (lowest-scoring prospects — typically the clearest consulting pitch — surface first). Shows standard, score, priority-gap count, pipeline stage, and submission date.
- `app/leads/[id]/page.tsx` — lead detail: full clause-by-clause assessment breakdown, priority clauses, required documents, pipeline stage control, and the proposal panel. Also shows a read-only confirmation card once a deal is won and its client `Organization`/`Project` records exist.
- `app/leads/[id]/stage-selector.tsx` + `actions.ts` — moves the linked `Opportunity` through Discovery → Assessment → Proposal → Negotiation → Won/Lost. Marking an opportunity **Won** automatically creates a client `Organization` and an `ACTIVE` `Project` (see `hydrateWonOpportunity` in `packages/database/src/crm.ts`) — idempotent, so re-saving the same stage doesn't create duplicates.
- `app/leads/[id]/proposal-panel.tsx` — set an estimated engagement value (₦) and download a Word proposal.
- `app/api/leads/[id]/proposal/route.ts` + `document.ts` — generates the proposal `.docx` on request from live assessment data. Nothing is persisted; the file is rebuilt fresh on every download, so it's never stale relative to the assessment or estimate.

## Known gaps

- No authentication — anyone with network access to this app can see every lead's contact info and assessment answers. Add access control before deploying anywhere reachable beyond your own machine.
- No UI yet for the `Organization`/`Project` records created on Won — by design, for now (see root README's workflow notes). The confirmation card on the lead detail page is the only place they're currently visible.

## Environment

Requires `DATABASE_URL`. Copy `.env.example` to `.env.local` and set it to the same connection string used by `packages/database/.env`.

## Commands

```bash
npm run dev      # http://localhost:3001 (from repo root: npm run dev:admin)
npm run build
npm run start
```
