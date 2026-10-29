# Proposed backend API contract (not deployed)

API base `/v1`, separate NestJS server. All POST endpoints validate input with strict schemas. Auth is a Supabase JWT verified server-side with correct audience/issuer. Admin role derives from trusted server-side membership.

```yaml
openapi: 3.1.0
info:
  title: BuildNest Business API (Proposed)
  version: 0.1.0
servers:
  - url: https://api.example.invalid/v1
paths:
  /catalog:
    get:
      summary: Published products
      parameters:
        - in: query
          name: locale
          schema: { type: string, enum: [th, en] }
      responses:
        '200': { description: Public catalog }
  /checkout/sessions:
    post:
      summary: Create server-priced Stripe Checkout Session
      security: [{ bearerAuth: [] }]
      responses:
        '201': { description: Provider-hosted checkout URL }
  /webhooks/stripe:
    post:
      summary: Validate signature and idempotently fulfill order
      responses:
        '200': { description: Event accepted or already processed }
  /me/library:
    get:
      summary: Purchased entitlements
      security: [{ bearerAuth: [] }]
      responses:
        '200': { description: Entitlement list }
  /me/downloads/{artifactId}:
    post:
      summary: Validate ownership and issue expiring R2 link
      security: [{ bearerAuth: [] }]
      parameters:
        - in: path
          name: artifactId
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: Signed link }
        '403': { description: No entitlement }
  /automations/{id}/jobs:
    post:
      summary: Validate quota, reserve spend and enqueue job
      security: [{ bearerAuth: [] }]
      responses:
        '202': { description: Job accepted }
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

Production implementation must add request/response JSON schema, status codes, idempotency headers, actor callback authentication, pagination and test cases.
