# M2 Setup (personal/authorized environment ONLY)

1. Review all source and run `npm install && npm run typecheck && npm run build && npm run test:contracts` on an authorized development environment. Do **not** bypass build failures.
2. Create a separate test-only Supabase project. DO NOT execute migration on existing Production data; migration 0001 is an early draft and needs diff/review.
3. Review and apply `supabase/migrations/0001_schema_draft.sql`, then `0002_m2_auth_catalog.sql` in this order. Verify both functions are executable by `service_role` only and view has `security_invoker=true`.
4. Configure Auth email confirmation and allowed redirect URLs for YOUR domain. Set Supabase project region and appropriate access controls.
5. Populate environment for **server processes only** (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `API_INTERNAL_URL`, `WEB_ORIGIN`, `API_PORT`). Never use NEXT_PUBLIC_ for service role keys. Next uses server-side route handlers to call GoTrue and Nest.
6. Only after sign-up and verifying identity, manually grant first owner through trusted SQL editor:

```sql
insert into public.admin_members(user_id,role)
values ('YOUR-VERIFIED-AUTH-USER-UUID','owner');
```

7. Test invalid/expired access tokens (401), ordinary customer trying admin (403), admin allowed, service key not exposed to browser, signup not granting admin, and sample catalog not passed off as live.
8. Run `GET /v1/health`, then `GET /v1/catalog`. Auth frontend path `/{locale}/account`, CMS `/{locale}/manage/products`, API-backed catalog `/{locale}/live-catalog`.
9. Use DRAFT products first. After authenticated end-to-end tests pass, try publishing a sample and verify public catalog visibility.
10. No Stripe/R2/Apify keys belong in M2. Do not accept actual payments in this milestone.

**Environment variables are not automatically populated by the checked-in `.env.example`; copy to a private `.env` and load into server processes using secure local tooling. Do not commit `.env`.**
