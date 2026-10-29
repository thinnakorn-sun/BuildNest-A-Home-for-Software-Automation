# BuildNest v0.3.0 — M1.2/M2 Foundation release

## Scope

This build extends the actual M1.1 source. The approved visual baseline remains authoritative. The original Overview page is pixel-identical to M1.1 at desktop/mobile test sizes; the legacy marketplace/admin contain links to new M2 routes without changing the original Overview.

### Implemented in source

- New Next.js React chrome based on existing CSS/HTML classes (`LockedShell`), account form and Product CMS; these routes coexist with the original HTML preview.
- New `/en/live-catalog` and `/th/live-catalog` React screens using read-only catalog API data; sample fallback if Supabase not configured.
- Cookie-only access/refresh token storage in Next route handlers. Session login, registration, logout and automatic refresh; no auth secrets are sent in JSON responses.
- NestJS identity verification against Supabase Auth `/auth/v1/user` — no unsigned JWT decoding or trusting user-defined roles.
- Admin role checked server-side against `admin_members`; privileged service key used on NestJS server only.
- Atomic PostgreSQL RPC for product upsert (two locales and THB/USD minor-unit prices) and category creation. Both write to `audit_logs` inside the transaction.
- Public read-only `security_invoker` view exposes only products with published status, active categories, localized titles and prices.
- Input validation at the API and SQL layers; prices must be safe nonnegative integers in minor units.
- No Stripe, payment capture, Apify or private file download execution.

### Not implemented/verified

- Full React port of original 8-view M0 app is **NOT COMPLETE**; default public route continues to use approved standalone HTML until pixel-level parity is demonstrated.
- `npm install`, `npm run build`, Next route integration, Nest runtime and direct Supabase RLS tests **NOT VERIFIED** in this environment. Cannot claim production-ready.
- Owner/admin provisioning and application of migrations require owner's Supabase project and explicit action, preferably on personal computer.
- Production hardening pending: WAF/rate limits, Auth email verification and recovery, server-side pagination, RLS tests, backups, audit log read UI, observability, CI E2E.

### Observed local tests

- `npm run test:contracts`: 12 passed.
- `python scripts/check_design_lock.py`: passed; SHA-256 `75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`.
- `python scripts/qa_m2.py`: 14 passed, zero browser exceptions.
- TS/TSX syntax parser: completed without syntax errors (not type check).
- `npm install --offline`: failed `ENOTCACHED` (concurrently package not present); **no full build performed**.

### Security boundary

Client JS → same-origin Next `/api/session` cookies → Next proxy with Bearer → Nest identity verification → database-side admin membership → `service_role` RPC → audit.

A self-reported role, `admin=true` field or bypassed UI will not authorize the Nest admin endpoints. However, complete runtime security testing is pending.

### Next milestones

1. On a personal/authorized machine, run `npm install`, typecheck, full Next/Nest builds; fix errors if any.
2. Apply/review migrations only in NEW test Supabase project. Validate RLS as anon, user A, user B, admin.
3. Implement full native React migration of original storefront **behind visual regression gate**.
4. Test M2 Login/Register + CMS E2E, errors and session expiry.
5. M3 separate: Stripe Test Mode / verified Webhook / orders / entitlements / Cloudflare R2.
