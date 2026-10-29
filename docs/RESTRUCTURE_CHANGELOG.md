# Handoff v0.3.2 — Cleanup Changelog

## Why

Prior ZIPs mixed old milestones with the active codebase. README began with multiple version headers, duplicated offline previews, and did not explain the business to Codex. There was also confusion between a cloned Git root and a separate unpacked `BuildNest/BuildNest` folder.

## What changed

- Root README and AGENTS.md rewritten to describe BuildNest product and next audit task.
- Added `docs/PROJECT_CHARTER.md`, `CODEBASE_MAP.md`, `GETTING_STARTED.md`, `CODEX_HANDOFF.md`, and `LOCAL_AUDIT_REPORT.md`.
- Moved NestJS controllers from `backend/src/modules/*.controller.ts` to `backend/src/modules/<domain>/<domain>.controller.ts`, with updated imports and existing source-based test fixture path.
- Moved `backend/src/modules/app.module.ts` to `backend/src/app.module.ts` and updated bootstrap import.
- Moved historical milestone files to `docs/history/`; preserved current `docs/PRD.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `UI_UX_SPEC.md`, observability specs.
- Removed redundant `legacy-preview/` (authoritative copy remains `frontend/public/buildnest/`) and root standalone HTML duplication (offline copy remains in `preview/`).
- Archived legacy reference SQL under `docs/history/`; active migration drafts remain in `backend/supabase/migrations/`.
- Removed generated `shared/contracts/dist/` from shipping ZIP (must regenerate from source).
- Added `npm test` runner and adjusted `npm run typecheck` to build shared contracts before API/web checks.
- Removed obsolete `GITHUB_SETUP.md` because it presumed a specific Git branch/clone state.
- **No visual source/style files, CSS tokens, UI layouts or product design changed.**

## Verified in isolated ChatGPT environment (not on owner's Mac)

- Contract tests 12/12 PASS.
- Native CSV tests 9/9 PASS.
- QA tests 80/80 PASS.
- Design lock PASS (approved CSS SHA-256 `75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`).
- Route checks PASS.
- Static check for broken relative NestJS imports PASS.
- Full npm dependency install, Next.js/NestJS build, end-to-end integration and DB/telemetry not yet verified in personal Mac environment.

## Important Git state

This ZIP is a local source package, NOT a Git clone. Extract into a clean local folder or copy its *contents* into the intended Git clone. Never automatically run `git init`, overwrite/remap remote, force push or merge.
