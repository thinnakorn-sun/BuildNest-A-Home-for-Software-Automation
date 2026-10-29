# BuildNest M1.2 React Migration — QA and remaining gates

## Scope performed
- Created **native React components** in `apps/web/src/components/native/storefront.tsx`, reusing the approved CSS class structure and seeded 8-product catalog/TH-EN messages extracted from M1.1.
- Ported eight M0 customer-facing views to React: Overview, Marketplace, Automations, Free Tools, Guides, Library, Order History, Admin Dashboard. Added a ninth React route for individual product slugs.
- Added component state for product search, category filters, currency display, product modals, checkout demonstration, library/orders demonstration, automation simulation, CSV validation, browser-local admin CMS and language/theme toggles.
- Retained M2 account, live catalog, protected admin CMS and API code without changing their service boundaries. **M2 Supabase remains unconfigured**.
- Preserved `apps/web/public/buildnest/index.html`, `styles.css` and `app.js` as a separate legacy fallback, not the main Next.js customer UI.

## Tests run in isolated ChatGPT working container

| Verification | Result | Meaning |
|---|---|---|
| Native React TSX syntax | PASS | Transpilation and parsing succeed. Not equivalent to Full Build. |
| Isolated native React TypeScript semantic check with local module stubs | PASS | Detects local component-type mistakes without installing npm dependencies; does not validate Next/React library integrations. |
| `scripts/test_native_csv.cjs` | **9/9 PASS** | Quotes/commas/newlines, duplicate rows, empty cells and malformed input. |
| `scripts/check_native_routes.py` | **9/9 PASS** | Localized Next routes no longer redirect to legacy HTML. |
| `scripts/check_design_lock.py` | PASS | Canonical M0 stylesheet remains byte-identical; SHA-256: `75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`. |
| JSX static markup screenshot comparison vs. M1.1 at 1440x900 | **0% differing pixels** | Overview only; DOM constructed from compiled React JSX with an offline/static renderer and same CSS, after transitions settle. |
| JSX static markup screenshot comparison vs. M1.1 at 390x844 | **0% differing pixels** | Overview only; same limitation. |
| Marketplace screenshot comparison, desktop | 0.207% differing pixels | New navigation link and minor differences; visual comparison is **not pixel perfect**. |
| Admin screenshot comparison, desktop | 0.024% differing pixels | Chart and admin layout port; **not pixel perfect**. |
| React interaction harness using legacy React 16 with test-only hook adapter | **11/11 PASS** | Product selection, simulated checkout, library, CSV, demo CMS and language; test shim is not a real Next.js build. |
| Full Next.js + NestJS Build | **NOT RUN / BLOCKED** | npm registry unavailable in this environment; dependencies not installed. |
| Full browser E2E with React 19 and Next routing | NOT RUN | Must run after dependency install; test-only hook adapter is insufficient to certify production behavior. |
| Supabase integration & RLS E2E | NOT RUN | Requires isolated authorized test project. |

## Mandatory release acceptance gates before promoting the React route
1. On **personal or authorized remote runner**, run `npm install`, `npm run test:contracts`, `npm run test:native`, `npm run typecheck`, and `npm run build`.
2. Correct any actual compiler/runtime faults, run Next.js with NestJS, verify `/en`, `/th`, `/en/products`, `/en/automations`, `/en/tools`, `/en/docs`, `/en/library`, `/en/orders`, `/en/admin` and `/en/products/{slug}`.
3. Perform Playwright browser E2E using actual React 19/Next runtime and compare screenshots against approved M1.1 at desktop/mobile **after transitions settle**.
4. Review forms, payment **simulation-only labels**, accessibility, no fake revenue, and security boundaries before shipping.
5. Preserve the original demo as a fallback until these gates pass; do not use `buildnest-react` as a public production store.

## Hardware boundaries
All changes made in isolated ChatGPT container, not the user's corporate PC. No external account, Supabase project, Cloudflare resource or Stripe account was accessed or modified.
