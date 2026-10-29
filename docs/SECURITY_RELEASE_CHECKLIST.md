# Security & release checklist

All items are mandatory production gates where applicable.

## Secrets and identity
- [ ] Git secret scan clean; private env secrets scoped per environment.
- [ ] Supabase service secret, Stripe secret/webhook secret, R2 keys and Apify token **server only**.
- [ ] Auth verified server-side; session logout and credential rotation supported.
- [ ] Admin access checked at every sensitive API endpoint and database policy, not only navigation visibility.
- [ ] Password reset/verification handled by trusted auth provider.

## Payments and entitlements
- [ ] Price/currency looked up server-side; client input not trusted.
- [ ] Verify Stripe raw payload signature; reject invalid signature.
- [ ] Stripe event ID unique; repeated webhook produces one state transition.
- [ ] Paid/async/failed/refund/chargeback flows tested end-to-end.
- [ ] Fake success redirect does not unlock download.
- [ ] R2 bucket private; short-lived presigned download URL only after entitlement check.
- [ ] PII and download URLs omitted from request logs.

## Automation
- [ ] All jobs rate-limited, validated, budget-capped and cancelable.
- [ ] Retry is idempotent and does not double bill; unit cost observed at P50/P95.
- [ ] Apify legal/commercial policy and website source terms reviewed.
- [ ] User secrets encrypted/stored appropriately; no arbitrary code execution triggered from input.
- [ ] Output retention/deletion workflow documented.

## Products
- [ ] Real installers built/tested on declared operating systems.
- [ ] Release checksum verified; optional code signing considered.
- [ ] Product screenshots and features are real; no fabricated reviews.
- [ ] TH/EN manuals and limitations disclosed.
- [ ] Industrial protocols tested on simulator and safe read-only baseline.
- [ ] OCR confidence and user review required for sensitive fields.

## Operations
- [ ] Database restore tested, retention policy implemented, security headers configured.
- [ ] Critical audit logs and error alerts enabled.
- [ ] Customer support, legal, refund, license, privacy/tax pages reviewed.
- [ ] Stripe test mode and production keys clearly separated.
- [ ] Staged release and rollback rehearsed.
