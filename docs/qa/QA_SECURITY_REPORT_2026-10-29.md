# BuildNest — QA & Security Review (Pre-Integration)

**Date:** 2026-10-29 (Asia/Bangkok)  
**Version:** `v0.3.1-qa.1` (QA-only revision based on M1.2 Native React v0.3.1)  
**Decision:** **QA simulation passes; NOT APPROVED FOR PRODUCTION.**

## Scope & non-interference

- Reviewed the existing monorepo, React storefront, current API/auth implementation, and draft SQL migrations.
- Added QA-only mock payment engine, automated unit tests, security-source checks, test command, and CI hook. No production routes, payment service, database connections, or frontend styles were changed.
- No real Stripe, Supabase, Apify, R2 keys, remote accounts, network/API calls, company computer, or corporate IT resources were used.
- **Payment test doubles are not Stripe and do not simulate live payment network behavior**. They verify intended business rules in isolation.

## Executed tests

| Suite | Result | Evidence / scope |
|---|---:|---|
| Payment sandbox (test-only implementation) | **38/38 PASS** | `tests/qa/mock-payment.test.cjs` |
| Runtime unit tests on existing Identity and Supabase TS source, with Nest mocks | **19/19 PASS** | `tests/qa/source-services.test.cjs` |
| Security source-level regression assertions | **23/23 PASS** | `tests/qa/security-regression.test.cjs` |
| Previously existing shared-contract unit tests | **12/12 PASS** | `packages/contracts/test/*.test.cjs` |
| Previously existing React CSV parsing tests | **9/9 PASS** | `scripts/test_native_csv.cjs` |
| **Total automated tests passing** | **101/101** | Each suite executed in isolated ChatGPT environment |
| Syntax transpilation | **50/50 files** | TypeScript and TSX; syntax-only, not type validation |
| Design lock | **PASS** | SHA-256 `75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f` |
| Native React route inspection | **9/9 PASS** | Static route expectations; not browser E2E |
| Full Next.js/NestJS build | **BLOCKED** | `npm install --offline` returned `ENOTCACHED` (`concurrently` unavailable); no full build assertion |
| Hosted Auth / RLS / Stripe / R2 / Apify E2E | **NOT RUN** | No external integration or secrets configured, intentionally |

Original storefront `styles.css`, `index.html`, `native/storefront.tsx`, `canonical.css`, and `globals.css` have identical SHA-256 hashes to the pre-QA source. See `test-results/`.

## Payment cases covered (mock, NOT live Stripe)

1. Order price set from server-side catalog, integer minor units (THB/USD); reject tampered amount and invalid currency.
2. Reject unavailable products, unauthenticated purchase attempts, invalid and conflicting idempotency keys.
3. No purchase entitlement after a success-page redirect or while order is pending.
4. Verify a **mock HMAC event envelope** and reject signature tampering, missing signatures, stale timestamps, and altered payloads.
5. Compare event to order identity, product, exact amount and currency; reject mismatches and unknown orders.
6. Duplicate and repeated success events never issue additional entitlements; burst test with 500 duplicate deliveries.
7. Payment failure blocks fulfillment; refund/dispute revokes entitlement; late success cannot reopen a revoked order.
8. Other users and unknown orders cannot download in the simulated authorization check.

**Important:** The mock uses a deliberately fixed, fake QA HMAC secret; its envelope format is **not** Stripe's webhook signature header. No mock ledger records represent real payments. The final backend must use Stripe's documented SDK verification on raw webhook bytes, provider event IDs, durable transactional idempotency, payment-status validation, and server-managed download permissions.

## Existing source review findings / Release blockers

| ID | Priority | Finding | Required action before launch |
|---|---|---|---|
| G1 | **BLOCKER** | Full `npm install`, Next.js and NestJS build, complete typecheck and real React browser E2E remain unverified. | Run installs/build/typecheck and E2E in a trusted personal or CI environment; fix any failures. |
| G2 | **BLOCKER** | Payment API, Stripe Webhook, durable order processing, signed file URLs and payment-integrated entitlements **do not exist yet**. Checkout is only preview/browser-local. | Implement and test before accepting real money; never issue rights from client redirect or browser localStorage. |
| G3 | **BLOCKER** | Supabase Auth/RLS and privileged RPCs are only SQL/code drafts, untested against actual Postgres roles. | Use disposable test project and database pgTAP / negative-access tests for anonymous, customer, admin, service roles. |
| G4 | **HIGH** | Existing `isSameOrigin()` accepts missing `Origin`; SameSite=Lax mitigates some cross-site requests, but this is not a complete CSRF strategy. | Design and test explicit CSRF/Origin-Fetch-Metadata policy for state-changing endpoints; account for legitimate clients. |
| G5 | **HIGH** | No verified endpoint rate limiting, abuse controls, production security headers/CSP, or vulnerability scan on installed dependencies. | Add and test controls before exposing authentication/administration to public Internet. |
| G6 | **HIGH** | Durable webhook dedupe / concurrent transaction atomicity not actually tested. In-memory mock does not prove safety against parallel workers. | Add database-backed concurrency, webhook replay, order/entitlement and crash-recovery integration tests. |
| G7 | **MEDIUM** | Browser-local demo catalog/orders may be confused with production purchase status. | Label preview clearly and keep demo storage isolated; never promote local orders to backend entitlements. |
| G8 | **MEDIUM** | Database/schema and runtime error handling have not undergone live integration, package audit, load or penetration testing. | Run pre-production checklist when environment and credentials are ready. |

## Readiness gates

- [x] No actual payment connected; no real-money transactions.
- [x] UI unchanged from approved design files.
- [x] Mock payment negative-path tests pass.
- [x] Source-based Auth and data boundary checks pass with test doubles.
- [ ] Full dependency install & build pass in target environment.
- [ ] Typecheck & React/NestJS E2E pass.
- [ ] SQL migrations applied to isolated testing database + RLS/pgTAP tests pass.
- [ ] Real Stripe Test Mode webhook, refund, failure, replay and persistence tests pass.
- [ ] R2 signed-download authorization and expiry tests pass.
- [ ] CSRF, abuse throttling, CSP, package dependency audit, security review complete.
- [ ] User authorizes deployment and key configuration **from a personal environment**.

**Do not take payments or deploy as Production until all required gates are closed.**

## Commands (for a later trusted, personal machine / CI)

```bash
npm install
npm run test:contracts
npm run test:native
npm run test:qa
npm run test:design
npm run test:routes
npm run typecheck
npm run build
```

The first three suites plus `test:qa`, design lock, route check and syntax transpilation were successfully run in the separated QA environment; `npm install`, `typecheck` for the entire monorepo and `build` are **not** claimed as passing.

## References for future implementation

- Stripe automated testing: https://docs.stripe.com/automated-testing
- Stripe checkout server-side post-payment events: https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted
- Supabase SQL / RLS testing: https://supabase.com/docs/guides/local-development/testing/overview
- Supabase RLS and security-invoker views: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase production checklist: https://supabase.com/docs/guides/deployment/going-into-prod

## QA handoff and next step

Do **not** implement new backend features or connect providers until the owner is ready on their personal computer. Preserve the approved M0/M1.1 visual baseline. When resuming: start with reproducible full build and fixing G1/G4; only then use personal sandbox accounts (not production) for M2 integration and future M3 payment development.
