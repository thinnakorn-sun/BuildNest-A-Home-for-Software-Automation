# BuildNest M1.1 — Release Notes

## Why this release exists
The user identified unwanted visual drift between M0 and M1. M1.1 restores the **exact approved M0 UI** and introduces a hard design lock. M1 React route surfaces redirect to the canonical HTML until matching UI components pass visual parity. This is a deliberate temporary bridge, not a claim of production-ready Next.js UI.

## Retained unchanged
- Sidebar, brand and workspace badge
- Top navigation / search / language / theme
- Overview title, purple gradient hero and illustration
- Product card layout, original colors and typography
- Mobile drawer and responsive breakpoints

## Functional additions (client-side only)
- CSV file selection in browser (2 MB cap), validate and JSON export
- Admin local product add, edit, delete custom item, catalog export and reset
- Simulated Actor item count and dataset label, run history and JSON export
- Product guide modal from library following simulated checkout
- Six working documentation summary modals instead of dead standalone links
- Next routes mapped to the corresponding canonical M0-style preview tabs

## Validation performed
- Original M0 vs M1.1 desktop 1440px: byte-for-byte identical screenshot pixels (same viewport)
- Original M0 vs M1.1 mobile 390px: byte-for-byte identical screenshot pixels (same viewport)
- 20/20 browser checks passed, no JavaScript exceptions
- Shared contracts 6/6 tests passed after local TS compilation
- 28 TypeScript/TSX files parse without syntax errors
- CSS style hash baseline verified; GitHub Action checks CSS integrity before build

## Outstanding engineering work
- Port original M0 UI to React components *without any visual differences*
- Install dependencies and verify full Next/Nest builds (not done here)
- Connect Supabase Auth/RLS, Stripe Test Mode + verified webhook, Cloudflare R2 private delivery, and Apify API
- Perform end-to-end tests and security review before production launch

## Rules for AI assistants
Read root `AGENTS.md` and `docs/M1_1_DESIGN_LOCK.md` before UI changes. Never redesign implicitly; preserve screenshots and tokens.
