# Doubleday OS deployment guide

## Local verification

```powershell
npm.cmd install
npm.cmd run build
```

Run the marketing application locally with `npm.cmd run dev`. The site is served from `apps/website` at `http://localhost:3000`.

Run the internal admin application locally with `npm.cmd run dev:admin`. It's served from `apps/admin` at `http://localhost:3001`, gated behind a shared password (`ADMIN_PASSWORD`) — see `apps/admin/README.md` for setup and the limits of that model.

## Database prerequisites

The public assessment API requires a PostgreSQL `DATABASE_URL` in `packages/database/.env`. This local file is ignored by Git.

After configuring the connection, apply the database schema and ISO clause catalog:

```powershell
npm.cmd run migrate --workspace=@doubleday/database -- --name init
npm.cmd run seed --workspace=@doubleday/database
```

Use `--name` only when creating a new migration. For future changes, replace `init` with a descriptive migration name.

## Vercel deployment

Deploy the Next.js website with Vercel. Import the repository and set the Vercel project root directory to `apps/website`.

Configure these environment variables in Vercel:

- `DATABASE_URL` — the PostgreSQL connection string used by the assessment API.

Vercel detects Next.js automatically. Use the default build command and output settings; this application does not build a `dist` directory.

The admin app (`apps/admin`) can be deployed the same way with root directory `apps/admin`, with `DATABASE_URL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` all set in Vercel. Its shared-password gate is proportionate for a couple of trusted internal users; treat it as a placeholder, not a long-term access control model — see `apps/admin/README.md`.

## Before production

- Confirm the production database migration and seed have run.
- Submit a test assessment and verify the lead and answers in the database.
- Rotate any database credential that was ever placed in a tracked file.
- Set a real `ADMIN_PASSWORD` and a freshly generated `SESSION_SECRET` in production — don't reuse local dev values.
- Build real per-user authentication (the `User`/`OrganizationMembership` models and `packages/auth` already exist for this) before deploying a client-facing portal — the admin app's shared password is not adequate once clients need their own logins.
