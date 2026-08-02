# Doubleday OS deployment guide

## Local verification

```powershell
npm.cmd install
npm.cmd run build
```

Run the marketing application locally with `npm.cmd run dev`. The site is served from `apps/website` at `http://localhost:3000`.

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

## Before production

- Confirm the production database migration and seed have run.
- Submit a test assessment and verify the lead and answers in the database.
- Rotate any database credential that was ever placed in a tracked file.
- Configure the authentication provider before deploying a consultant CRM interface.
