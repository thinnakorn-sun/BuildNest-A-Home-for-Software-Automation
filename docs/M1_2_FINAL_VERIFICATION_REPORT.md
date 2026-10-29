# BuildNest — M1.2 Final Verification Report

วันที่: 2026-10-29 · ผลสรุป: **BLOCKED / Definition of Done ยังไม่ครบ**
ไม่มี successful full install/build/runtime/visual parity ที่ยืนยันได้ใน session นี้

## 1. Project root และโครงสร้าง

Root จริง:
`/Users/sunshine/Documents/BuildNest/BuildNest — A Home for Software & Automation`

- frontend: Next.js/React UI, session/proxy routes, assets, UI references/checks
- backend: NestJS API, guards/services, SQL drafts, integration specs, mocked API/payment tests
- shared/contracts: shared DTO/validation/sample catalog และ contract tests
- shared/tests: security และ approved-source regression checks
- docs: requirements, setup, reports

ทั้งสาม package ถูกค้นพบด้วย `npm pkg get name --workspaces` (exit 0)
ไม่พบ .git ในการค้นหาใกล้ root; ไม่มี branch/remote ที่ยืนยันได้ ไม่สร้างหรือแก้ Git
BuildNest ยังคงเป็น marketplace TH/EN สำหรับ reusable software/automation;
purchases/library/Actor runs เป็น browser demo, Auth/CMS มี source แต่ยังไม่ใช่ verified live integration

## 2. Phase 1: สาเหตุ npm install ล้มเหลว

ตรวจจริงด้วย Node 22.22.2 / npm 10.9.7 ผ่าน PATH ของ nvm ตาม .nvmrc
Node ที่เป็น default ของ shell คือ 25.9.0 / npm 11.12.1 จึงเลือกเวอร์ชันโครงการก่อนตรวจ

Package manager คือ npm workspaces ไม่มี package-lock.json, npm-shrinkwrap.json,
yarn.lock หรือ pnpm-lock.yaml ไม่ได้ลบ lockfile ใด
Root และ package manifests ทั้งสี่เป็น valid JSON ไม่มี custom http/git/file dependency URLs
package dependencies เป็น registry versions และ workspace package reference ตามเดิม

ผล config ที่ตรวจ (อ่านค่าทีละรายการ ไม่พิมพ์ auth tokens):
- `npm config get registry`: https://registry.npmjs.org/
- `npm config get strict-ssl`: true
- npm proxy / https-proxy: null; offline: false
- HTTP_PROXY, HTTPS_PROXY, ALL_PROXY, NO_PROXY และ lowercase variants: unset
- ไม่มี project .npmrc; effective userconfig=/Users/sunshine/.npmrc,
  globalconfig=/Users/sunshine/.nvm/versions/node/v22.22.2/etc/npmrc

Network evidence:
- Python socket.getaddrinfo('registry.npmjs.org', 443): gaierror [Errno 8]
  `nodename nor servname provided, or not known`
- socket.getaddrinfo('example.com', 443): error เดียวกัน
- `curl -I --connect-timeout 5 --max-time 10 https://registry.npmjs.org/`:
  exit 6, `Could not resolve host: registry.npmjs.org`

**สาเหตุที่ยืนยันได้:** DNS name resolution ของ external hosts ใช้ไม่ได้จาก execution
session นี้ ทำให้ npm เดิมรายงาน ENOTFOUND ก่อนเปิด TLS connection
ไม่ใช่หลักฐานว่า dependency URL, npm registry URL หรือ TLS certificate ผิด
Environment กำหนด network access แบบ restricted; หลักฐานนี้ยังแยกไม่ได้แน่ชัดว่า
DNS ถูกจำกัดโดย sandbox หรือเครือข่าย/DNS ของ Mac จึงไม่อ้างว่า system DNS ของ Mac เสีย
และไม่อ้างว่าแก้เครือข่ายสำเร็จ

ไม่มี install retry ในรอบนี้หลัง reachability ล้มเหลว ไม่เปลี่ยน registry, proxy, DNS,
certificate validation หรือระบบส่วนกลาง และไม่ใช้ alternate IP/mirror เพื่อ bypass

คำสั่ง install จากรอบก่อนที่เป็นต้นเหตุ:
`npm install --cache /private/tmp/buildnest-npm-cache --no-fund --fetch-retries=0 --fetch-timeout=10000`
exit 1: getaddrinfo ENOTFOUND registry.npmjs.org ขณะ fetch concurrently
คำสั่งนี้ **ไม่ได้รันซ้ำในรอบปัจจุบัน**

## 3. Fresh automated commands / results

บันทึก command, exit และ output tail แบบ machine-readable:
[docs/qa/M1_2_FINAL_COMMAND_RESULTS.json](qa/M1_2_FINAL_COMMAND_RESULTS.json)

| Command | Exit | ผลจริงรอบนี้ |
| --- | --- | --- |
| `npm test` | 127 | contracts build หา tsc ไม่พบ; ชุดถัดไปไม่ถูกเรียก |
| `npm run test:qa` | 1 | 64 tests passed; 1 failed test-file entry เพราะ source-services โหลด typescript ไม่ได้ |
| `npm run test:native` | 1 | typescript module missing |
| `npm run typecheck:contracts` | 127 | tsc command missing |
| `npm run typecheck` | 127 | หยุดที่ contracts: tsc missing |
| `npm run typecheck -w @buildnest/api` | 127 | tsc missing |
| `npm run typecheck -w @buildnest/web` | 127 | tsc missing |
| `npm run build` | 127 | หยุดที่ contracts: tsc missing |
| `npm run build -w @buildnest/api` | 127 | tsc missing; backend build ไม่สำเร็จ |
| `npm run build -w @buildnest/web` | 127 | next missing; frontend build ไม่สำเร็จ |
| `npm run test:visual` | 1 | Python playwright missing; ไม่ถึง browser launch |
| `npm run test:design` | 0 | approved base CSS/shell checks PASS |
| `npm run test:routes` | 0 | native route source checks 9 routes PASS |
| `node --test --test-reporter=spec backend/tests/mock-payment.test.cjs shared/tests/*.test.cjs` | 0 | 64 tests PASS เฉพาะ subset ที่ไม่ต้องมี TypeScript |
| `node --check frontend/public/buildnest/app.js` | 0 | syntax PASS |
| `npm pkg get name --workspaces` | 0 | web/api/contracts recognized |
| `node --test --test-reporter=spec shared/tests/approved-source.test.cjs` | 0 | 3 new checks PASS (รวมอยู่ใน subset 64 แล้ว ห้ามนับซ้ำ) |

Python ast.parse ของ frontend/scripts/*.py และ JSON parse ของ package manifests ผ่าน
เป็น syntax/config checks เท่านั้น ไม่มี lint command ในโครงการ

## 4. Runtime / integration / security

ไม่เริ่ม servers ซ้ำเมื่อ dependencies ยังขาด; startup รอบก่อนติด next missing
ไม่มี HTTP health/API response ใหม่ที่ยืนยันว่ารันผ่าน ไม่แทนแอปด้วย static server
หรือ placeholder เพื่ออ้างว่า runtime ใช้ได้

Source inventory ที่ตรวจ: Nest /v1/health, /v1/catalog, /v1/catalog/:slug,
/v1/me, /v1/admin/*, /v1/automations/templates; Next /api/session/*,
/api/admin/*, /api/catalog, /api/system/status
ยังไม่อ้างว่า endpoints เหล่านี้ผ่าน HTTP integration

Coverage ที่มี:
- Auth/admin: source-security checks รันแล้ว; mocked actual TypeScript service tests
  ยังถูกบล็อกด้วย TypeScript; HTTP authorization/RLS ไม่ผ่านการรัน
- Catalog validation/filter/search: existing contracts tests มีอยู่ แต่ compile ไม่ได้
- CSV: existing contracts/native tests มีอยู่ แต่ compile/transpile ไม่ได้
- Checkout/webhook dedup/entitlements/revocation/unauthorized download: mock-payment
  tests รันผ่าน เป็น QA simulation ไม่ใช่ Stripe/production implementation
- API errors/provider auth errors: source-services harness มี tests อยู่ แต่ยังโหลดไม่ได้
- Invalid CMS payloads: existing contracts admin tests ยังรันไม่ได้
- Routes: source consistency checks ผ่าน ไม่ใช่ navigation/runtime proof

เพิ่ม missing content regression checks 3 ข้อซึ่งรันได้: native products/actors เท่ากับ
approved M0; TH/EN translations เท่ากับ approved M0; React canonical/public CSS
เท่ากับ approved M0 ไม่ลบหรือเปลี่ยนเงื่อนไข tests เดิม

## 5. Visual verification

Approved assets อยู่ frontend/references/m0-approved-ui/ และ public fallback อยู่
frontend/public/buildnest/; React อยู่ frontend/src/components/native/storefront.tsx

ภาพ original desktop/mobile ถูกเปิดดูในงานก่อนหน้า ไม่ใช่ภาพ runtime ใหม่
Hash ผ่านจริง:
`75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`

| View | 1440×900 / 390×844 real React | Baseline / review |
| --- | --- | --- |
| Overview EN/TH | BLOCKED: Next/Playwright unavailable | approved overview PNGs + original HTML available; comparison harness prepared |
| Marketplace | NOT RUN | no approved page-specific PNG identified; visual review required |
| Product Details | NOT RUN | no approved page-specific PNG identified; visual review required |
| Automations | NOT RUN | no approved page-specific PNG identified; visual review required |
| Free Tools | NOT RUN | no approved page-specific PNG identified; visual review required |
| Library | NOT RUN | no approved page-specific PNG identified; visual review required |
| Order History | NOT RUN | no approved page-specific PNG identified; visual review required |
| Admin Dashboard | NOT RUN | old react-port QA image is historical evidence, not certified approved baseline; review required |

ไม่มี screenshots/diffs ใหม่ ไม่มี mismatched-pixel percentages ที่วัดในรอบนี้
ไม่สร้าง baseline ปลอม ไม่เขียนทับ approved images ไม่แก้ UI จากการคาดเดา
Overview harness ควบคุม viewport/device scale, browser/locale/timezone, fresh state,
fonts.ready และ animations แต่ยังต้อง execute และ inspect outputs จริง
ต้องเพิ่ม/รัน screenshot coverage อีก 7 views เมื่อ runtime พร้อม โดยระบุ review required
แทนการใช้ภาพที่เพิ่งสร้างเป็น approved reference

## 6. Files modified in this task

- README.md: จัด purpose/architecture/prerequisites/install/start/env/test/limitations
  ให้ตรง current paths; อธิบาย contracts build prerequisite และ DNS handoff
- .gitignore: เพิ่ม .venv/ และ __pycache__/ จาก documented browser setup
- shared/tests/approved-source.test.cjs: 3 dependency-free content/stylesheet regression checks
- docs/qa/M1_2_FINAL_COMMAND_RESULTS.json: fresh machine-readable command evidence
- docs/M1_2_FINAL_VERIFICATION_REPORT.md: รายงานนี้

ไม่แก้ runtime application code, UI tokens/layout, package versions, lockfiles,
provider configuration, API contracts หรือ existing test assertions

## 7. สิ่งที่ต้องทำบน Mac เพื่อปลด blocker

เปิด macOS Terminal ปกติบน personal Mac แล้วรัน:

```bash
cd '/Users/sunshine/Documents/BuildNest/BuildNest — A Home for Software & Automation'
nvm use
curl -I --connect-timeout 5 --max-time 10 https://registry.npmjs.org/
```

หาก Terminal นี้ resolve ได้ แปลว่ามีเส้นทางเครือข่ายที่ session นี้ใช้ไม่ได้ ให้ติดตั้งใน
Terminal นั้น ไม่ต้องเปลี่ยน DNS/SSL หาก Terminal ยัง resolve ไม่ได้ ให้ตรวจ network/VPN/proxy
ตามการตั้งค่าของคุณก่อน หยุด retry npm จน curl resolve ได้

หลัง network พร้อม:

```bash
npm install
npm run build -w @buildnest/contracts
npm test
npm run typecheck:contracts
npm run typecheck
npm run build
```

ครั้งแรกไม่มี lockfile จึงใช้ install; เมื่อสำเร็จให้เก็บและตรวจ package-lock.json
แล้วใช้ npm ci สำหรับการติดตั้งถัดไป ไม่ลบ lockfile

คง provider env ว่าง/ไม่ได้ตั้งค่า สำหรับ sample mode:

```bash
npm run dev
```

อีก terminal จาก root เดียวกัน:

```bash
curl -fsS http://localhost:4000/v1/health
curl -fsS http://localhost:4000/v1/catalog
curl -fsS http://localhost:4000/v1/automations/templates
curl -fsS http://localhost:3000/api/system/status
curl -fsS http://localhost:3000/api/catalog
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install playwright Pillow
python3 -m playwright install chromium
npm run test:visual
```

Node version ในทุก terminal ต้องตรง .nvmrc และใช้ Python venv เดียวกันสำหรับ browser tests
README อธิบาย env examples: Next อ่าน frontend/.env.local เมื่อมี;
Nest อ่าน process.env โดยตรง ไม่ได้โหลด backend/.env ให้อัตโนมัติ
คำสั่งด้านบนเป็น next actions **ยังไม่ได้พิสูจน์ว่าผ่าน**

## 8. Release blockers / technical debt / next milestone

1. Restore dependency download access; successful installation/lockfile required
2. Full TS/contracts/unit/service checks และ Next/Nest builds ยังไม่ผ่าน
3. Start both real apps และ verify local HTTP, errors/auth/admin paths ด้วย mocks
4. Real React screenshot comparison และ all eight views review ยังไม่ครบ
5. DB/RLS/security E2E ยังไม่ verified; duplicated catalog/UI sources เสี่ยง drift
6. Python browser dependencies ยังไม่ได้ pin/lock; ต้องบันทึกเวอร์ชันเมื่อทดสอบได้จริง
7. Git metadata ไม่ได้มากับ source package; ห้ามอนุมาน branch/remote หรือ push

Next milestone: **M1.2 closeout ต่อจน baseline ผ่านจริง** จากนั้นจึงเสนอ M2
Auth/RBAC/CMS บน isolated test DB ตาม charter ไม่มี Grafana, real payments,
production provider connection, deployment, push หรือ merge ในงานนี้
