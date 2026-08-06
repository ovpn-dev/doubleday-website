# Authentication Package

## What's here and actually used

- `src/password.ts` — `hashPassword` / `verifyPassword`, built on Node's `scrypt` (memory-hard, purpose-built for passwords — not the same as the HMAC signing `apps/admin` and `apps/client-portal` use for their session cookies, which is a different job). Used by `apps/admin` when creating a client login, and by `apps/client-portal`'s login route to verify it. **Must run in the Node runtime** — `scrypt` isn't available in Next.js's Edge runtime, so never call this from `middleware.ts` in either app.

## What's here and still unused

- `src/index.ts` — `MembershipRole` (`PLATFORM_ADMIN`, `DOUBLEDAY_ADMIN`, `LEAD_CONSULTANT`, `CONSULTANT`, `CLIENT_ADMIN`, `CLIENT_CONTRIBUTOR`, `CLIENT_VIEWER`) and `hasPermission(role, permission)`. This matches `OrganizationMembership.role` in the Prisma schema exactly. `apps/admin`'s client-login creation currently grants every new client `CLIENT_ADMIN` unconditionally — nothing yet reads `hasPermission` to gate what a signed-in client can actually see or do. That's the natural next use of this file once the client dashboard needs more than one permission level (e.g. once `CLIENT_CONTRIBUTOR`/`CLIENT_VIEWER` need to differ in practice, not just in name).

## Two separate auth systems, one shared password module

`apps/admin` and `apps/client-portal` each have their own session signing (`lib/session.ts` in each app, different cookie names, different secret env vars) and their own middleware — deliberately not shared, since they answer different questions (see each app's README for why). Both call into this package's `password.ts` for the one thing that is genuinely shared: turning a plaintext password into something safe to store, and checking one against it.
