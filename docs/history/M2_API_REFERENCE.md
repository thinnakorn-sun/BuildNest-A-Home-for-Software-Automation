# M2 API reference

All Nest endpoints default to `http://localhost:4000/v1`. New auth and admin UI uses same-origin Next route handlers to avoid browser JS handling Bearer tokens.

| Method | Path | Authentication | Behavior |
|---|---|---|---|
| GET | /v1/health | Public | Returns service mode and flags, no secrets |
| GET | /v1/catalog | Public | Sample catalog if not configured, else published-only Supabase view |
| GET | /v1/catalog/:slug | Public | One published product or demo sample |
| GET | /v1/me | Verified user Bearer | Fetch Supabase Auth user by access token |
| GET | /v1/admin/products | Verified user + admin DB membership | List real products; no sample admin write |
| GET | /v1/admin/products/:id | Verified user + admin DB membership | Fetch editable product with locales and prices |
| GET | /v1/admin/categories | Verified user + admin DB membership | List real categories |
| POST | /v1/admin/categories | Verified user + admin DB membership | Create category and audit, atomic RPC |
| POST | /v1/admin/products | Verified user + admin DB membership | Create/update localized product and audit via atomic RPC |
| POST | /api/session/login | Same-origin Next | GoTrue password authentication, HttpOnly cookies |
| POST | /api/session/register | Same-origin Next | Supabase signup, confirmation may be required |
| POST | /api/session/logout | Same-origin Next | Delete local cookies |
| GET | /api/session/me | Cookie | Next proxy `/v1/me`, refreshes session if possible |
| GET/POST | /api/admin/products | Cookie | Next proxy to protected Nest API |
| GET | /api/admin/products/:id | Cookie | Next proxy for the admin edit form |
| GET/POST | /api/admin/categories | Cookie | Next proxy to protected Nest API |
| GET | /api/catalog | Public | Next proxy to Nest read-only catalog |

Example `POST /v1/admin/products` body (request must have verified admin Bearer):

```json
{
  "slug":"excel-automator-pro",
  "categorySlug":"automation",
  "type":"desktop_app",
  "status":"draft",
  "featured":false,
  "locales":{
    "th":{"name":"Excel Automator","summary":"รวมไฟล์ Excel อัตโนมัติ","description":""},
    "en":{"name":"Excel Automator","summary":"Batch Excel workflow","description":""}
  },
  "prices":{"THB":99000,"USD":3900}
}
```

`prices` are integer MINOR units (satang/cents), not major unit THB/USD. To update an existing product, provide its UUID as `id` (admin API verifies it); other properties are always required. Supabase migration 0002 RPC performs atomic update+audit. Status `published` will make product visible, but **does not enable payments or downloads**.
