# BuildNest — Approved UI / React Visual QA

Date: 2026-10-29. Status: **BLOCKED — real Next.js screenshot parity NOT VERIFIED**.

## Sources inspected

Read the historical and current Design Lock documents. Visually opened both approved
screenshots using the image viewer, and inspected approved index.html/styles.css/app.js,
current NativeStorefront, root/locale layouts, supplemental CSS and public fallback.

Current locations after owner-requested organization:
- `frontend/references/m0-approved-ui/{desktop-baseline.png,mobile-baseline.png,index.html,styles.css,app.js}`
- `frontend/src/components/native/storefront.tsx`
- `frontend/public/buildnest/`
- `docs/M1_1_DESIGN_LOCK.md` (current paths / historical behavior distinguished)
- `docs/history/M1_1_DESIGN_LOCK.md` (historical source; broken paths corrected in this task)

The old `references/` and `apps/web/` paths no longer describe the workspace.

## Original approved appearance

Desktop baseline PNG is 1440×1474 (full-page image; original capture viewport height
is not recorded in PNG metadata). Dark 260px sidebar with original brand/workspace
selector, purple selected navigation, bottom plan card and workspace footer. White
70px topbar, light gray content background, original welcome heading, purple hero
with six-bar illustration and two actions, four stats and four product cards per row.
Commercial models and How it works use a two-column lower section.

Mobile PNG is 390×2224 (full-page image). Sidebar hidden off-canvas behind hamburger;
61px topbar, no search/avatar, compact heading, purple hero with faded illustration,
one visible hero action at this width, two-column stats and products, stacked lower
panels. The original responsive breakpoints are 1280, 1030, 750 and 420px.
Typography uses the original system fallback stack; no new webfont introduced.

These observations describe the reference screenshots, not a running React screenshot.

## Confirmed differences and actions

1. **Thai hero text — source-confirmed difference, corrected.** Approved M0 I18N and
   native seed say `เครื่องมือที่ฉลาดขึ้น<br/>งานที่ง่ายขึ้น`. React hardcoded
   `เครื่องมือที่ฉลาดขึ้น / Workflow ที่ดีกว่า`, changing the copy and potentially wrapping.
   NativeStorefront now renders the existing localized `heroTitle`, splitting the
   approved `<br/>` into React line breaks. English remains the same. No unsafe HTML,
   new component architecture, color or spacing tokens added.
2. **Documentation paths — corrected.** Historical design lock referenced apps/web
   and legacy-preview. Paths now point to frontend and link to the current lock/report.
   Historical redirect behavior is labeled historical; locale pages render React.
3. **Sidebar/topbar/hero/cards/typography/spacing/colors/breakpoints — no runtime
   visual difference established.** Source markup/classes follow the original structure.
   Approved CSS, public CSS and React canonical.css are byte-identical. Supplemental
   CSS still exists and can affect computed styles. Hash equality does not establish
   rendered parity. No speculative CSS adjustments were made.
4. **Seed data — verified equal.** Executed Node vm extraction of approved BASE_PRODUCTS
   and deep comparison with native seed: all eight products equal. Fresh browser contexts
   are still required to prevent saved demo edits/theme/orders changing screenshots.

All three original CSS hashes remain:
`75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`.
No features, API contracts, backend modules or approved reference assets were changed.

## Actual commands and results

Node v22.22.2 / npm 10.9.7, monorepo root:
`/Users/sunshine/Documents/BuildNest/BuildNest — A Home for Software & Automation`.

| Command | Exit | Result |
| --- | --- | --- |
| `npm install --cache /private/tmp/buildnest-npm-cache --no-fund --fetch-retries=0 --fetch-timeout=10000` | 1 | BLOCKED: ENOTFOUND registry.npmjs.org fetching concurrently |
| `npm run dev:web` | 127 | BLOCKED: next command missing; server did not start |
| `npm test` | 127 | BLOCKED: contracts compilation cannot find tsc; later tests not reached |
| `npm run test:native` | 1 | BLOCKED: typescript module missing |
| `npm run typecheck -w @buildnest/web` | 127 | BLOCKED: tsc command missing |
| `npm run build -w @buildnest/web` | 127 | BLOCKED: next command missing |
| `npm run test:visual` | 1 | BLOCKED: Python playwright missing; no screenshots captured |
| `npm run test:design` | 0 | PASS: original stylesheet/shell source gates |
| `npm run test:routes` | 0 | PASS: 9 native route source checks |
| `node --check frontend/public/buildnest/app.js` | 0 | PASS: fallback JS syntax only |
| `node --test --test-reporter=dot backend/tests/mock-payment.test.cjs shared/tests/security-regression.test.cjs` | 0 | PASS: 61 mock/source tests, not React visual or runtime verification |
| Python ast.parse of new harness | 0 | PASS: Python syntax only |
| Node vm / assert.deepEqual of approved/native product seeds | 0 | PASS: all eight products identical |

## Real React Playwright comparison prepared, not executed successfully

Added `frontend/scripts/qa_native_visual.py` and root `npm run test:visual`.
Unlike the existing qa_m2.py offline comparison, this loads actual Next /en and /th.
It serves approved HTML/CSS/JS through a browser route in the same local origin and
Chromium process, without rewriting approved files or substituting a React renderer.

Protocol:
- Desktop 1440×900 and mobile 390×844, device scale 1, identical Chromium build.
- Each page uses a fresh context, light theme, en-US browser locale, UTC timezone,
  reduced motion and original unmodified seeds; reference is toggled to Thai for /th.
- Wait for React persistence effect, hero, network idle, document.fonts.ready and
  two animation frames. Disable animations/transitions/carets before capture.
- System fonts are inherited identically from the same browser/OS. Cross-OS rendering
  against archived PNGs can differ; fresh approved-vs-React captures are the controlled pair.
- Block external HTTP origins and /api calls. No production API or payment connection.
- Save both viewport and full-page approved/React PNGs, RGB diff PNGs, pixel counts,
  Chromium version and region geometry/computed style data (sidebar, topbar, welcome,
  hero, stats, product grid, lower panels). Different image dimensions fail comparison.
- Any pixel difference, page error or blocked request fails; no tolerance or baseline update.
- Output: `test-results/native-visual/`; outputs do not exist from this blocked run.

Once dependency access works, from root:

```bash
nvm use
npm install
npm run build -w @buildnest/contracts
npm test
npm run typecheck -w @buildnest/web
npm run build -w @buildnest/web
# In a local Python virtual environment with playwright and Pillow installed:
python3 -m playwright install chromium
npm run dev:web
# In another terminal, same Python environment:
npm run test:visual
```

Then inspect each screenshot/diff and region measurements before correcting additional
confirmed differences. This harness currently covers the Overview in EN/TH at both
widths. Other routes, open mobile menu, product modals and saved-state flows require
additional live checks; overview parity cannot certify every existing feature.

## Delivery status / remaining work

Original desktop/mobile screenshots inspected and linked to the owner. One confirmed
localized text mismatch corrected; paths repaired and real-runtime comparison prepared.
**Next startup, React screenshot capture, pixel comparison, TS checks and frontend build
remain blocked. No numerical visual-parity result is claimed.**

Changes: NativeStorefront hero title expression; package.json test:visual;
new qa_native_visual.py; historical Design Lock path corrections; this report.
No push, merge, deploy, provider setup, payment or redesign performed.
