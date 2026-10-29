> **M1.1 DESIGN LOCK:** The approved M0 visual shell is authoritative. Read `M1_1_DESIGN_LOCK.md` before any UI edits. Do not redesign.

# Implementation plan / tracker

**Current deliverable: M0 preview completed.** Subsequent milestones are plans, not ongoing autonomous background jobs.

## M0 — preview and handoff [DONE]
- [x] Read and map Master Business Report 2026 sections on store, products, Apify and risk.
- [x] Build responsive static UI with TH/EN and light/dark theme.
- [x] Catalog search/category filter, product details.
- [x] Simulated checkout → demo library and history.
- [x] Simulated automation runs and actual local CSV validation.
- [x] Local admin product add/delete, demo metrics.
- [x] Draft six requested technical documents + A/B workflow doc + proposed SQL.
- [x] Automated browser interaction checks and desktop/mobile captures.
- [ ] Review brand, UX, current source with user.

## M1 — inspect & reconcile existing source [BLOCKED: source unavailable]
- Inventory user-owned existing Codex/Claude repository and environment.
- Produce gap matrix between actual code and M0/spec docs.
- Decide if transplant or selective cherry-pick best; preserve design and code the user approved.
- Set up mono-repo `apps/store-web` (Next.js), `backend` (NestJS), `shared/contracts`, `backend/supabase/migrations`, `apps/workers` optionally.
- Add CI lint/typecheck/unit/e2e pipeline, .env templates and secret scanning.

## M2 — authenticated catalog [PLANNED]
- Supabase Auth integration and staff roles; DB migrations with RLS/grant tests.
- Server-driven published catalog, image management, product detail/localizations/releases.
- Admin create/update drafts and version releases; ensure public visitor cannot see draft data.

## M3 — real commerce [PLANNED]
- Stripe Checkout **test mode** with server-side trusted prices, webhook signature & idempotency.
- Payment state machine and consistent entitlement issuance; refund/chargeback handlers.
- Private R2 releases, SHA-256, malware checks and expiring signed links; download audit.
- Test all negative paths: spoofed success URL, repeated webhooks, wrong user, expired license, failed/refunded order.

## M4 — Automation A/B [PLANNED]
- Publish standalone Actor on Apify Store with tested input schema, output dataset and cost controls (A).
- Backend Apify client via token kept on server, jobs, state polling, retry limits, spend caps (B).
- Credits ledger with cost reconciliation; watch third-party commercial terms and personal data handling.
- Hybrid opt-in channel strategy; avoid auto-migrating external identities.

## M5 — release / growth [PLANNED]
- Security review, SEO two-language URLs/canonical/hreflang/schema, analytics with consent.
- Real documentation screenshots, demo datasets, support, legal, refund policy, VAT/tax review.
- Product trial, usage/cost telemetry, first 10 real testers and measurable launch gates.

## Priority risk register
| Risk | Severity | Mitigation |
|---|---|---|
| Mistaking demo checkout for paid order | Critical | Separate mock storage, clear labels, server-only Stripe fulfill |
| Admin UI available without role checks | Critical | Never deploy demo admin as production; RBAC server + RLS |
| Paid file URL leaks | High | R2 private + signed short TTL after entitlement verification |
| Duplicated Apify billing events | High | Idempotent event ledger, retry safe completion |
| Unbounded AI/API usage costs | High | Per-tenant ceilings, dry-run estimate, emergency kill switch |
| Unsupported industrial device command | High | Default read-only and simulator |
| Legal/regulated slip verification claims | High | Provider-backed transaction validation and uncertain state |
| Design conflicts with existing work | High | Source audit before integration; non-destructive branch/PR |

## Definition of production readiness
No open P0 security issue, all payment flows tested with Stripe test mode, audited license and R2 access, fully tested policies, purchase/refund tests, operating alerts and support contact, legal/tax review. An attractive UI alone is not production-ready.


## M1.2/M2 implementation update (2026-10-29)
A Next.js React shell and protected M2 account/CMS/catalog routes have been authored under approved design CSS, while the public M0 legacy preview remains canonical pending complete pixel-parity React migration. Supabase login/session proxy, Nest identity/admin guards, RPC/migrations and audit support are authored but NOT connected or runtime-verified. See `docs/M1_2_M2_RELEASE.md` and `docs/M2_SETUP.md`. Next gates: install dependencies, full build, RLS/E2E tests, then native storefront migration.
