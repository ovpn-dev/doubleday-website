# Doubleday OS — Architecture Direction

## Target repository layout

```text
apps/
  website/              Public marketing application
  client-portal/        Client workspace
  consultant-portal/    Consultant workspace
  admin/                Internal operations
  api/                  API and asynchronous entry points

packages/
  ui/                   Shared components and design tokens
  database/             Schema, migrations, and data access
  auth/                 Authentication, authorization, and roles
  documents/            Document-control domain logic
  audit-engine/         Audits, findings, CAPAs, and verification
  iso-engine/           Standards, clauses, checklists, and assessment logic
  shared/               Shared validation, types, and utilities

services/
  ai/                   AI orchestration and retrieval
  notifications/        Email and reminder delivery
  storage/              Object-storage integration
```

## Technology direction

- Next.js (App Router) and TypeScript for authenticated applications.
- Tailwind CSS and a shared component library.
- PostgreSQL with Prisma for relational data and migrations.
- Supabase Auth, Auth.js, or an equivalent provider with role-based authorization.
- S3-compatible object storage for controlled-document files and audit evidence.
- Background jobs for review dates, reminders, notifications, and long-running imports.
- OpenAI and pgvector only after authorization and document lifecycle controls are in place.

## Migration approach

The current root application is a working Vite marketing site. Keep it deployable while product architecture is established. Migrate it into `apps/website` as a dedicated, tested migration—after the target Next.js application and deployment pipeline are ready.

Do not add client portal features directly into the public Vite app.
