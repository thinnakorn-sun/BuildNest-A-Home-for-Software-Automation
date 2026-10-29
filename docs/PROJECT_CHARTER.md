# BuildNest — Master Project Charter (Authoritative)

**Read this document first.** This is the single source of truth for business purpose and product boundaries, superseding older milestone summaries. Other documents may describe future intent, **not implemented features**.

## Executive definition

BuildNest is a bilingual (Thai/English), extensible **software product marketplace and automation platform owned by its creator**. The business packages practical software for individuals and companies and sells it repeatedly, rather than relying on bespoke freelance contracts. Multiple product categories share one storefront, account, catalog, license/delivery infrastructure and operations console.

Brand: **BuildNest — A Home for Software & Automation**. Initial focus: sell software, desktop utilities, source/template products, AI/OCR tools, workflow automations, and industrial/IoT developer utilities. The owner may publish some automations as separately monetized **Apify Actors**.

## Why customers buy

Customers want specific utility and automation solutions with simple onboarding, clear price/license, documentation, support and secure updates. BuildNest is a distribution and account/delivery layer; it is **not** itself a single OCR/POS/IoT application.

## Personas and permissions

| Role | Tasks | Authorization constraints |
|---|---|---|
| Anonymous visitor | Browse/search/filter categories and product details, read docs, try local free tools | Only published public data; no simulated customer records treated as real |
| Customer | Register/login, checkout, retrieve purchased releases/license, view own orders, run subscribed automation | Server verified identity, paid entitlement and quotas |
| Admin/owner | Manage products, categories, localized descriptions, pricing, release files, orders/jobs, refunds/support | Server/database-derived admin role, audited mutations |
| Worker/service (future) | Execute queued automations, generate results, emit telemetry | Least-privileged service identity; no direct customer grants |

## Product types (catalog categories are data-driven)

- Downloadable desktop apps (.exe / macOS builds) and utilities.
- AI/OCR and document automation tools (e.g. invoices, slips), with privacy safeguards.
- Excel/CSV processing tools and report generators.
- IoT/industrial monitoring tools and developer utilities.
- Templates, source-code bundles, documentation or mini-courses.
- Hosted automations / usage-based tools; independently distributed Apify Actors.

Names in seeded catalog are **concepts/demos** and do not imply mature products. The number of seeded items does not equal launched products.

## Required product journeys — TARGET, not all implemented

**Owned-store journey:** Visitor → searchable catalog → product details, demo and license/price → authenticated customer → backend creates trusted checkout → verified payment event → database order + entitlement → private release download or automation usage → account library and order history.

**Apify journey:** User discovers Actor on Apify → runs Actor under Apify's terms/billing → gets result on Apify. This is independent of owned-store billing.

**Admin journey:** Admin sign-in → verify admin membership on server → create draft product + TH/EN descriptions + price → publish after review → upload signed/reviewed releases → monitor orders, errors, refunds and jobs.

**Operational journey:** Grafana/metrics/logs/traces → identify 5xx/latency/outages/slow DB/jobs → alert and root-cause investigation without logging PII/secrets.

## Actual implemented / unimplemented inventory (as packaged)

| Capability | Present today | Reality / limitations |
|---|---|---|
| Approved responsive storefront UI | Yes | M0/M1.1 original preserved; React native port in `frontend/src/components/native/` |
| Search/catalog/details | Demo yes | Seeded items, not a verified live product CMS |
| Checkout and library | Demo only | Browser-local simulated payments and purchases; **not genuine payment, license or entitlement** |
| CSV validator and automation preview | Demo yes | Local calculations / mock runs; no cloud job execution |
| NestJS API | Source yes | Full npm build and API runtime must be verified locally |
| Supabase Auth/CMS & SQL | Integration code/drafts | No project attached; SQL not applied, E2E not verified |
| Stripe / R2 secure delivery | No | Requirements and simulated tests only |
| Apify execution / quota ledger | No | Architecture plan, not live |
| Grafana observability | Draft specification | Dashboard JSON and test matrix only; no telemetry pipeline running |
| Tests | Several harnesses | Historical passing checks are **not** proof of full application build or production safety |
| Deployment | No | Not production ready |

## Hard constraints

1. **NEVER change approved visual design without explicit owner approval**. Reference: `frontend/references/m0-approved-ui/` and `docs/M1_1_DESIGN_LOCK.md`.
2. Never conflate demo payments, customer rights, logs or analytics with real data.
3. No production deployment, push/merge, real provider account connections, payment collection or secret introduction without permission.
4. No corporate equipment or credentials. Work in owner's personal development environment.
5. Product code should be modular, typed, testable, secure and easy for Codex or other developers to maintain.
6. Monitor all API routes when observability is implemented; high-cardinality route parameters, tokens and PII must never become metric labels/log content.

## Roadmap and release gate

- **M1.2 closeout:** reliable dependency install, workspace builds, typed APIs, full automated test baseline, no UI drift.
- **M2:** working development Auth, Role-Based Access Control, database migration/RLS and real Product CMS tested against isolated test DB.
- **OBS-1:** local OpenTelemetry/Prometheus/Loki/Tempo/Grafana, route-aware dashboard and alert smoke tests; **after baseline is healthy and owner approves**.
- **M3:** server-trusted Stripe test checkout + webhook idempotency + order/entitlement + private R2 delivery, full adversarial testing.
- **M4:** worker/Apify integration, usage metering, queues and monitoring.
- **M5:** staging/prod readiness, security, CI/CD, docs, support and launch gates.

Do **not** jump from this charter to building Stripe/Grafana by default. Start with `docs/CODEX_HANDOFF.md` for the owner's immediate task.
