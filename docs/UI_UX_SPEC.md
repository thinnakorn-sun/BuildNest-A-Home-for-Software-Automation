> **M1.1 DESIGN LOCK:** The approved M0 visual shell is authoritative. Read `M1_1_DESIGN_LOCK.md` before any UI edits. Do not redesign.

# UX/UI specification — BuildNest M0 reference

## Visual design
Modern software marketplace with left-side product workspace navigation, dark navy sidebar, per-card product gradient imagery, accessible neutral surfaces, indigo action accents, controlled glass/depth only in hero. Supports light/dark and Thai/English. Working title `BuildNest`, not final approved brand.

- Layout: fixed/sticky sidebar 260px, sticky topbar 70px, content max-width ~1490px, horizontal card grid.
- Breakpoints: 1280, 1030, 750, 420px. Mobile hides sidebar under menu overlay; **no horizontal scroll at 390px tested**.
- Inputs/buttons: 9px radius, legible focus styles, contrast and keyboard navigation improvements required before production.
- Image assets: current CSS illustrations are placeholders; release screenshots should be genuine customer-safe screens of each product.
- Price and analytics: mock values explicitly labeled. Do not show fake reviews, fake testimonials, fake sales or fake Stripe results.

## Sitemap and screen contracts
| Route intent | Current demo view | Production route / sections |
|---|---|---|
| Home | Overview | `/[locale]` hero, categories, featured, trust, free tool pair, guides |
| Explore | Marketplace | `/[locale]/products` search, filter, sort, product cards |
| Product detail | Modal | `/[locale]/products/[slug]` rich screenshots, demo, docs, versions, license, checkout |
| Free tools | Free tools | `/[locale]/tools` and per-tool routes (client-side where safe) |
| Automation | Automations | `/[locale]/automations` job form, status, cost preview, history |
| Guides | Guides & docs | `/[locale]/guides/[slug]` useful TH/EN SEO content |
| Customer library | My library | `/[locale]/account/library` verified paid entitlements + signed downloads |
| Orders | Order history | `/[locale]/account/orders` provider state, refunds/receipts |
| Admin | Admin dashboard | `/[locale]/admin/*` staff-only routes with RBAC |
| Legal/support | Not included in M0 | `/[locale]/legal/*`, `/[locale]/support` |

## Reusable components
Sidebar; Topbar; Search; CategoryChip; ProductCard; ProductGallery; PriceLicenseMatrix; ProductDemoPanel; AuthGate; CheckoutState; EntitlementCard; DownloadButton; AutomationJobForm; JobTimeline; UsageCostCard; AdminMetrics; CatalogTable; ProductEditor; Breadcrumb; LanguageSwitcher; ThemeSwitcher; Toast; ConfirmationDialog; EmptyState.

## User flow acceptance
- Visitor searches `MQTT` and catalog narrows without reload.
- Visitor opens product details and sees clear specifications and launch state.
- Demo checkout clearly warns that no charge is made; confirmation creates browser-local demo purchase, not production entitlement.
- Customer library shows that demo purchase, while live revenue stays zero.
- CSV Validator handles quoted CSV, duplicates, missing fields and errors locally.
- Automation preview shows deterministic result clearly labeled `sample` and does not invoke Apify.
- Admin creates demo product stored locally; no production catalog mutated.
- Thai/English switch updates navigation and primary UI; product-localized descriptions display where available.
- Mobile nav menu opens/closes, filters and cards do not overflow width.

## Accessibility and internationalization backlog
Visible focus ring for every interactive card/control; correct aria labels/expanded states; dialog focus trap and focus restoration; full screen reader regression; locale-specific formatting; complete TH/EN copy review; URL language routing; RTL not in scope; no machine-generated translations presented as reviewed without human QA.

## Design quality gate
Contrast > WCAG AA targets, test keyboard-only navigation, 360/390/768/1280/1440 screenshot regression, test modal overflow, loading/empty/error states, avoid decorative graphics in place of product screenshots.
