# Database setup

Prisma is installed and the client has been generated. The remaining migration requirement is a PostgreSQL connection string.

1. Provision a PostgreSQL database (Supabase, Neon, Railway, or a local PostgreSQL instance).
2. Copy `packages/database/.env.example` to `packages/database/.env`.
3. Replace `DATABASE_URL` with the provider's PostgreSQL connection string.
4. Run:

```powershell
npm.cmd run migrate --workspace=@doubleday/database
npm.cmd run seed --workspace=@doubleday/database
```

The seed command loads the initial ISO 9001, ISO 45001, and ISO 14001 clause catalog used by the gap assessment. The P1012 error is expected until step 3 is complete. The actual `.env` file is ignored by Git and must never be committed.
