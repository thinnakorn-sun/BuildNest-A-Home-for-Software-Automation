# BuildNest — A Home for Software & Automation

BuildNest เป็น marketplace ไทย/อังกฤษ ขาย downloadable software, desktop utilities,
AI/OCR, Excel automation, developer tools และ hosted automation ในอนาคต
ลูกค้าคือบุคคล นักพัฒนา และบริษัท ช่องทางขายตรงกับ Apify Store แยก billing กัน

สถานะ: M1.2 development baseline **ยังไม่ผ่านครบ** หน้าร้านใช้ seed data;
checkout/library/orders และ automation runs เป็น browser-local demo
Auth/CMS มี integration source แต่ยังไม่ได้พิสูจน์กับฐานข้อมูลจริง
Stripe, R2, Apify execution และ Grafana ยังไม่เชื่อมต่อ

## Architecture / workspace

```text
<project root>/
  frontend/               Next.js 15 / React 19 หน้าร้าน TH/EN
    src/app/api/          Next server session/proxy routes
    public/buildnest/     approved original HTML/CSS/JS fallback
    references/           approved desktop/mobile screenshots และ source
    scripts/              UI/CSV/route/Playwright checks
  backend/                NestJS 11 business API
    src/                  catalog, identity, admin, health, sample automation
    supabase/migrations/  SQL drafts (ยังไม่ apply)
    integrations/         provider contracts/specifications
    tests/                mocked payment และ source-service tests
  shared/
    contracts/            shared types, validation, sample API catalog
    tests/                cross-workspace security/content checks
    scripts/              cross-workspace syntax checker
  docs/                   requirements, design lock, audit reports
  package.json            npm workspaces และคำสั่งกลาง
```

ทั้งสองแอปใช้ `@buildnest/contracts`; ต้อง build contracts ให้มี `dist/` ก่อน
Next.js ดูแล UI/session proxy; NestJS เป็น primary business backend
คง approved M0/M1.1 design: [Design Lock](docs/M1_1_DESIGN_LOCK.md)
ดู [Project Charter](docs/PROJECT_CHARTER.md), [Codebase Map](docs/CODEBASE_MAP.md),
[Setup](docs/GETTING_STARTED.md) และ [ข้อกำหนด agent](AGENTS.md)

## Prerequisites

Personal Mac, Node.js 22.22.2 ตาม `.nvmrc`, npm, Python 3 สำหรับ source checks
Browser checks เพิ่ม Python `playwright`, `Pillow` และ Playwright Chromium
Docker และ provider accounts ไม่จำเป็นสำหรับ sample-mode baseline

เปิดโฟลเดอร์ที่มี package.json นี้ ไม่ใช่โฟลเดอร์ BuildNest ชั้นนอก
ไม่ต้องสร้างโปรเจกต์ใหม่หรือ `git init` หากยังไม่ยืนยัน Git root

## ตรวจเครือข่ายและติดตั้ง

จาก macOS Terminal ที่ใช้เครือข่ายปกติของคุณ:

```bash
cd '/Users/sunshine/Documents/BuildNest/BuildNest — A Home for Software & Automation'
nvm use
node --version
npm --version
npm config get registry
curl -I --connect-timeout 5 --max-time 10 https://registry.npmjs.org/
```

Registry ควรเป็น `https://registry.npmjs.org/` หาก resolve ไม่ได้ ให้หยุดก่อน
ไม่ต้องแก้ dependencies, SSL, system DNS หรือ proxy เพื่อหลบข้อผิดพลาด
หาก Terminal ใช้ได้แต่ Codex session ใช้ไม่ได้ ให้ติดตั้งจาก Terminal นี้

ปัจจุบันไม่มี lockfile ที่ส่งมากับ workspace จึงใช้ npm install ครั้งแรก:

```bash
npm install
npm run build -w @buildnest/contracts
```

เมื่อ install สำเร็จ ตรวจและเก็บ package-lock.json ไว้ ใช้ `npm ci` สำหรับการติดตั้ง
ครั้งต่อไปเมื่อ lockfile ตรงกับ package.json ไม่ลบ lockfile เพื่อแก้ install failures
ไม่เปลี่ยน package manager เป็น yarn/pnpm

## Environment: sample/local mode

ไม่ต้องตั้งค่า provider credentials สำหรับ baseline คง `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ว่าง/ไม่ได้ตั้งค่า และไม่มี real keys

Frontend example: `frontend/.env.example` (Next ใช้ `frontend/.env.local` เมื่อสร้าง)

```dotenv
API_INTERNAL_URL=http://localhost:4000
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Backend example: `backend/.env.example`

```dotenv
API_PORT=4000
WEB_ORIGIN=http://localhost:3000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

NestJS bootstrap ปัจจุบันอ่าน process.env โดยตรง ไม่ได้โหลดไฟล์ .env ให้อัตโนมัติ
ใช้ค่าเริ่มต้นได้ หรือ export เฉพาะค่า local ที่จำเป็นใน terminal
ไม่ copy template ใน backend/integrations ไปเป็น credentials ใช้งานจริง

## Local development

หลังติดตั้งและ build contracts แล้ว:

```bash
npm run dev
```

หรือสอง terminals จาก root: `npm run dev:api` และ `npm run dev:web`
Web: http://localhost:3000/en และ /th; API: http://localhost:4000/v1

ตรวจ runtime เมื่อ servers พร้อม (ยังไม่ได้ยืนยันผลใน Codex session นี้):

```bash
curl -fsS http://localhost:4000/v1/health
curl -fsS http://localhost:4000/v1/catalog
curl -fsS http://localhost:4000/v1/automations/templates
curl -fsS http://localhost:3000/api/system/status
curl -fsS http://localhost:3000/api/catalog
```

Health ใน sample mode ควรมี mode=preview; system/status ต้อง paymentsEnabled=false
และ automationExecutionEnabled=false ค่าเหล่านี้ไม่ใช่หลักฐานว่าทุก integration ทำงาน

## Automated checks

```bash
npm test
npm run typecheck:contracts
npm run typecheck
npm run build
```

แยก build: `npm run build -w @buildnest/api`, `npm run build -w @buildnest/web`
แยก tests: `npm run test:contracts`, `npm run test:native`, `npm run test:qa`,
`npm run test:design`, `npm run test:routes`
ไม่มี lint script ในเวอร์ชันนี้

Browser environment (ติดตั้งเมื่อเครือข่ายพร้อม):

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install playwright Pillow
python3 -m playwright install chromium
npm run test:visual
```

`test:visual` ต้องมี Next server รันจริง; เปรียบเทียบ Overview EN/TH ที่ 1440×900
และ 390×844 กับ approved HTML ใน Chromium เดียวกัน ออกภาพ/JSON ที่
`test-results/native-visual/` ไม่เขียนทับ approved references
`test:m2:browser` เป็น offline fallback QA คนละขอบเขตกับ React runtime

## Known limitations / release gates

- Codex session ล่าสุด resolve DNS ไม่ได้ทั้ง npm registry และ example.com;
  ไม่ได้ retry install หลังตรวจ reachability ว่าล้มเหลว
- ยังไม่มี successful full install, lockfile, builds, runtime หรือ visual parity results
- Visual harness ปัจจุบันครอบคลุม Overview; อีก 7 views ต้องตรวจ runtime/screenshots
  และให้เจ้าของ review หากไม่มี approved page-specific baseline
- Passing mock payments, source regex checks หรือ CSS hashes ไม่ยืนยัน payment security,
  entitlements จริง, DB/RLS หรือ visual parity
- ปัจจุบันไฟล์โปรเจกต์นี้ไม่มี .git; ยังไม่ยืนยัน branch/remote
- ขั้นถัดไปคือปิด M1.2 baseline ให้ผ่านครบ ก่อนเสนอ M2 Auth/RBAC/CMS บน isolated DB
  Grafana ต้องรอ baseline และ approval แยก ห้าม push/merge/deploy โดยไม่มีอนุญาต

ผลล่าสุด: [M1.2 Final Verification Report](docs/M1_2_FINAL_VERIFICATION_REPORT.md)
และ [UI Visual QA](docs/UI_VISUAL_QA_REPORT.md)
