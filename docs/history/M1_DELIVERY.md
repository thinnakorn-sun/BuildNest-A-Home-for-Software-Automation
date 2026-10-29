# M1 Delivery Audit / 2026-10-29

## Source checked

- `software-store-mvp/app/index.html`, `styles.css`, `app.js`: original static HTML MVP, catalog with eight sample products, local-only demo, CSV validator.
- `docs/` planning documents and `db/schema.sql`: proposed schema with RLS. No live connections were present.
- The user's separate private Codex/Claude repository remains **unavailable and was not modified**.

## Changes

- New React component-based storefront in `apps/web`. Responsive sidebar design retains M0 dark navy / indigo visual cues.
- New NestJS read-only sample API in `apps/api`. No privileged routes.
- Shared `packages/contracts` TypeScript domain models, locale guard, filtering and CSV parser.
- Tests of pure domain contracts; full Next/Nest installation/build remains dependent on npm registry and local environment.
- `supabase/migrations/0001_schema_draft.sql` is the original proposed schema **not applied**.

## Acceptance / evidence

- Shared contracts `tsc -p packages/contracts/tsconfig.json` compiles: see `test-results/` summary.
- Shared contracts `node --test packages/contracts/test/*.test.cjs`: see test-results log.
- M0 browser smoke test can be run (existing `tests/smoke_test.py` from M0) if Playwright/Chromium available.
- M1 frontend and Nest API cannot be claimed operational until npm install + build + integrated smoke test run.

## Blockers and next decisions

1. Get current user-owned repository snapshot to perform a non-destructive feature/diff audit.
2. Decide actual product name/domain and what is publicly sellable; M1 catalog is demo data.
3. Install dependencies and run `npm run build`, browser navigation checks, a11y tests, and HTTP API tests on an authorized machine.
4. Establish Supabase test project; review migration, RLS grants/policies, and run allow/deny tests.
5. Implement protected auth and admin API in M2, followed by Stripe test webhook verification in M3.

## Security

Do not import company assets. Never commit real `.env` or tokens; no real Stripe/Apify actions were executed.
