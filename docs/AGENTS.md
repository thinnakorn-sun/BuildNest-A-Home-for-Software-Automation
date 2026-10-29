# AGENTS.md — engineering operating agreement

**Applies to Codex, Claude Code and any human contributors.** This document governs planned production implementation, not the static preview alone.

## 0. Existing repository comes first
- User already has work underway with Codex/Claude. This package was built independently because their actual source is unavailable.
- Before modifying the user's production repository, inventory routes, packages, migrations, components, env names, branches and all uncommitted changes. Report existing functionality before editing.
- Do **not** reinitialize, overwrite, delete, force-push, migrate destructive schema, or switch frameworks without explicit authorization and a rollback plan.
- Reuse production code and design decisions where compatible; treat UI demo as non-authoritative visual reference and master report as strategy context.

## 1. Business objective
Operate a multilingual owned store that sells digital software products, desktop installers, source code, and automation access. Support Plan A (Apify Store), Plan B (owned direct-to-customer), and eventually a hybrid model. Product taxonomy is data-driven and nonrestrictive.

## 2. Target stack
- Frontend: Next.js + TypeScript + accessible component system inspired by shadcn/ui; support SSR, SEO, TH/EN and mobile-first layout.
- Backend: **NestJS** separate service for business APIs, Stripe webhooks, R2 signing, entitlements, administration and automation orchestration. Go workers are optional for execution-heavy tasks. Do not implement all business logic as Next API routes.
- Database & Auth: Supabase PostgreSQL + Supabase Auth with carefully reviewed row-level security policies.
- File delivery: private Cloudflare R2 objects with server-created expiring signed URLs.
- Payments: Stripe Checkout Sessions, validated webhooks, idempotent order fulfillment. International payment options subject to verified country/currency eligibility.
- Automation: Apify Actor listing/API for Plan A; site API queues and workers for Plan B; price and third-party terms to be verified before release.

## 3. Non-negotiables
1. No credentials in browser JS or git. Use `.env.local` ignored by git; example templates only.
2. No simulated payments in production: only verified server-side payment events may grant entitlements.
3. RLS + least privilege. The browser must never access service-role secret, Stripe secret or R2 secret.
4. Access to purchased assets must be checked server-side per user and entitlement before signing links.
5. Public catalog information only; no fabricated reviews, revenue data, or real product capabilities.
6. Automation execution must enforce auth, quotas, rate limiting, spend ceilings, retries and audit logs. No charging duplicated retry events.
7. SlipGuard must never claim forensic proof of fake slip from OCR or QR alone. Use Verified / Suspicious / Duplicate / Unverified states and external permitted verification provider.
8. Industrial tools start with read-only/simulator mode and explicit warnings; no unauthorized live device writes.
9. Every product ships release notes, platform compatibility, installer hash, pricing/license terms, TH/EN quick-start manual and support scope.
10. No testing or deployment on corporate devices/networks and no ingestion of company source/data unless explicitly authorized.

## 4. Change protocol
For each feature: inspect current code → state implementation plan/diff → code smallest isolated change → add tests → run lint/typecheck/test/build → document feature state → stop before cloud mutation or external billing until confirmed.

## 5. Definition of Done
- Functional acceptance tests pass; security acceptance tests pass; TH/EN and mobile checks pass.
- State status as `implemented`, `mocked`, `planned`, or `blocked`; never confuse UI demo with production.
- UI snapshots compared at desktop and mobile; error/empty/loading states covered.
- New customer-facing price, quota and policy reviewed against live provider docs.

## 6. Where to look
`PRD.md` business requirements; `ARCHITECTURE.md` runtime boundaries; `DATABASE_SCHEMA.md` entity specs; `UI_UX_SPEC.md` screens; `IMPLEMENTATION_PLAN.md` milestones; `WORKFLOWS.md` A/B/hybrid and purchase flows; `../db/schema.sql` SQL proposal.
