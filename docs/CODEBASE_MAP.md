# BuildNest — Working Codebase Map (v0.3.2 handoff)

The folder root is the directory containing **`package.json`, `AGENTS.md`, `frontend/`, `backend/` and `shared/`**. Don't create `BuildNest/BuildNest` when importing a ZIP into an existing folder.

```text
BuildNest — A Home for Software & Automation/
├── frontend/             หน้าบ้านและไฟล์ที่ใช้ดูแลหน้าบ้าน
│   ├── src/              Next.js pages, components และ server session/proxy routes
│   ├── public/           HTML, CSS, JavaScript และ static assets เดิม
│   ├── scripts/          design lock, route, CSV และ browser checks
│   ├── references/       approved UI และภาพอ้างอิง
│   └── preview/          offline demo
├── backend/              หลังบ้าน
│   ├── src/              NestJS API, guards และ services
│   ├── supabase/         SQL migrations (ยังไม่ apply)
│   ├── integrations/     API/integration specifications และ templates
│   └── tests/            API service tests และ payment simulation
├── shared/               สิ่งที่ใช้ร่วมกันทั้งสองฝั่ง
│   ├── contracts/        shared types, validation และ contract tests
│   ├── scripts/          cross-workspace syntax check
│   └── tests/            security checks ที่ตรวจทั้ง frontend/backend
├── docs/                 เอกสารโครงการและรายงาน
├── package.json          คำสั่งและ npm workspaces กลาง
├── README.md
└── AGENTS.md
```

## Source-of-truth order when documentation conflicts

1. **Business behavior / what's being built:** `docs/PROJECT_CHARTER.md`.
2. **Actual implemented behavior:** inspect code and verify with tests/build; a document cannot make functionality real.
3. **UI:** `frontend/references/m0-approved-ui/` and `docs/M1_1_DESIGN_LOCK.md`.
4. **Contracts:** `shared/contracts/src/`.
5. **Desired future architecture:** `docs/ARCHITECTURE.md` and `docs/PRD.md` (may be ahead of code).
6. **Observability plan:** `docs/observability/` (NOT yet implemented).
7. **Release history:** `docs/history/` (historical, not current task list).

## Primary routes and boundaries

- Browser: locale `/en` or `/th`; storefront route pages under `frontend/src/app/[locale]`.
- Next.js server: `/api/session/*`, `/api/admin/*`, `/api/catalog`, `/api/system/status` — verify actual handlers before claiming behavior.
- NestJS: global prefix `/v1`, controllers in `backend/src/modules/{catalog,identity,admin,automation,health}`.
- Only trusted API/server code may read privileged Supabase service credentials, when integration is explicitly enabled.
- Demo store library/checkout is not an authority for downloads. Data in LocalStorage or seed JSON isn't proof of payment.

## Why earlier VS Code errors occurred

- A clone of the GitHub repository contained only README because project files were not pushed.
- The ZIP was extracted into an existing `BuildNest` folder, creating `BuildNest/BuildNest` and confusing repo root/cwd.
- `@nestjs/common`, workspace aliases and Next types are unresolved until **`npm install` at the monorepo root**, then build shared contracts.
- `git status` reports `not a git repository` if shell cwd is the unpacked ZIP outside the cloned `.git` repository. This is separate from TS package errors.

Don't fix a missing `.git` by blindly running `git init` or changing the remote. Establish the intended folder/root first.
