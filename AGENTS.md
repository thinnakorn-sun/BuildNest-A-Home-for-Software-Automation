# BuildNest — Mandatory Agent Instructions

You are working on **BuildNest, a bilingual marketplace to sell software utilities, digital products, AI/OCR tools and automations**. This is an EXISTING monorepo, NOT a generic app starter, POS, SaaS dashboard or Grafana project.

## READ FIRST (in order)

1. `docs/PROJECT_CHARTER.md` — authoritative product goals and business behavior.
2. `docs/CODEBASE_MAP.md` — actual folders and implemented vs planned features.
3. `docs/GETTING_STARTED.md` — workspace root, Mac setup and tests.
4. `docs/CODEX_HANDOFF.md` — the owner's **CURRENT TASK**: audit/build baseline, then report.
5. `docs/M1_1_DESIGN_LOCK.md` — approved visual design; do not redesign.

Before changing code, summarize the project in Thai and distinguish **demo** from **live**. Locate workspace root and `.git` rather than assuming the terminal is in the repository.

## ABSOLUTE RULE — UI DESIGN LOCK

The owner APPROVED the original M0/M1.1 UX/UI. Preserve sidebar, brand, navigation, hero, gradients, color palette, typography, cards, spacing, interactions and mobile breakpoints. Source: `frontend/references/m0-approved-ui/`, `frontend/public/buildnest/` and `docs/M1_1_DESIGN_LOCK.md`. Native React port under `frontend/src/components/native/` must retain visual parity. Do not replace with shadcn/templates/new themes or redesign. Run `npm run test:design` and visual regression when possible. Seek explicit approval for any appearance changes.

## Boundaries / safety

- No real payments, Stripe checkout, Supabase production connection, R2 buckets, Apify execution, external services, tokens, credentials, push/merge/deploy without explicit owner permission.
- Do not use company laptop, company networks or company resources.
- Treat checkout and library **as browser-local demo**; no verified purchase, entitlement, download or revenue.
- Supabase migrations are NOT applied; Grafana dashboard JSON is NOT a running monitoring system.
- Protect authentication, authorization, payment idempotency, PII and secrets. Do not weaken tests/security to make a build pass.
- Avoid arbitrary changes to existing features and filenames; prefer small changes backed by tests.

## Workspace conventions

- **Monorepo root** = `package.json` with npm workspaces + `frontend/`, `backend/` and `shared/`; do not create extra `BuildNest/BuildNest` root.
- `frontend` — Next.js/React UI.
- `backend` — NestJS API.
- `shared/contracts` — shared validation.
- `backend/supabase/migrations` — future database SQL.
- `frontend/scripts`, `backend/tests`, `shared/tests`, `shared/scripts` — checks grouped by ownership.
- `docs/observability` — future Grafana design only.
- `docs/history` — prior reports, not current instructions.

## Immediate instructions

Do **NOT** start Grafana, create new features, alter Git remotes or push code. First run installation/build/test baseline on personal Mac, fix only verified problems, report. Consult `docs/CODEX_HANDOFF.md`.

Pass/fail claims must be backed by actual executed commands. Full Next.js/NestJS build and real Auth/Payment/DB/Observability integrations must be considered UNVERIFIED until proven otherwise.

## Git workflow (owner-approved)

- Repository: https://github.com/thinnakorn-sun/BuildNest-A-Home-for-Software-Automation
- Start each new task by reading these rules/docs and fetching latest develop.
- Branch from origin/develop using feat/<feature-name>, fix/<issue-name>, or refactor/<scope>.
- Initial source import uses chore/initial-import, based on develop.
- Never commit directly to main or develop. Use small focused commits and run relevant tests.
- Push only the current task branch when authorized; open its PR against develop.
- Never force-push shared branches or auto-merge PRs. main releases require explicit owner approval.
- Production deployment, provider credentials and payment changes require separate approval.
- Preserve the approved frontend and original design references.
