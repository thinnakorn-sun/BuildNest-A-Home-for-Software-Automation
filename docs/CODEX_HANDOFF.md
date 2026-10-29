# Codex First Task — UNDERSTAND + STABILIZE (no feature work yet)

## Your task in one sentence

**Understand BuildNest as a software-and-automation product marketplace, verify the existing monorepo builds/tests, and clean up only confirmed structural/configuration problems while preserving the approved UI.**

## Mandatory reading order

1. `AGENTS.md`
2. `docs/PROJECT_CHARTER.md`
3. `docs/CODEBASE_MAP.md`
4. `docs/GETTING_STARTED.md`
5. `docs/M1_1_DESIGN_LOCK.md`
6. `docs/PRD.md`, `docs/ARCHITECTURE.md`
7. `docs/observability/OBSERVABILITY_SPEC.md` — **future work**, not the current step

## Phase 0 — Report understanding FIRST

Before editing code, report in Thai:
- What BuildNest sells, customers/owner roles and two revenue channels.
- Which features are demo-only vs actual backend code vs not implemented.
- A concise root tree and major dependency flow.
- The exact current working directory and whether it contains `.git`.
- Missing dependencies, conflicting docs or broken imports you can already verify.

## Phase 1 — Baseline

On the owner's *personal* Mac, from the correct workspace root:
- Confirm Node/npm version.
- Run `npm install` once from root.
- Build the contracts package first if needed.
- Run `npm test`, `npm run typecheck` and `npm run build`.
- If tests fail, reproduce and isolate before fixing.

Maintain a small table with actual pass/fail/blocked results and exact commands.

## Phase 2 — Minimum safe fixes

- Fix any proven workspace dependency, TS config or import resolution errors.
- Prefer small incremental patches over rewriting modules.
- Preserve functional routes and exports; run existing regression checks again.
- Don't delete tests or rewrite design. Avoid broad refactors until baseline is green.
- Do not edit payment, Supabase, R2, Apify or real secrets unless owner separately approves.
- Do not begin Grafana installation until baseline status and proposed changes have been presented to owner.

## Phase 3 — Deliverables

Update `docs/LOCAL_AUDIT_REPORT.md` with:
1. Product understanding summary.
2. Working folder path / Git status / branch.
3. Dependency/build/test results (not old reported numbers).
4. Files changed and why.
5. Known issues and unresolved risks.
6. Suggested next step: local observability implementation **only after explicit approval**.

**STOP after baseline and report. Do not push, merge, deploy or connect real services without authorization.**
