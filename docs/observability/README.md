# BuildNest Observability — Specification Only (NOT DEPLOYED)

This folder contains the original **Grafana Observability planning materials**:
- `OBSERVABILITY_SPEC.md` — architecture and service coverage.
- `MONITORING_TEST_MATRIX.md` — planned checks, NOT test results.
- `GRAFANA_API_DASHBOARD_DRAFT.json` — example panels, NOT connected to Prometheus.

Target (after owner approves implementation): NestJS + workers → OpenTelemetry/Alloy → Prometheus, Loki, Tempo → Grafana dashboards/alerts. Monitor per-route request rate, error rate, p95/p99, uptime, dependency spans, job failures, and provider webhooks once those providers exist. Protect PII/tokens and minimize metrics cardinality.

**Current task is to establish a clean, passing build/test baseline. DO NOT implement the observability stack until the owner approves the next milestone.**
