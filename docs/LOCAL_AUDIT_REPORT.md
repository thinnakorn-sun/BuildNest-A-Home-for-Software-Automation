# BuildNest — Local Audit Report

วันที่ตรวจ: 2026-10-29 (Asia/Bangkok)
ขอบเขต: audit, stabilization และแยก frontend/backend ตามคำขอ ไม่มี feature ใหม่

## 1. ความเข้าใจธุรกิจ

BuildNest — A Home for Software & Automation เป็น marketplace ไทย/อังกฤษ
ขายซอฟต์แวร์ดาวน์โหลด desktop utilities, AI/OCR, Excel/CSV automation,
developer/industrial tools, templates/source bundles และ hosted automation ในอนาคต
ลูกค้าคือบุคคล นักพัฒนา และบริษัทที่ต้องการเครื่องมือแก้งานเฉพาะทาง
เจ้าของดูแล catalog, ราคา, releases, orders, support และการให้สิทธิ์
รายได้สองช่องทาง: ขายตรงบนร้าน และขาย Actor บน Apify ซึ่งแยก billing กัน
รายการใน seed เป็นแนวคิด/demo ไม่ใช่สินค้าที่เปิดขายสำเร็จแล้ว

## 2. Workspace และ Git

root ที่ตรวจจริง:
`/Users/sunshine/Documents/BuildNest/BuildNest — A Home for Software & Automation`

เป็น root ของ npm workspaces ไม่ใช่โฟลเดอร์ BuildNest ชั้นนอก
`git status --short` exit 128: `fatal: not a git repository`.
ค้นหา `.git` ภายใต้โฟลเดอร์ใกล้เคียงไม่พบ จึงไม่มี branch/remote ที่ยืนยันได้
ไม่ได้สร้าง Git repository หรือเปลี่ยน remote

ใช้ Node v22.22.2 / npm 10.9.7 ผ่าน PATH ของ nvm สำหรับทุก npm check ในรายงาน
Node default ที่พบก่อนเลือกเวอร์ชันคือ v25.9.0 เพิ่ม `.nvmrc` ให้เลือก 22.22.2

## 3. โครงสร้างและความรับผิดชอบ

```text
<workspace>/
  frontend/                    Next.js 15 / React 19, TH/EN storefront
    src/app/[locale]/       catalog, details, tools, library, orders, admin, account
    src/app/api/            Next server session endpoints และ API proxies
    src/components/native/  React port ของ UI เดิม + browser-local demo state
    public/buildnest/       original offline storefront ที่ล็อก design
  backend/                  NestJS 11 business API
    src/modules/            catalog, identity, admin, automation, health
    src/guards/             admin authorization
    src/services/           identity verification และ Supabase adapter
  shared/contracts/       shared DTO, validation และ sample catalog
  backend/supabase/migrations/      SQL drafts; ไม่ได้ apply
  backend/integrations/             integration contracts/stubs
  scripts/                  design, route, CSV, browser QA harnesses
  tests/qa/                 mock payment, source security, mocked service checks
  frontend/references/               approved UI baselines ไม่แก้ไข
  preview/                  offline demo
  docs/                     specifications และ reports
```

เดิมใช้ `frontend` และ `backend`; ย้ายเป็น `frontend` และ `backend` ตามคำขอ
คง package names `@buildnest/web`, `@buildnest/api`, `@buildnest/contracts`
และใช้ root npm commands เดิม ไม่แยกติดตั้ง dependencies ในแต่ละโฟลเดอร์
Next server routes ภายใน front เป็น BFF/session layer; business backend คือ NestJS
ทั้ง frontend/backend ใช้ contracts; contracts ต้อง build ก่อนเพราะ exports ชี้ dist

## 4. สถานะฟีเจอร์จากเอกสารและโค้ด

- **Implemented source / ตรวจบางส่วนได้:** approved storefront, React locale routes,
  seed catalog/search/details, browser CSV validator, API health/catalog/sample
  automation controllers, shared validations และ QA harnesses
- **Simulated:** browser checkout, orders/library, admin-local edits และ Actor runs;
  ไม่ใช่ payment, entitlement, license, downloads หรือ cloud execution จริง
- **Integration source, not verified live:** Supabase Auth, identity verification,
  database-derived admin role, protected CMS endpoints, atomic RPC calls และ SQL/RLS
- **Planned:** Stripe checkout/webhooks, private R2 delivery, verified entitlement,
  queued jobs/usage ledger, Apify execution, Grafana telemetry และ production deployment

ห้ามใช้ mock payment tests หรือ SQL source checks เป็นหลักฐานว่าระบบขายจริงปลอดภัย
ไม่มีการเชื่อมต่อ provider หรือใช้ real API keys ใน audit นี้

## 5. คำสั่งและผลที่รันจริง

PASS = exit 0 เท่านั้น; BLOCKED = รันแล้วล้มเหลวเพราะ prerequisites ขาด

| คำสั่ง | Exit | ผลจริง |
| --- | --- | --- |
| `npm install --cache /private/tmp/buildnest-npm-cache --no-fund` | 130 | หยุดหลังพบ registry DNS failure และ retry |
| `npm install --cache /private/tmp/buildnest-npm-cache --no-fund --fetch-retries=0 --fetch-timeout=10000` | 1 | BLOCKED: `getaddrinfo ENOTFOUND registry.npmjs.org` ที่ concurrently |
| `npm test` | 127 | BLOCKED ที่ contracts build: `tsc: command not found`; ชุดถัดไปไม่ถูกเรียก |
| `npm run test:native` | 1 | BLOCKED: ไม่พบ module typescript ทั้ง local/global fallback |
| `npm run test:qa` | 1 | 61 passed, 1 failed test-file entry; source-services โหลด TypeScript ไม่ได้ |
| `node --test --test-reporter=dot tests/qa/mock-payment.test.cjs tests/qa/security-regression.test.cjs` | 0 | PASS: 61 tests เฉพาะสองไฟล์นี้ |
| `npm run test:design` | 0 | PASS: approved CSS hash และ original shell checks |
| `npm run test:routes` | 0 | PASS: source checks ของ 9 native routes และ backup UI |
| `node --check frontend/public/buildnest/app.js` | 0 | PASS: JavaScript syntax เท่านั้น |
| `npm run typecheck` | 127 | BLOCKED ที่ contracts: ไม่พบ tsc |
| `npm run typecheck:contracts` | 127 | BLOCKED: ไม่พบ tsc |
| `npm run typecheck -w @buildnest/api` | 127 | BLOCKED: ไม่พบ tsc |
| `npm run typecheck -w @buildnest/web` | 127 | BLOCKED: ไม่พบ tsc |
| `npm run build` | 127 | BLOCKED ที่ contracts; ไม่ได้ build API/web ต่อ |
| `npm run build -w @buildnest/api` | 127 | BLOCKED: ไม่พบ tsc |
| `npm run build -w @buildnest/web` | 127 | BLOCKED: `next: command not found` |
| `npm run test:m2:browser` | 1 | BLOCKED: `ModuleNotFoundError: No module named 'playwright'` |
| `npm pkg get name --workspaces` | 0 | PASS: พบ web, api, contracts หลังย้าย |
| Python `ast.parse` ของ scripts/*.py | 0 | PASS: harness syntax หลังปรับ browser configuration |

มีการเรียก `node --test tests/qa/payment-simulation.test.cjs` ผิดชื่อหนึ่งครั้ง
(exit 1, file not found) แล้วตรวจชื่อจริงและรัน mock-payment.test.cjs ตามตาราง

ไม่มี package-lock.json ถูกสร้าง เพราะ install ไม่สำเร็จ
ไม่มี full build/typecheck/unit baseline ที่ผ่านครบ และไม่มี runtime/E2E proof
Visual regression ยังไม่ได้รันสำเร็จทั้ง desktop/mobile หรือ native React parity

## 6. การแก้ไขที่ทำ

1. ย้าย `frontend/` → `frontend/`, `backend/` → `backend/` ตามคำสั่งเจ้าของ
   ปรับ root workspaces, QA source paths, scripts, CI และ current docs ที่อ้าง path
   ลบ apps container เฉพาะเมื่อไม่มีแอปเหลืออยู่
2. ตรวจ SHA-256 ก่อน/หลังย้าย: application source/config 63 ไฟล์ตรงกันทั้งหมด
   อีกหนึ่งรายการเป็น Finder `.DS_Store` ซึ่งไม่ใช่ source และเปลี่ยนได้ระหว่างใช้งาน
3. เปลี่ยน `python` เป็น `python3` ใน npm scripts/CI/setup commands
   เพราะเครื่องไม่มี python command แต่มี python3
4. เพิ่ม `docs/M1_1_DESIGN_LOCK.md` จาก historical baseline เพื่อซ่อม path ที่เอกสารหลักบังคับให้อ่าน
   ปรับเพียง path แอปในสำเนา ไม่แก้ baseline assets
5. เพิ่ม `.nvmrc`; ปรับ `docs/CODEBASE_MAP.md` ให้ตรงโครงสร้างใหม่ และเพิ่ม setup notes
6. `frontend/scripts/qa_m2.py`: เลิก hardcode `/usr/bin/chromium` ซึ่งไม่มีบนเครื่องนี้
   ใช้ Playwright bundled Chromium หรือ `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`,
   สร้าง test-results ก่อนเขียน และคง assertions เดิมทั้งหมด
   ตรวจ syntax แล้ว แต่ browser execution ยัง blocked
7. สร้างรายงานนี้ ไม่มี feature/business/security logic ถูกแก้

ไฟล์ configuration/docs/harness ที่เกี่ยวข้อง:
`package.json`, `.nvmrc`, `.github/workflows/verify.yml`, `AGENTS.md`, `README.md`,
`scripts/{check_design_lock.py,check_native_routes.py,check_ts_syntax.cjs,test_native_csv.cjs,qa_m2.py}`,
`tests/qa/{source-services.test.cjs,security-regression.test.cjs}`,
current docs ที่เคยอ้าง frontend หรือ backend และรายงานนี้
Historical docs ใน docs/history และ references คงเดิม

Design hash ที่ตรวจผ่าน:
`75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`
ไม่แก้ HTML/CSS/TS/TSX ของแอป ไม่ redesign

## 7. ปัญหาและความเสี่ยงที่ยังเหลือ

- Registry DNS/network ใน session นี้บล็อกการติดตั้ง; ไม่ควรแก้ source imports หรือ
  เพิ่ม declaration ปลอมเพื่อซ่อน missing dependencies
- ไม่มี dependency lockfile ทำให้การ resolve เวอร์ชันยังทำซ้ำไม่ได้; ต้องสร้างจาก install ที่สำเร็จ
- ไม่พบ Git metadata จึงยังตรวจ branch, tracked diff หรือ uncommitted changes ด้วย Git ไม่ได้
- PRD milestone labels เก่าขัดกับ charter บางส่วน; ใช้ charter เป็น business authority
  docs/AGENTS.md มีคำแนะนำ UI เก่าที่ไม่สอดคล้อง design lock; คำสั่งเจ้าของให้คง UI เดิมมีลำดับเหนือกว่า
- Catalog seed มีทั้ง contracts และ native seed.json; storefrontend/offline demo และ React
  มีหลาย implementation จึงเสี่ยงข้อมูล/พฤติกรรมต่างกัน ต้องทดสอบ parity ก่อนรวม source
- Auth/CMS/RPC มี source แล้วแต่ยังไม่มี isolated DB/RLS integration proof
- QA บางส่วนตรวจ source ด้วย regex หรือ mocked services; ไม่แทน API runtime/security E2E
- Browser harness เดิมมีข้อความ build status แบบ hardcoded; ห้ามใช้ JSON จาก harness นี้
  แทนผล full build จริง ขณะนี้ยังสร้าง JSON ใหม่ไม่ได้เพราะ Playwright ขาด
- ไม่มี lint script ใน root package.json; ไม่อ้างว่า lint ผ่าน
- การย้ายโฟลเดอร์ผ่าน source/path/design checks แต่ยังต้องพิสูจน์ full builds และ runtime หลังติดตั้งได้

## 8. Milestone ที่แนะนำ

**ถัดไป: M1.2 closeout — clean reproducible local baseline**

เมื่อ registry ใช้งานได้: จาก root ใช้ Node ใน .nvmrc, รัน npm install,
สร้าง/ตรวจ package-lock, รัน npm test, npm run typecheck, npm run build,
ติดตั้ง browser QA prerequisites แล้วตรวจ desktop/mobile และ native React parity
ทดสอบ local health/catalog และ demo journeys โดยไม่ตั้งค่า production credentials
ถ้าพบ compiler/config errors จึงค่อยแก้จาก error จริงและรันซ้ำ

เมื่อ baseline ผ่านครบ ค่อยเสนอ M2 development Auth/RBAC/CMS กับ isolated test DB
ตาม charter และขออนุญาตเชื่อมบริการแยกต่างหาก
Grafana/OBS-1 ต้องรอ baseline และ explicit approval; ยังไม่เริ่มในงานนี้

หยุดหลัง audit นี้ ไม่มี push, merge, deploy, Grafana หรือ provider mutation

## Follow-up: owner-requested complete folder organization

เปลี่ยนชื่อ front เป็น frontend และย้ายไฟล์สนับสนุนตามหน้าที่จริง:
references/preview/frontend QA → frontend, SQL/integration specs/API tests → backend,
contracts/cross-workspace checks → shared. Root เหลือ frontend, backend, shared, docs
พร้อมไฟล์ตั้งค่าและ CI กลาง ดู tree ปัจจุบันใน CODEBASE_MAP.md
ผล/คำสั่งใน audit ด้านบนเป็นประวัติของการตรวจครั้งก่อน ไม่ใช่ผล full build หลังย้ายล่าสุด

ตรวจหลังจัดโครงสร้างล่าสุด (Node 22.22.2):
- `npm pkg get name --workspaces`: exit 0, พบครบ 3 packages
- `npm run test:design`: exit 0, CSS hash เดิม
- `npm run test:routes`: exit 0, 9 routes
- `node --check frontend/public/buildnest/app.js`: exit 0
- `node --test --test-reporter=dot backend/tests/mock-payment.test.cjs shared/tests/security-regression.test.cjs`: exit 0, 61 tests
- SHA-256 comparison ของ source/assets ที่ย้าย 83 ไฟล์: ไม่พบเนื้อหาเปลี่ยน
- Python harness syntax: PASS
- Full build/typecheck ไม่ได้รันซ้ำใน follow-up; ยังไม่มีผลผ่านจาก audit ก่อนหน้า


## Latest audit — 2026-10-29, after complete folder organization

Re-read AGENTS, PROJECT_CHARTER, CODEBASE_MAP, GETTING_STARTED, CODEX_HANDOFF,
M1_1_DESIGN_LOCK, PRD and ARCHITECTURE in the owner's specified order.
Business summary was delivered in Thai before changes. Current root remains
`/Users/sunshine/Documents/BuildNest/BuildNest — A Home for Software & Automation`.
Layout: frontend (UI/assets/preview/UI checks), backend (API/SQL/integration specs/API tests),
shared (contracts and cross-workspace checks), docs (project documents).
Dependencies flow from both apps to shared contracts; generated contracts dist is required.
`git status --short` exit 128; nearby `.git` search found none. No branch or remote verified.

Fresh commands used Node 22.22.2 and npm 10.9.7 via the nvm installation PATH:

| Command | Exit | Fresh result |
| --- | --- | --- |
| `npm install --cache /private/tmp/buildnest-npm-cache --no-fund --fetch-retries=0 --fetch-timeout=10000` | 1 | BLOCKED: getaddrinfo ENOTFOUND registry.npmjs.org, fetching concurrently |
| `npm test` | 127 | BLOCKED: contracts compilation cannot find tsc; later suites not reached |
| `npm run test:native` | 1 | BLOCKED: typescript module absent |
| `npm run test:qa` | 1 | 61 pass, 1 failed test-file entry; source-services cannot load typescript |
| `npm run typecheck` | 127 | BLOCKED at contracts: tsc absent |
| `npm run build` | 127 | BLOCKED at contracts: tsc absent; API/web builds not reached |
| `npm run test:design` | 0 | PASS: original shell checks and approved CSS hash |
| `npm run test:routes` | 0 | PASS: source checks for 9 React routes |
| `npm run test:m2:browser` | 1 | BLOCKED: Python playwright module absent |
| `node --check frontend/public/buildnest/app.js` | 0 | PASS: syntax only |
| `npm pkg get name --workspaces` | 0 | PASS: web, api, contracts recognized |

No dependency lockfile was generated; clean reproducible baseline remains incomplete.
No runtime, DB integration, production safety or visual parity pass is claimed.
No retries with production credentials or alternate external services were attempted.

Only two documentation corrections in this latest audit:
- GETTING_STARTED: remove nonexistent root tests folder and malformed former-folder descriptions.
- M1_1_DESIGN_LOCK: distinguish historical redirect behavior from current NativeStorefront
  routes; correct offline/static preview locations. No design rules or application assets changed.

Architectural risks remain: duplicated native/offline UI and catalog seeds, stale milestone
language in PRD relative to authoritative charter, source/mock QA coverage that does not
prove live behavior, and unverified Auth/CMS/RLS integration. No architecture replacement warranted.
The business remains a bilingual reusable software marketplace: implemented demo storefront
and CSV source, simulated purchases/library/automation, unverified Auth/CMS integration code,
and planned Stripe/R2/Apify/Grafana services.

Next milestone remains M1.2 closeout: restore registry access, complete root install,
generate/review lockfile, run all tests/typecheck/build and desktop/mobile visual checks.
Then propose M2 isolated development Auth/RBAC/CMS verification. Grafana requires a healthy
baseline and separate approval. Work stops here; no new features, push, merge or deployment.
