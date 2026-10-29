# BuildNest M1 development runbook

1. On authorized personal computer: install Node 22 or later; run `npm install` from project root.
2. Run `npm run test:contracts`, `npm run typecheck` and `npm run build`.
3. Run `npm run dev`. Verify Next `/en`, `/th`, `/en/products`, product detail, free CSV tool, automation preview, library, admin, mobile sidebar.
4. Verify Nest `GET http://localhost:4000/v1/health`, `/v1/catalog`, `/v1/catalog?category=Industrial`, `/v1/catalog/excel-automator`, `/v1/automations/templates`.
5. Verify no admin POST endpoints, payment submission or actual downloads exist. Verify UI does not request financial credentials.
6. Check generated Next artifacts and browser console; fix runtime errors before proceeding.
7. Compare with your existing Codex/Claude repository in a fresh branch. Merge only desired features; never overwrite a live app blindly.

## Definition of Done for M1

The code handoff is not deemed fully validated until the Next/Nest build and HTTP E2E tests pass in the dependency-enabled environment. Existing local pure contracts tests alone do not prove the integrated application works.
