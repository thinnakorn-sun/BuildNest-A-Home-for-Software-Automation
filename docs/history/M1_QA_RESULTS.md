# M1 QA results — 2026-10-29

| Check | Status | Evidence |
|---|---|---|
| M0 unchanged source preserved | PASS | Original `app/` copied into `legacy-preview/` |
| M0 browser smoke test | PASS | Playwright/Chromium: catalog, filtering, demo checkout, sample orders, real CSV validation, actor preview, admin mock, localization, theme, mobile nav |
| Shared TS contracts compilation | PASS | `tsc -p packages/contracts/tsconfig.json` |
| Domain unit tests | PASS | 6 / 6 node:test cases: product IDs, query/filter, CSV quotes/duplicates, bad CSV handling, localization/formatting |
| TS / TSX syntax scan | PASS | TypeScript `transpileModule` scan: 27 files, 0 parse errors |
| Next.js build and interactive browser QA | **NOT RUN** | npm registry unavailable in isolated runtime; no installed Next dependencies |
| NestJS startup / HTTP E2E | **NOT RUN** | npm registry unavailable; no installed Nest dependencies |
| Supabase migration, policies and RLS tests | **NOT RUN** | No live/test Supabase project, no SQL applied |
| Stripe / R2 / Apify integration | **NOT IMPLEMENTED** | Provider keys intentionally absent; no money movement or paid jobs |

Next action on personal/authorized environment: install dependencies, run `npm run build`, start API and frontend, validate all routes, test 360px–1440px layouts and accessibility, then review and record results. Do not imply this code is deployed or production-ready.
