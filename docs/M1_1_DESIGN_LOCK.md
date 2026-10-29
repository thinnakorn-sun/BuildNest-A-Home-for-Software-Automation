# BuildNest M1.1 — Locked Design Baseline

## User-approved design (authoritative)
The original M0 screenshot and its exact CSS/HTML shell are the authoritative visual source. **No redesign allowed** without the user's explicit request.

The following remain visually frozen: sidebar (260px on desktop), brand, workspace selector, navigation labels/selected purple gradient, sidebar plan card, sticky white header, page max width, original purple hero, product artwork/cards, typography, radii, spacing and responsive breakpoints.

Baseline CSS SHA-256: `75a83016107b485b5e6928daac92bb663b497062ee3becfe01e8b7633479597f`. M1.1 `frontend/public/buildnest/styles.css` is **byte-identical** to M0; enhancements are isolated to `enhancements.css`.

## Canonical preview
- `frontend/public/buildnest/index.html` — canonical visual shell; open locally or visit `/buildnest/index.html` in Next. The current `/en` and `/th` routes render the native React port.
- `frontend/public/buildnest/app.js` — M0 browser-only catalog with M1.1 functions.
- `frontend/public/buildnest/enhancements.css` — new, scoped components only.
- `frontend/preview/` — packaged offline demo.

## Historical M1.1 engineering limitation

The paragraph below describes M1.1 history. Current locale route source renders
`NativeStorefront`; desktop/mobile visual parity and full builds still require
executed verification. This note does not change the locked visual baseline.

M1.1 Next.js routes temporarily redirect to the canonical HTML preview. This **guarantees design fidelity** but is not a completed React component migration. An eventual React migration must pass side-by-side desktop + mobile screenshot comparisons before the canonical view can be replaced. The NestJS API skeleton still exists and is not integrated with the frontend.

## New features (demo only)
1. CSV file load (browser-local, < 2 MB), validation and export JSON report.
2. Admin edit products, reset catalog and export catalog JSON (browser-local only).
3. Product library user guides (no real binaries or license keys).
4. Simulation settings for Actor, sample run history, export run JSON.
5. Built-in self-contained documentation summary (no dead links in standalone preview).

## Payment/auth/security status
Stripe, Supabase, Cloudflare R2 and Apify API are **not connected**; demo checkouts produce browser-local records only and should never be treated as entitlements. Sample Run data never contacts an external website.
