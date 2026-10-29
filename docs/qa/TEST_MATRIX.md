# BuildNest Test Matrix

| Area | Test kind | Current stage | What is proven | What is not proven |
|---|---|---|---|---|
| Catalog validation | Existing real TypeScript unit tests | PASS | DTO validation on sample inputs | Full API/DB integration |
| CSV | Existing native pure-function unit tests | PASS | CSV parsing, duplicate/missing values | All file encodings, browser end-to-end |
| IdentityService | Existing source executed with dependency mocks | PASS | Bearer syntax, user verification, role lookup boundaries | Supabase auth endpoints live |
| SupabaseService | Existing source executed with fetch mocks | PASS | Public/private key usage and failure behavior | Actual provider configuration and RLS |
| Mock payments | QA-only business-rule engine | PASS | Failure, refund, duplicate, tamper and access-gate logic | Stripe protocol, crash recovery, concurrent DB transactions |
| Security policies | Static source assertions | PASS | Required guards/RLS definitions present in files | Actual database roles/integration security |
| UI design | SHA-256 design-lock check | PASS | Baseline files unchanged | Complete browser screenshot E2E after build |
| CI | Workflow source updated | NOT EXECUTED on GitHub | QA command included in pipeline | Hosted CI build success |
| Application production | End-to-end | NOT TESTED | — | All actual provider integrations |
