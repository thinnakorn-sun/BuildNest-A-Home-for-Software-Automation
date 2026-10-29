# Product Requirements Document (PRD)

Project: **BuildNest** (working title); version **0.1**; date **2026-10-29**; state **proposed**.

## Vision and success criteria
Enable independent creators to sell reusable utilities, automation, AI/OCR and Industrial/IoT software directly to Thai and international customers, while testing paid cloud Actors on Apify Store.

North-star metric: **gross profit from paid customers with repeat purchase/usage**, not total page views, free runs or invented conversion claims.

## Users and roles
- **Visitor:** browse public catalog, filters, localized product pages, guides and free browser tools.
- **Customer:** authenticate, purchase products, view orders/licenses/downloads and optionally trigger purchased automation jobs.
- **Admin/Owner:** create categories and products, upload private release artifacts, set licensing/prices, reconcile orders, monitor jobs/revenue/support and review audits.
- **Support (future):** view assigned support tickets with restricted access, never reveal payment secrets.
- **Automation system:** background worker with scoped service permissions, not an end-user role.

## Product types
`desktop_app`, `source_code`, `automation_actor`, `hosted_tool`, `api_credits`, `template`, `course`, `other`. Categories and product types must be admin-managed, not hard-coded. TH/EN descriptions and manuals. Publish states: draft → review → published → archived.

## Functional requirements / acceptance criteria
| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| STO-01 | P0 | Browse, search/filter by category/OS/price/language/type | SEO indexable public product pages; accessible mobile filters |
| STO-02 | P0 | Product detail | screenshots, capability boundaries, version, license, price, docs, demo, release history |
| STO-03 | P0 | Auth + locale | session persists securely; customers can see only own purchases |
| STO-04 | P0 | Checkout | backend validates product server price/currency and creates Stripe test session |
| STO-05 | P0 | Order fulfillment | signature verified; idempotent webhook transaction; no success-redirect grants |
| STO-06 | P0 | Customer library | only paid eligible entitlement can obtain release metadata/download link |
| STO-07 | P0 | Private file delivery | private R2 bucket, server-signed short-lived URL, access audit |
| STO-08 | P0 | Admin catalog | CRUD drafts/categories/releases; staff RBAC, image/file scanning |
| STO-09 | P0 | TH/EN | `/th` and `/en`; localized prices/terms; no misleading currency conversion |
| STO-10 | P0 | Policy pages | privacy/terms/refund/support, contact and security disclosure |
| STO-11 | P1 | Free tools hub | meaningful free previews tied to products; quota/privacy notices |
| STO-12 | P1 | Automation jobs | auth, input validation, quota reservation, execution, results, failed/refunded states |
| STO-13 | P1 | Credits / usage ledger | immutable auditable usage/cost events, deduplicated charge events |
| STO-14 | P1 | Apify listing + automation workflow | Actor published independently; exact eligible usage terms validated |
| STO-15 | P1 | Admin analytics | real-source metrics, funnel events, sales by product/language/region |
| STO-16 | P2 | Subscription/bundles | recurring billing, support policy, renewals, upgrades, invoices |
| STO-17 | P2 | License activation/update | activation rules, revocation, update policy, version entitlements |
| STO-18 | P2 | Support + knowledge base | ticket ownership, product help, changelog and operational SLAs |

## Product seed catalog (business hypotheses)
Excel Workflow Automator; CatalogWatch AI (Apify); SlipGuard (requires provider verification); MQTT Monitor; Modbus Tester; Invoice OCR; Webhook Inspector; CSV Validator free. Other planned ideas include Barcode & Label, Report Scheduler, Batch File Organizer, Email Attachment Processor, CSV Cleaner, Maintenance Tracker, Desktop API Monitor, File Backup Agent, Website Change Monitor.

## MVP release boundaries
M0 (in this archive): standalone interactive HTML/CSS/JS, demo accounts/order state ONLY in localStorage, deterministic sample Actor jobs, actual browser CSV validation. **No backend, real Stripe, external scraping or live account**.

M1 product MVP: public storefront and admin after auth with DB/RLS, customer library read model.

M2 commercial MVP: real payment in test mode, webhook fulfillment, R2 signed download, policies, verified security tests.

M3: first real Actor with controlled compute, cost instrumentation and documented license/monetization.

## Nonfunctional requirements
- Responsive min 360px through 1440px; keyboard navigation, focus indication, sufficient contrast, meaningful status/errors.
- P95 API targets to be defined with actual load testing (do not promise unsupported SLA).
- Rate limits, secure file storage, data minimization, operational logs without secrets, backups/recovery rehearsals.
- Observability: metrics for browsing, demo starts, checkout starts, paid orders, downloads, job completion and cost/user.
- Third-party legal review: Stripe account currency rules, Apify paid usage terms, cross-border tax and software license policy.

## Open decisions
Actual brand/domain; user existing project structure; NestJS vs existing Go Fiber selection; deployment runtime; product catalog initial priorities; tax/legal jurisdiction and customer refund rules; payment methods in supported regions; code-signing policy; Apify exact monetization terms.
