# Admin Application

Internal operations console for Doubleday Expressions. Next.js (App Router), TypeScript, Tailwind. Runs on `http://localhost:3001` (separate port from the public website so both can run at once locally).

Gated behind a single shared password (see "Authentication" below) — not per-person accounts. Fine for a couple of trusted internal users; not a substitute for real multi-user auth once clients need their own logins (that's `packages/auth`'s job, for Phase 3+).

## What's here

- `app/page.tsx` — leads list: every gap-assessment submission, sorted by readiness score ascending (lowest-scoring prospects — typically the clearest consulting pitch — surface first). Shows standard, score, priority-gap count, pipeline stage, and submission date.
- `app/leads/[id]/page.tsx` — lead detail: full clause-by-clause assessment breakdown, priority clauses, required documents, pipeline stage control, and the proposal panel. Also shows a read-only confirmation card once a deal is won and its client `Organization`/`Project` records exist.
- `app/leads/[id]/stage-selector.tsx` + `actions.ts` — moves the linked `Opportunity` through Discovery → Assessment → Proposal → Negotiation → Won/Lost. Marking an opportunity **Won** automatically creates a client `Organization` and an `ACTIVE` `Project` (see `hydrateWonOpportunity` in `packages/database/src/crm.ts`) — idempotent, so re-saving the same stage doesn't create duplicates.
- `app/leads/[id]/proposal-panel.tsx` — set an estimated engagement value (₦) and download a Word proposal.
- `app/api/leads/[id]/proposal/route.ts` + `document.ts` — generates the proposal `.docx` on request from live assessment data. Nothing is persisted; the file is rebuilt fresh on every download, so it's never stale relative to the assessment or estimate.

## Authentication

`middleware.ts` blocks every route except `/login` and `/api/login` unless a valid signed session cookie is present. The session cookie is HttpOnly (not readable from client JS) and signed with HMAC-SHA256 (`lib/session.ts`) so it can't be forged without knowing `SESSION_SECRET`, and expires after 7 days.

This is a single shared password (`ADMIN_PASSWORD`), not per-person accounts — anyone who knows the password gets full access, and there's no way to tell who did what. That's a deliberate, proportionate choice for two trusted users on a pre-revenue internal tool, not an oversight. Move to real per-user auth (the `User`/`OrganizationMembership` models and `packages/auth`'s role/permission map already exist for this, just unused) before adding more people or before the client portal ships.

Sign in at `/login`. Sign out via the "Sign out" link on the leads page (posts to `/api/logout`, which clears the cookie).

## Known gaps

- Single shared password, no per-user accounts or audit trail of who changed what — see "Authentication" above.
- No UI yet for the `Organization`/`Project` records created on Won — by design, for now (see root README's workflow notes). The confirmation card on the lead detail page is the only place they're currently visible.

## Environment

Requires three variables — copy `.env.example` to `.env.local` and fill them in:

- `DATABASE_URL` — same connection string used by `packages/database/.env`.
- `ADMIN_PASSWORD` — the shared password for signing in.
- `SESSION_SECRET` — a random 32+ character string signing session cookies. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Commands

```bash
npm run dev      # http://localhost:3001 (from repo root: npm run dev:admin)
npm run build
npm run start
```
