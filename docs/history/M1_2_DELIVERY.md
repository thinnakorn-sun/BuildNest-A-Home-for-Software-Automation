# M1.2 — Native React Storefront Delivery (v0.3.1)

**Delivery category:** Development candidate; **not Production Ready**.

### Added
1. Native React storefront for 8 views plus product detail route; same M0 design language.
2. Seeded products, translations and Actor ideas extracted from approved M1.1 demo.
3. Browser-local demo state (no real payments), CSV parser and report download, responsive navigation, modal-based flows, simulated purchase and automation runs, Admin local editing.
4. Automated local-route and CSV tests, QA and design-lock instructions.
5. 9 page routes no longer redirect back to static HTML. Existing M2 APIs/auth/CMS remain intact.

### Not done
- npm full dependency install, full Next/Nest build, production React 19 integration test (environment blocked).
- Live Supabase, Stripe, R2, Apify credential setup or deployment.
- Release/installation binaries for products.

### Guide
- Source of truth: `apps/web/src/components/native/storefront.tsx`, `apps/web/src/components/native/seed.json`.
- Design source: `apps/web/public/buildnest/` with original `styles.css` unchanged.
- Run test gates: `npm run test:native`, `npm run test:routes`, `npm run test:design`, `npm run typecheck`, `npm run build` after `npm install` in an authorized development environment.
- To view full-color original clickable demo without npm: open `apps/web/public/buildnest/index.html` on a personal device (not the corporate machine).
