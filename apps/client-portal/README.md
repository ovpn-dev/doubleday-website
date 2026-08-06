# Client Portal

Client-facing workspace for Doubleday's customers. Next.js (App Router), TypeScript, Tailwind. Runs on `http://localhost:3002`.

**Login only so far — no dashboard yet.** After signing in, a client currently sees a placeholder page. The real dashboard (project status, readiness score, gaps, required documents) is planned next — see `HANDOFF.md` at the repo root for current status.

## Authentication — separate from apps/admin, deliberately

This is **not** the same shared-password gate as `apps/admin`. Admin auth only needs to answer "is this one of Doubleday's ~2 trusted staff" — a shared password is proportionate for that. Client auth needs to answer "is this person authorized to see *this specific organization's* data and no other's" — that's an isolation requirement between clients, not just a keep-out gate, so it needs real per-user identity.

- Each client gets a real `User` row (email + `passwordHash`, hashed with scrypt via `@doubleday/auth/password` — see that package for why scrypt, not a fast hash) and an `OrganizationMembership` tying them to exactly one `Organization`.
- The session cookie (`lib/session.ts`) carries both `userId` and `organizationId`, HMAC-signed with `CLIENT_SESSION_SECRET` — a **different secret from `apps/admin`'s `SESSION_SECRET`**. This is intentional: sharing a secret between the two systems would let either forge the other's sessions.
- `middleware.ts` gates every route except `/login` and `/api/login`, same shape as admin's but checking this app's own session.

## How a client gets an account

There's no self-signup. An admin creates the login from `apps/admin`'s lead detail page, on the WON confirmation card, after a deal is won and the client's `Organization` exists. The admin sets an email and a password and hands it to the client directly (phone/email/in person) — there's no automated email delivery yet, since that needs transactional email infrastructure that doesn't exist.

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
