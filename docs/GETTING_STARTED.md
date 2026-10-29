# BuildNest — Mac + VS Code Local Setup

## Choose ONE working project root

The correct root contains `AGENTS.md`, `package.json`, `frontend/`, `backend/`, `shared/`, `docs/`. Only open **this directory** in VS Code. Avoid `BuildNest/BuildNest` unless the inner folder is the root and the outer folder is intentionally only a container.

**If already cloned from GitHub:** The remote repository might only contain README. Import the ZIP's contents **into the cloned folder**, not into a new nested `BuildNest` subfolder, then review `git status`. The handoff archive has files at its root to support this.

**If working offline:** Extract ZIP once into a new empty folder and open that folder. A ZIP extraction is not automatically a Git repository; that's okay during initial local tests.

## Prerequisites

Personal Mac, Node.js `>=22.12`, npm, VS Code. Docker Desktop is optional and NOT needed for initial Build/Tests. No real secrets or Supabase/Stripe accounts required yet.

## Commands — run from monorepo root

```bash
pwd
ls -a
node -v
npm -v
npm install
npm run build -w @buildnest/contracts
npm run test:contracts
npm run test:native
npm run test:qa
npm run test:design
npm run test:routes
npm run typecheck
npm run build
npm run dev
```

Expected web `http://localhost:3000/en`, API base `http://localhost:4000/v1`. Inspect actual controller route for health and test with `curl` once running. These endpoints are **local development**, not a production API.

## If VS Code shows red imports

1. Confirm `pwd` is root with `package.json` and `workspaces` definition.
2. Run `npm install` from this root, **not** under `backend/`.
3. Build `@buildnest/contracts` (`npm run build -w @buildnest/contracts`).
4. In VS Code, open Command Palette → `TypeScript: Restart TS Server`; reload window if needed.
5. Inspect the first real error from `npm run typecheck` before making code changes.

## Git root mismatch

```bash
pwd
ls -a | head
find .. -name .git -maxdepth 3 -print
```

If `.git` is in the *parent clone*, switch to that folder in VS Code or copy this handoff's files **into** the clone. No `git init`, `git remote set-url` or push without reviewing the repository state and owner approval.

## Reporting to the owner

Provide the exact command, exit code, short error excerpt and what was changed for each failed step. Do not claim tests passed unless run, and do not treat historical README test counts as fresh test results.

## Local audit workspace layout

The current layout uses `frontend/` for Next.js and `backend/` for NestJS. Package names remain `@buildnest/web` and `@buildnest/api`; run all
npm commands from the root. `frontend/src/app/api/` contains Next server routes,
not the primary business backend. Shared contracts stay in `shared/contracts`.
Use `nvm use` to select the version in `.nvmrc`.

Browser QA additionally requires Python packages `playwright` and `Pillow`,
and a Playwright Chromium installation. The harness uses Playwright's bundled
Chromium by default; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use another
local executable. Browser QA was blocked by missing Playwright in this audit.
