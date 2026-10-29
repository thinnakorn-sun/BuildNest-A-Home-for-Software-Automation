# Monitoring QA Matrix — planned, not executed

| ID | Scenario | Required result |
| -- | -- | -- |
| OBS-001 | GET catalog success | Count +1, status 200, route normalized |
| OBS-002 | GET nonexistent product | 404 correctly counted; not 500 |
| OBS-003 | API handler throws | One 500 record, error span, sanitized log |
| OBS-004 | Two dynamic IDs same route | One metric label for route template |
| OBS-005 | PII in request URL/body | No raw values in labels/logs/traces |
| OBS-006 | Cookie, JWT or Stripe test key in headers | Redacted; never exported |
| OBS-007 | DB query delayed | Trace indicates DB span as bottleneck |
| OBS-008 | External Apify call times out | Timeout error marked, request ID correlated |
| OBS-009 | Metric collector unavailable | API still responds; no retry storm |
| OBS-010 | Synthetic probe returns failure | Down alert fires after specified for-duration |
| OBS-011 | Service recovers | Alert resolves; trace returns normal |
| OBS-012 | One isolated 5xx during low volume | No alert storm; low-volume guard applies |
| OBS-013 | Admin calls denied | 401/403; no secret or identity exposed |
| OBS-014 | Mock payment rejected/replayed | Future payment counter correct; no duplicate charge or entitlement |
| OBS-015 | Multiple parallel API calls | No excessive telemetry memory/CPU overhead |
| OBS-016 | Browser navigation error | Faro RUM after enable; no customer payload |

**Current run status:** 0/16 tests executed. This is a specification-only artifact pending approved runtime/telemetry setup.
