# Workflow diagrams: Plan A, Plan B, Hybrid and migration

These diagrams deliberately distinguish **actual payments** from **demo screens**. They are design specifications, not implemented integrations.

## Plan A — Apify Marketplace

```mermaid
flowchart TD
  D[Buyer discovers Actor on Apify] --> S{Apify account?}
  S -- No --> SIGN[Create Apify account]
  S -- Yes --> I[Provide actor input]
  SIGN --> I
  I --> V[Apify validates and runs Actor]
  V --> R[Dataset / result]
  V --> BILL{Eligible chargeable events?}
  BILL -- No --> F[No attributable developer payout]
  BILL -- Yes --> SHARE[Apify charges eligible usage and calculates developer share]
  SHARE --> COST[Deduct platform costs and fee per current terms]
  COST --> PAY[Monthly payout if payout requirements met]
```

Actor listing and running are hosted by Apify. An Apify free user is not automatically a paying customer. Confirm current pay-per-event fee and payout terms at launch; do not represent all Runs or all Dataset rows as payable Results.

## Plan B — owned website using Stripe and Apify/own worker

```mermaid
flowchart TD
  Visitor[Customer visits owned store] --> Catalog[View product + trial + documentation]
  Catalog --> Account[Supabase sign-in]
  Account --> Checkout[Backend creates Stripe Checkout session]
  Checkout --> Stripe[Stripe payment]
  Stripe -- Signed webhook --> Verify[Verify signature + idempotency]
  Verify --> Paid{Paid / fulfilled?}
  Paid -- No --> Wait[Pending / failed / refund reconciliation]
  Paid -- Yes --> Ent[Create entitlement / credit ledger]
  Ent --> Job[Customer submits authorized automation input]
  Job --> Reserve[Validate quota and reserve budget]
  Reserve --> Queue[Job queue]
  Queue --> Engine{Execution engine}
  Engine --> Apify[Apify API]
  Engine --> Own[Owned worker]
  Apify --> Settle[Receive status / verified units]
  Own --> Settle
  Settle --> Results[Store sanitized result metadata and settle ledger]
  Results --> Customer[Customer sees result, history and exports]
```

## Plan C — hybrid coexistence

```mermaid
flowchart LR
  ApifySearch[Apify discovery] --> A[Apify-hosted Actor / eligible usage]
  Search[SEO / community / GitHub] --> OwnWeb[Owned storefront]
  OwnWeb --> PaidProduct[Direct licenses and R2 downloads]
  OwnWeb --> Hosted[Owned automation jobs]
  Hosted --> Compute[Apify API or own worker]
  A --> Brand[Public product documentation / brand awareness]
  Brand --> OwnWeb
```

Do not imply Apify customer identity, usage details or contact information can be exported or cross-sold without permission and platform terms.

## A → B transition (go/no-go gates)

```mermaid
flowchart TD
  Pilot[Plan A: publish one quality Actor] --> Measure[Measure eligible paid users, return rate, per-1k cost, failure rate]
  Measure --> Demand{Real repeat paid demand?}
  Demand -- No --> Improve[Iterate use case / reliability / channel]
  Improve --> Measure
  Demand -- Yes --> Terms[Review Apify resale/API terms, privacy and unit economics]
  Terms --> Viable{Contribution margin and compliance pass?}
  Viable -- No --> AStay[Keep Plan A; avoid own billing overhead]
  Viable -- Yes --> BBuild[Build own auth, Stripe, credit ledger and job runner]
  BBuild --> Beta[Opt-in website beta for consenting customers]
  Beta --> Check[Compare customer acquisition, support, retention and profit]
  Check --> Decision{Better economics and customer experience?}
  Decision -- No --> Dual[Keep both channels while optimizing]
  Decision -- Yes --> Scale[Expand Plan B and retain Apify as optional channel]
```

## Purchase + download security state machine

`draft → pending_payment → paid → fulfilled` or `pending_payment → failed/canceled`; `paid → refunded/chargeback → entitlement revoked or reviewed`, depending on disclosed license policy.

No entitlement may be granted by visiting `/success` or manipulating localStorage. Signed R2 URL only after `session auth → entitlement → valid release → audit → signed GET`.

## SlipGuard verification model

`uploaded → OCR/QR extracted → external verification attempted → Verified / Suspicious / Duplicate / Unverified`, with reason codes and limited PII. Do not label a slip definitively fake solely from image analysis.
