# Production database specification (proposed)

See `../db/schema.sql` for a reproducible **proposal**. Apply only to a test Supabase project after review; do not modify an existing user database without diffing migrations.

## Core domain
| Table | Ownership | Important constraints |
|---|---|---|
| profiles | user | one-to-one with `auth.users`; locale preference |
| categories | admin | unique slug; public active read |
| products | admin | unique slug; publish status; classification/type |
| product_localizations | admin | unique product + locale; SEO metadata |
| product_prices | admin | currency + integer minor units, active pricing |
| product_versions | admin | unique version per product, release notes |
| artifacts | admin | private R2 object key, checksum, platform |
| orders | customer/server | idempotency key, currency, amount and payment state |
| order_items | customer/server | immutable captured price/qty/product version |
| payment_events | server only | unique provider event ID, processing status |
| entitlements | customer/server | unique order item, owner, expiry/revocation |
| download_audit | server only | actor, artifact, timestamp, outcome |
| automation_jobs | customer/server | owner, product, state, input/output refs, cost |
| usage_ledger | server only | idempotent reservation/charge/release entries |
| audit_logs | server only | privileged activity trail |

## Rules
1. A `paid` order has a verified payment provider reference; mark via webhook only.
2. One entitlement per purchased order item, with unique constraints to make retries harmless.
3. A browser can read only published catalog and its own profile/orders/items/entitlements/job results. No client insert/update access to money fields.
4. Product price stored as integer smallest currency unit; THB/USD price catalogs are not inferred FX conversions.
5. Internal R2 object key and Stripe payment event detail is server-only; do not expose through direct table grant.
6. Automation billing ledger is append-only and idempotent keyed by `(job_id, event_kind, source_event_id)`.
7. RLS policies and SQL GRANTs must both be tested. Verify with anon, normal customer, other customer, admin actor and service key contexts.

## Migration order
Roles/enum checks → catalog → users → orders → licenses/releases → automation → indexes → RLS/grants → fixtures → automated access tests. Do not run `DROP TABLE` on existing database in a production migration.

## Performance / retention
Indexes on owner ID and payment references; partitions or archive usage/events when volume warrants. Define retention periods for personal and uploaded data during legal/privacy review. No sensitive slip photos unless there is explicit lawful basis and retention/deletion workflow.
