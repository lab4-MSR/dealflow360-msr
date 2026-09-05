# DealFlow360 — API Contract (v1.0)
**Single Source of Truth for Frontend & Backend Parallel Development**

Status: Draft for hackathon build · Owner: Platform team · Backing store: Supabase (Postgres + Auth + Storage + Realtime)

---

## 0. How to Use This Document

- This is the **contract**. Frontend builds against these shapes using mock data; backend implements to the same shapes. Neither side needs to wait on the other.
- Every endpoint has: method, path, roles allowed, request shape, response shape, and error cases.
- All endpoints are versioned under `/api/v1`.
- All list endpoints share one pagination/filter/sort convention (§2).
- All responses share one envelope (§3) and one error format (§4).
- Section §1 explains Supabase's role at a high level only — schema ownership stays with the backend team; frontend only needs the shapes in this doc.

---

## 1. Supabase — General Role (High Level Only)

DealFlow360 is multi-tenant (each `business` = one tenant). Supabase provides:

| Capability | Used for |
|---|---|
| **Postgres** | All relational data (businesses, users, customers, products, quotations, orders, invoices, etc.) |
| **Row Level Security (RLS)** | Tenant isolation — every tenant-scoped table is filtered by `business_id` matching the caller's JWT claim. Role-based policies further restrict rows (e.g., a Sales Rep only sees `owner_id = auth.uid()` rows unless they are a Manager/Admin). |
| **Supabase Auth** | Issues JWTs for both internal users and portal customers. Custom claims carry `business_id`, `role`, and (for customers) `customer_id`. |
| **Storage** | Business logos/branding, product images, invoice PDFs, quotation attachments. |
| **Realtime** | Powers live updates for: approval inbox, quotation negotiation, deal health alerts, notifications. |
| **Edge Functions / RPC** | Business-logic operations that must be atomic and server-trusted: discount rule evaluation, blended risk scoring, approval routing, warehouse split calculation, proration calculation. These are exposed to the frontend **only** through the REST endpoints in this document — the frontend never calls Supabase directly for business logic. |

The frontend talks **only** to the DealFlow360 API layer (§2 onward), not directly to Supabase tables, except for authenticated Storage file reads (signed URLs returned by the API).

---

## 2. Conventions

### 2.1 Base URL & Versioning
```
https://api.dealflow360.app/api/v1
```
Breaking changes bump to `/api/v2`. Additive fields never break `v1`.

### 2.2 Authentication
- Header: `Authorization: Bearer <supabase_jwt>`
- JWT custom claims (set at login/invite time):
  - `business_id` (null for Super Admin / platform users)
  - `role` — one of the roles in §5
  - `customer_id` (only present for Customer Portal users)
- All endpoints require auth unless marked **Public**.

### 2.3 Multi-Tenancy Header
No manual tenant header needed — `business_id` is derived from the JWT. Super Admin endpoints that operate *across* tenants explicitly say so.

### 2.4 Pagination (all list endpoints)
Query params:
| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | 1 | 1-indexed |
| `per_page` | int | 20 | max 100 |
| `sort` | string | resource default | e.g. `sort=-created_at` (prefix `-` = desc) |
| `search` | string | — | free-text search where supported |
| `filter[field]` | string | — | e.g. `filter[status]=pending_approval`, repeatable |

Response `meta` block (see §2.5) always includes `page`, `per_page`, `total`, `total_pages`.

### 2.5 Response Envelope
**Success (single resource / action):**
```json
{
  "success": true,
  "data": { },
  "meta": null,
  "error": null
}
```
**Success (list):**
```json
{
  "success": true,
  "data": [ ],
  "meta": { "page": 1, "per_page": 20, "total": 134, "total_pages": 7 },
  "error": null
}
```
**Error:** see §2.6.

### 2.6 Error Format
```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "DISCOUNT_LIMIT_EXCEEDED",
    "message": "Line 'Setup Service' discount 18% exceeds category limit of 10%.",
    "field": "lines[1].discount_percent",
    "details": { }
  }
}
```
HTTP status still applies normally (400, 401, 403, 404, 409, 422, 500). `error.code` is the machine-readable contract; see §16 for the full code list.

### 2.7 Common Field Conventions
- All IDs are UUID strings.
- All money fields are **minor-unit-free decimals** with an explicit `currency` field alongside (e.g. `"amount": 1499.00, "currency": "USD"`), never integers-as-cents, to keep FE math simple.
- All timestamps are ISO-8601 UTC (`2026-09-05T10:30:00Z`).
- All percentage fields (`discount_percent`, `margin_percent`) are plain numbers, e.g. `12.5` means 12.5%.
- Soft-delete pattern: resources support `?include_archived=true`; deletes are `DELETE` but set `deleted_at`, not physical removal, for audit integrity.
- Every mutating endpoint that touches money, discounts, or approvals accepts an optional `Idempotency-Key` header; replays with the same key return the original result instead of double-processing.

### 2.8 Realtime Channels (Supabase Realtime, consumed directly by FE)
| Channel | Payload | Used on page |
|---|---|---|
| `business:{business_id}:notifications` | Notification object (§14.2) | 10.2 / 10.3 |
| `business:{business_id}:approvals` | Approval instance update | 04.2 Approval Inbox |
| `quotation:{quotation_id}` | Quotation status/version change | 03.10, 03.11, 08.3–08.6 |
| `business:{business_id}:deal_health` | Deal health alert | 07.8–07.11 |

FE subscribes directly via the Supabase client using the same JWT; these channels are documented here for completeness but are not REST endpoints.

---

## 3. Roles (maps to page tree §00–10)

| Role code | Corresponds to page-tree section | Scope |
|---|---|---|
| `super_admin` | 01. Super Admin / Platform | Cross-tenant |
| `business_admin` | 02. Business Admin | Single tenant, full config |
| `sales_rep` | 03. Sales | Own customers/deals/quotations |
| `sales_manager` | 04. Sales Manager | Team-wide within tenant |
| `finance` | 05. Finance | Billing/high-risk approvals within tenant |
| `operations` | 06. Operations | Fulfillment/warehouse within tenant |
| `customer` | 08. Customer Portal | Own quotations/orders only, restricted view |

`07. Intelligence` and `09. Analytics` are visible to `business_admin`, `sales_manager`, and `finance` (read-only for the latter two on most sub-sections); `10. Shared` applies to all authenticated roles.

Every endpoint below lists which of these roles may call it. `403 FORBIDDEN` (code `ROLE_NOT_ALLOWED`) otherwise.

---

## 4. Domain Enums (shared vocabulary)

```
business_status        : pending_setup | active | suspended
user_status             : invited | active | suspended
customer_tier           : bronze | silver | gold | platinum
quotation_status        : draft | pending_approval | approved | sent
                           | under_negotiation | confirmed | rejected
                           | expired | cancelled
approval_status          : not_required | pending | approved | rejected | returned
approval_level           : none | sales_manager | finance | sales_manager_then_finance
risk_level               : low | medium | high | critical
discount_rule_type       : customer_tier | category | product | margin | global
fulfillment_status       : unfulfilled | partially_fulfilled | fulfilled | backordered
shipment_status          : pending | processing | shipped | in_transit | delivered | exception
subscription_status      : trialing | active | past_due | cancelled | expired
billing_cycle            : monthly | quarterly | semi_annual | annual
invoice_status           : draft | issued | paid | partially_paid | overdue | void
payment_status           : pending | succeeded | failed | refunded
negotiation_status       : none | requested | countered | accepted | rejected
notification_type        : approval | deal | customer | fulfillment | billing | subscription | system
severity                 : low | medium | high | critical
anomaly_type             : discount_anomaly | delivery_slippage | stalled_deal
```

---

## 5. Auth & Onboarding — `/auth`
*(maps to page-tree 00. PUBLIC / AUTH)*

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Internal user self-signup (first business admin). Body: `{ full_name, email, password, business_name }`. Creates `business` (status `pending_setup`) + `business_admin` user. |
| POST | `/auth/login` | Public | `{ email, password }` → Supabase session (`access_token`, `refresh_token`, `user`). |
| POST | `/auth/portal-login` | Public | Customer portal login — `{ email, password }` or `{ magic_link_token }`. Returns session scoped with `customer_id` claim. |
| POST | `/auth/logout` | All | Invalidates current session. |
| POST | `/auth/forgot-password` | Public | `{ email }` → sends reset email. Always `200` regardless of email existing (no enumeration). |
| POST | `/auth/reset-password` | Public | `{ token, new_password }`. |
| GET | `/auth/invitations/{token}` | Public | Fetch invitation details (invited email, role, business/company name, invited_by) to render Accept Invitation page. |
| POST | `/auth/invitations/{token}/accept` | Public | `{ full_name, password }` → activates invited user. |
| POST | `/auth/verify-email` | Public | `{ token }`. |
| POST | `/auth/resend-verification` | Authenticated (unverified) | — |
| GET | `/auth/session` | All | Returns current user profile + role + business (used to bootstrap the SPA / decide which page-tree branch to render). |

**Session/profile object** (`GET /auth/session` → `data`):
```json
{
  "user_id": "uuid",
  "email": "rep@acme.com",
  "full_name": "Jane Rep",
  "role": "sales_rep",
  "business_id": "uuid",
  "business_name": "Acme Distribution",
  "customer_id": null,
  "avatar_url": null,
  "permissions": ["quotations.create", "quotations.discount.apply"]
}
```

---

## 6. Platform / Super Admin — `/platform`
*(maps to page-tree 01)*. All roles: `super_admin` only, cross-tenant.

| Method | Path | Description |
|---|---|---|
| GET | `/platform/dashboard` | KPIs: total/active businesses, total users, total deals, total revenue, platform health, business growth trend, deal overview, revenue overview, recent activity, system health, alerts. |
| GET | `/platform/businesses` | List all businesses. Filters: `status`, `plan`, `created_after/before`, search. Table fields: business, admin, users count, deals count, revenue, status, created_date. |
| POST | `/platform/businesses` | Create business (see 01.3 fields: business info, address, initial admin, branding, configuration, currency/timezone/tax). Triggers admin invite email. |
| GET | `/platform/businesses/{id}` | Overview + summary + KPIs + deal/revenue performance + health + recent activity. |
| PATCH | `/platform/businesses/{id}` | Update status (`activate`/`suspend` via `{ status }`), configuration. |
| GET | `/platform/businesses/{id}/users` | Users within that business (super-admin view). |
| GET | `/platform/businesses/{id}/deals` | Deals within that business. |
| GET | `/platform/businesses/{id}/revenue` | Revenue detail for that business. |
| GET | `/platform/businesses/{id}/usage` | Usage metrics (seats, API calls, storage). |
| GET | `/platform/businesses/{id}/health` | Health indicators. |
| GET | `/platform/businesses/{id}/configuration` | Read-only view of tenant config. |
| GET | `/platform/businesses/{id}/activity` | Activity/audit feed. |
| POST | `/platform/businesses/bulk-action` | `{ business_ids: [], action: "activate"|"suspend"|"export" }`. |
| GET | `/platform/users` | All platform-visible users, filterable by business. |
| GET | `/platform/users/{id}` | User detail. |
| POST | `/platform/users/invite` | Invite a platform-level user. |
| GET | `/platform/analytics` | Platform-wide analytics. |
| GET | `/platform/audit` | Global audit log across all tenants. Filters: business, actor, action, date range. |
| GET | `/platform/system-health` | API / DB / auth / services status. |
| GET | `/platform/settings` | Platform-wide settings. |
| PATCH | `/platform/settings` | Update platform settings. |

---

## 7. Business Admin — Organization & Access — `/org`, `/users`, `/teams`, `/roles`
*(maps to 02.2–02.12)*. Roles: `business_admin` (write); relevant read access for others where noted.

| Method | Path | Roles | Description |
|---|---|---|---|
| GET/PATCH | `/org/profile` | business_admin | Company profile (name, legal name, industry, address). |
| GET/PATCH | `/org/branding` | business_admin | Logo, primary color, favicon (Storage upload → returns signed URL). |
| GET/PATCH | `/org/localization` | business_admin | Language, timezone, date format. |
| GET/PATCH | `/org/currency-tax` | business_admin | Currency, tax configuration. |
| GET/PATCH | `/org/settings` | business_admin | General business settings. |
| GET | `/users` | business_admin | List users. Filters: role, status, team. |
| POST | `/users/invite` | business_admin | `{ full_name, email, role, team_id? }`. |
| GET | `/users/{id}` | business_admin | User detail incl. activity, sessions. |
| PATCH | `/users/{id}` | business_admin | Update role/status. |
| DELETE | `/users/{id}` | business_admin | Deactivate (soft). |
| GET/POST | `/teams` | business_admin | List / create teams. |
| GET/PATCH/DELETE | `/teams/{id}` | business_admin | Team detail incl. members. |
| GET/POST | `/roles` | business_admin | List / create custom roles (if RBAC customization is supported). |
| GET/PATCH | `/roles/{id}/permissions` | business_admin | Get/set permission set for a role. |

---

## 8. Customers — `/customers`
*(maps to 02.13–02.15, 03.2–03.3)*. Roles: `business_admin` (full CRUD); `sales_rep`/`sales_manager` (read + create, scoped to "my customers" for rep).

| Method | Path | Description |
|---|---|---|
| GET | `/customers` | List. Filters: `tier`, `status`, `owner_id` (rep). Rep JWT auto-scopes to own customers unless manager/admin. |
| POST | `/customers` | Create. Body includes name, tier, contacts, billing address, default price list. |
| GET | `/customers/{id}` | Overview + contacts + deals + orders + billing + purchase history + activity. |
| PATCH | `/customers/{id}` | Update. |
| GET | `/customers/{id}/deals` | Deals for this customer. |
| GET | `/customers/{id}/orders` | Orders for this customer. |
| GET | `/customers/{id}/billing` | Billing summary. |
| GET | `/customers/{id}/purchase-history` | Historical purchases (feeds upsell/cross-sell engine). |
| GET | `/customers/{id}/activity` | Activity log. |

**Customer object:**
```json
{
  "id": "uuid",
  "business_id": "uuid",
  "name": "Acme Corp",
  "tier": "gold",
  "default_price_list_id": "uuid",
  "owner_id": "uuid",
  "status": "active",
  "contacts": [{ "name": "", "email": "", "phone": "", "is_primary": true }],
  "billing_address": { },
  "created_at": ""
}
```

---

## 9. Products, Categories & Pricing — `/products`, `/categories`, `/price-lists`
*(maps to 02.16–02.25)*. Roles: `business_admin` write; `sales_rep`/`sales_manager` read.

| Method | Path | Description |
|---|---|---|
| GET | `/products` | List. Filters: category, status, price range. |
| POST | `/products` | Create — name, category, price, unit, tax, description, variants (`attribute`, `values`, `extra_price`). |
| GET | `/products/{id}` | Overview + pricing + inventory (aggregated across warehouses) + sales history + activity. |
| PATCH | `/products/{id}` | Update. |
| GET/POST | `/categories` | List/create categories & subcategories. |
| GET | `/price-lists` | List price lists. |
| POST | `/price-lists` | Create — name, currency, customer-tier scope. |
| GET | `/price-lists/{id}` | Detail incl. line items. |
| PATCH | `/price-lists/{id}` | Update. |
| GET/POST | `/price-lists/{id}/items` | Per-product prices within the list. |
| GET | `/customer-pricing` | Customer-specific overrides. Filters: `customer_id`. |
| POST | `/customer-pricing` | Create override. |
| GET | `/volume-pricing` | Volume/quantity break pricing. |
| POST | `/volume-pricing` | Create tier: `{ product_id, min_qty, price }`. |
| GET | `/pricing-history` | Audit of price changes. |

**Resolved price endpoint** (used by Quotation Builder to get the effective unit price for a line):
| Method | Path | Description |
|---|---|---|
| GET | `/pricing/resolve?product_id=&customer_id=&quantity=` | Returns the effective unit price after price list, customer override, and volume pricing are applied, plus which rule won. |

```json
{
  "product_id": "uuid",
  "base_price": 500.00,
  "resolved_price": 460.00,
  "currency": "USD",
  "source": "volume_pricing",
  "applied_rule_id": "uuid"
}
```

---

## 10. Discount Governance — `/discount-rules`, `/customer-tiers`, `/discount-simulator`
*(maps to 02.26–02.32)*. Roles: `business_admin` write; `sales_manager`/`finance` read; used internally by Quotation endpoints.

| Method | Path | Description |
|---|---|---|
| GET | `/discount-rules` | List. Filters: `type` (customer_tier/category/product/margin/global), `status`, `customer_tier`, `category`. |
| POST | `/discount-rules` | Create. Body per rule type — see schema below. |
| GET | `/discount-rules/{id}` | Detail incl. evaluation history and change log (actor/timestamp/reason). |
| PATCH | `/discount-rules/{id}` | Update. |
| DELETE | `/discount-rules/{id}` | Archive. |
| GET/PATCH | `/customer-tiers` | Get/update the 4 tier configs (bronze/silver/gold/platinum): max discount, default price list, min margin, approval requirement, tier-assignment criteria. |
| POST | `/discount-simulator` | Dry-run: given a hypothetical quote shape, returns discount + risk + approval outcome without persisting anything. Same request/response shape as `POST /quotations/{id}/evaluate` (§12.4) but `quotation_id` optional. |

**Discount rule object:**
```json
{
  "id": "uuid",
  "name": "Gold Tier Ceiling",
  "type": "customer_tier",
  "priority": 10,
  "scope": { "customer_tier": "gold", "category_id": null, "product_id": null },
  "max_discount_percent": 15,
  "min_margin_percent": 20,
  "conditions": { "min_deal_value": null, "valid_from": null, "valid_to": null },
  "approval_required": true,
  "approval_level": "sales_manager",
  "status": "active"
}
```

---

## 11. Approval Configuration — `/approval-rules`, `/approval-chains`, `/approval-thresholds`
*(maps to 02.33–02.37)*. Roles: `business_admin` write; `sales_manager`/`finance` read.

| Method | Path | Description |
|---|---|---|
| GET/POST | `/approval-rules` | List/create. Trigger conditions: discount threshold, deal value, margin, risk score, customer tier, category. |
| GET/PATCH/DELETE | `/approval-rules/{id}` | Detail/update/archive. |
| GET/POST | `/approval-chains` | List/create chains: ordered steps, sequential/parallel/conditional logic, SLA per step, escalation. |
| GET/PATCH | `/approval-chains/{id}` | Detail/update. |
| POST | `/approval-chains/{id}/activate` \| `/deactivate` | Toggle. |
| GET/PATCH | `/approval-thresholds` | Deal value / discount / risk / margin threshold bands and their mapping to approver + chain. |
| POST | `/approval-simulator` | Dry-run of the full approval decision engine for a hypothetical scenario (customer, deal value, products, discount, margin, risk score) → returns approval_required, level, chain, approver, SLA, and a human-readable explanation (triggered rules, decision reason, recommended action). |

This same evaluation logic is what `POST /quotations/{id}/submit-for-approval` (§12.6) invokes internally — the simulator and the real submission share one engine so results are guaranteed consistent.

---

## 12. Deals & Quotations — `/deals`, `/quotations`
*(maps to 03.4–03.11, plus 04/05 approval views and 08 customer negotiation)*. This is the core of the platform.

### 12.1 Deals
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/deals` | sales_rep (own), sales_manager (team), business_admin (all) | List. Filters: stage, customer, rep, health, risk, value. |
| POST | `/deals` | sales_rep+ | Create — name, customer, expected close date. |
| GET | `/deals/{id}` | scoped as above | Overview + linked quotations + timeline + health. |
| GET | `/deals/{id}/timeline` | scoped | Chronological event feed (created, quote sent, negotiation, approval, fulfilled, billed). |
| GET | `/deals/{id}/health` | scoped | Health score breakdown (see §15.3). |

### 12.2 Quotation CRUD
| Method | Path | Description |
|---|---|---|
| GET | `/quotations` | List. Filters: `status`, `customer_id`, `deal_id`, `risk_level`, `min_value/max_value`, `expiring_before`. |
| POST | `/quotations` | Create draft. Body: `{ customer_id, deal_id?, deal_name, reference, expected_close_date }`. Returns quote with `quote_number` auto-generated and `status: "draft"`, `version: 1`. |
| GET | `/quotations/{id}` | Full detail — see full object shape §12.9. |
| PATCH | `/quotations/{id}` | Update header fields (customer notes, expiry, expected close date) while in `draft`/`under_negotiation`. |
| DELETE | `/quotations/{id}` | Archive (only if `draft`). |
| POST | `/quotations/{id}/duplicate` | Clone as a new draft. |

### 12.3 Line Items (Quotation Builder)
| Method | Path | Description |
|---|---|---|
| POST | `/quotations/{id}/lines` | Add a line: `{ product_id, quantity, unit_price? (defaults to resolved price), discount_percent }`. Server recomputes net price, margin, and triggers re-evaluation (§12.4) automatically; response includes updated governance/risk/approval preview alongside the new line. |
| PATCH | `/quotations/{id}/lines/{line_id}` | Update quantity/discount. Same recompute behavior. |
| DELETE | `/quotations/{id}/lines/{line_id}` | Remove line. Same recompute behavior. |

Because every line mutation must immediately reflect updated discount governance, margin, risk, and approval preview (per Quotation Builder page 03.10), **every line-mutation response returns the full recomputed quotation object**, not just the line — this avoids an extra round trip on every keystroke-equivalent action.

### 12.4 Evaluation (Discount / Risk / Approval Preview)
| Method | Path | Description |
|---|---|---|
| GET | `/quotations/{id}/evaluate` | Recomputes and returns, without changing status: discount governance result, margin intelligence, blended risk score, and approval preview. Call this after any line change if the client wants to re-check without waiting for the line-mutation response. |

**Evaluation object:**
```json
{
  "discount_governance": {
    "lines": [
      {
        "line_id": "uuid",
        "customer_tier_ceiling": 15,
        "category_ceiling": 10,
        "product_ceiling": null,
        "requested_discount_percent": 18,
        "allowed_discount_percent": 10,
        "excess_percent": 8,
        "violated_rule_ids": ["uuid"]
      }
    ],
    "order_level": {
      "requested_discount_percent": 14.2,
      "allowed_discount_percent": 15,
      "excess_percent": 0
    }
  },
  "margin": {
    "revenue": 12000.00,
    "cost": 9200.00,
    "gross_margin": 2800.00,
    "margin_percent": 23.3,
    "target_margin_percent": 25,
    "minimum_margin_percent": 15,
    "margin_impact": "warning"
  },
  "risk": {
    "blended_risk_score": 62,
    "risk_level": "high",
    "line_risks": [{ "line_id": "uuid", "risk_score": 80, "reason": "Service line 8pts over category limit" }],
    "aggregate_risk_note": "No single line critical, but cumulative excess across 3 lines elevates order risk.",
    "margin_risk": "medium",
    "customer_risk": "low"
  },
  "approval_preview": {
    "approval_required": true,
    "approval_level": "sales_manager_then_finance",
    "approval_chain_id": "uuid",
    "next_approver_role": "sales_manager"
  },
  "fulfillment_preview": {
    "stock_availability": "partial",
    "warehouse_availability": [{ "warehouse_id": "uuid", "available_qty": 40 }],
    "potential_split": true,
    "backorder_risk": "low"
  }
}
```
This is the exact payload shape used to render the Quotation Builder's Discount Governance, Margin Intelligence, Risk Intelligence, Approval Preview, and Fulfillment Preview panels (page 03.10).

> **Blended risk score, in one sentence:** each line is checked against *its own* discount ceiling (not one order-wide ceiling), and the score aggregates both single-line violations and many-small-violations-spread-across-lines, so neither a bad line nor "death by a thousand small discounts" slips through unnoticed.

### 12.5 Recommendations (Upsell / Cross-sell)
| Method | Path | Description |
|---|---|---|
| GET | `/quotations/{id}/recommendations` | Ranked list based on co-purchase history + active promotions + margin threshold. |
| POST | `/quotations/{id}/recommendations/{rec_id}/add` | Adds the suggested product as a new line; response = full recomputed quotation (margin/risk update immediately, per B5). |
| POST | `/quotations/{id}/recommendations/{rec_id}/dismiss` | Marks dismissed for this quote. |

```json
{
  "recommendation_id": "uuid",
  "product_id": "uuid",
  "product_name": "Extended Warranty",
  "reason": "Frequently bought with Laptop Pro",
  "promotion_tag": "Q3 Push",
  "margin_delta": 340.00
}
```

### 12.6 Submit for Approval / Approval Actions
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/quotations/{id}/validate` | sales_rep+ | Final pre-submit check (same engine as §12.4), returns blocking errors if any (e.g. missing customer address). |
| POST | `/quotations/{id}/submit-for-approval` | sales_rep+ | Runs the approval engine (§11). If `approval_required=false`, status → `approved` immediately and fulfillment preview is generated. Otherwise status → `pending_approval`, and an `approval_instance` is created with the resolved chain. |
| GET | `/approvals/inbox` | sales_manager, finance | Pending approvals assigned to the caller's role/level. Filters: risk, deal value, customer, rep, date. |
| GET | `/approvals/{approval_instance_id}` | sales_manager, finance | Full detail: blended risk score, approval steps (which shown only when required, e.g. Finance step hidden unless triggered), quotation snapshot at submission time. |
| POST | `/approvals/{approval_instance_id}/approve` | sales_manager, finance | `{ comment? }`. Advances to next step or, if last step, sets quotation `status: approved`. |
| POST | `/approvals/{approval_instance_id}/reject` | sales_manager, finance | `{ reason }` (required). Sets quotation `status: rejected`. |
| POST | `/approvals/{approval_instance_id}/return` | sales_manager, finance | `{ reason }` (required). Sets quotation back to `draft` for rep revision. |
| GET | `/approvals/history` | sales_manager, finance, business_admin | Fully decided approvals, filterable, for the Approval History page. |
| GET | `/quotations/{id}/approval` | any scoped role | Read-only approval status/history embedded in Quotation Details' Approval tab. |

Every approve/reject/return action writes an audit entry: `{ actor, timestamp, action, reason }` (§17).

### 12.7 Sending & Customer Negotiation (internal side)
| Method | Path | Description |
|---|---|---|
| POST | `/quotations/{id}/send` | Sets `status: sent`, generates the customer-portal link, notifies customer. Only allowed once `approval_status` is `not_required` or `approved`. |
| GET | `/quotations/{id}/negotiation` | Current negotiation state — customer request, counter discount, quantity/price changes, version comparison, risk recalculation, re-approval status. |

### 12.8 Fulfillment & Billing (embedded in quotation lifecycle)
See §13 (Fulfillment) and §14 (Billing) — triggered from the quotation once `status` reaches `approved`/`confirmed`.

### 12.9 Full Quotation Object (canonical shape — `GET /quotations/{id}`)
```json
{
  "id": "uuid",
  "quote_number": "Q-2026-000482",
  "version": 2,
  "status": "under_negotiation",
  "deal_id": "uuid",
  "customer": { "id": "uuid", "name": "Acme Corp", "tier": "gold" },
  "created_by": "uuid",
  "created_at": "",
  "expiry_date": "",
  "lines": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "Laptop Pro",
      "sku": "LP-100",
      "quantity": 10,
      "unit_price": 1200.00,
      "discount_percent": 12,
      "net_price": 1056.00,
      "tax_amount": 105.60,
      "line_total": 10665.60,
      "margin_percent": 22.4
    }
  ],
  "pricing": {
    "subtotal": 12000.00,
    "line_discounts_total": 1440.00,
    "order_discount": 0,
    "shipping": 150.00,
    "tax": 950.00,
    "grand_total": 11660.00,
    "currency": "USD"
  },
  "discount_analysis": { "...": "see §12.4 discount_governance" },
  "margin": { "...": "see §12.4 margin" },
  "risk": { "...": "see §12.4 risk" },
  "recommendations": [ ],
  "approval": {
    "approval_status": "approved",
    "approval_required": true,
    "current_level": null,
    "approval_chain_id": "uuid",
    "history": [ ]
  },
  "negotiation": {
    "negotiation_status": "requested",
    "customer_request": "Please reduce Setup Service by another 5%",
    "counter_discount_percent": 15,
    "version_comparison": { "previous_version": 1 },
    "risk_recalculated": true,
    "re_approval_status": "pending"
  },
  "fulfillment": { "...": "see §13.2" },
  "billing": { "...": "see §14" },
  "audit": [{ "actor": "uuid", "action": "line_discount_changed", "timestamp": "", "reason": "" }]
}
```

---

## 13. Fulfillment & Warehouses — `/warehouses`, `/fulfillment`, `/shipments`, `/backorders`
*(maps to 02.38–02.41, 06, 03.10/03.11 fulfillment tabs, 07.11)*

### 13.1 Warehouse Configuration (business_admin write; operations read)
| Method | Path | Description |
|---|---|---|
| GET/POST | `/warehouses` | List/create — name, code, type, address, contact, capacity, fulfillment settings (default warehouse, allocation priority, shipping cost, shipment priority). |
| GET/PATCH | `/warehouses/{id}` | Detail — overview, inventory, stock movements, shipments. |
| GET | `/warehouses/{id}/inventory` | Per-product available/reserved/reorder level/status. |
| POST | `/warehouses/{id}/stock-movements` | Record incoming/outgoing/transfer/adjustment. |
| GET/POST | `/shipping-rules` | Rules used by the auto-split allocator: destination, warehouse, order value, weight, product conditions → allocation strategy (stock availability / shipping cost / shipment count / warehouse priority) and shipping method. |

### 13.2 Fulfillment (operations + embedded in quotation lifecycle)
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/quotations/{id}/fulfillment/suggested-split` | sales_rep+, operations | Runs the auto-split allocator against live stock. Returns per-warehouse quantity, estimated shipment count, and estimated shipping cost. |
| POST | `/quotations/{id}/fulfillment/accept-split` | sales_rep+, operations | Accepts the suggested split, creates `fulfillment_order` + shipment records. |
| POST | `/quotations/{id}/fulfillment/override-split` | operations, sales_manager | `{ allocations: [{ warehouse_id, product_id, quantity }] }` manual override. |
| GET | `/fulfillment/queue` | operations | Orders awaiting fulfillment action. |
| GET | `/fulfillment/{id}` | operations, scoped rep/customer | Detail incl. shipment detail. |
| GET | `/backorders` | operations | Backorder queue. Filters: warehouse, customer, age. |
| GET | `/backorders/{id}` | operations | Detail. |
| POST | `/backorders/{id}/consolidate` | operations | Triggered by the automatic "Consolidate Remaining Backorder" prompt when stock arrives mid-fulfillment. |
| GET | `/shipments` | operations, scoped customer | Shipment tracking list. |
| GET | `/shipments/{id}` | operations, scoped customer | Tracking detail. |

**Suggested-split object:**
```json
{
  "quotation_id": "uuid",
  "allocations": [
    { "warehouse_id": "uuid", "warehouse_name": "Main Warehouse", "product_id": "uuid", "quantity": 6 },
    { "warehouse_id": "uuid", "warehouse_name": "East Depot", "product_id": "uuid", "quantity": 4 }
  ],
  "estimated_shipment_count": 2,
  "estimated_shipping_cost": 150.00,
  "backorder_risk": "low",
  "unfulfillable_quantity": 0
}
```

---

## 14. Subscriptions & Billing — `/subscription-plans`, `/subscriptions`, `/invoices`, `/payments`
*(maps to 02.42–02.46, 05.4–05.11, 03.10/03.11 billing tabs, 08.11–08.14)*

### 14.1 Plan Configuration (business_admin write)
| Method | Path | Description |
|---|---|---|
| GET/POST | `/subscription-plans` | List/create — name, type, price, currency, billing_cycle, features, usage limits, included products, trial config, proration rules, cancellation/refund policy. |
| GET/PATCH | `/subscription-plans/{id}` | Detail incl. subscriber metrics (active subscribers, new, churn, revenue). |
| GET/PATCH | `/billing-cycles` | Cycle definitions (monthly/quarterly/semi-annual/annual): duration, billing date, renewal behavior, auto-renewal, grace period, failed-payment behavior. |
| GET/PATCH | `/proration-rules` | Upgrade/downgrade proration behavior, cancellation rules (immediate vs end-of-period, notice period), refund rules (full/partial/none + calculation basis). |
| POST | `/proration-rules/test-calculation` | Dry-run proration: `{ current_plan_id, new_plan_id, change_date }` → `{ remaining_days, used_days, credit, charge, final_adjustment }`. Same engine used live at §14.3. |

### 14.2 Subscriptions (attached to an order/quotation line)
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/subscriptions` | finance, business_admin | Active subscriptions list. Filters: status, plan, customer. |
| GET | `/subscriptions/{id}` | finance, business_admin, scoped customer | Detail: plan, status, current period, billing history. |
| POST | `/subscriptions/{id}/change-plan` | sales_rep+, finance | `{ new_plan_id, quantity? }` — triggers proration (§14.3). |
| POST | `/subscriptions/{id}/cancel` | sales_rep+, finance, scoped customer | `{ effective: "immediate"|"end_of_period", reason }`. |
| GET | `/subscriptions/{id}/proration` | finance | Proration ledger for this subscription. |

### 14.3 Order Billing (mixed one-time + recurring)
| Method | Path | Description |
|---|---|---|
| GET | `/quotations/{id}/billing` | Returns one-time lines and recurring lines separated, upcoming billing schedule, and any pending proration. This is the shape rendered by page B7. |
| POST | `/quotations/{id}/billing/generate-invoice` | Generates the initial invoice(s) for one-time lines once the order is confirmed. |

```json
{
  "one_time_lines": [{ "product_id": "uuid", "amount": 4200.00 }],
  "recurring_lines": [{ "plan_id": "uuid", "billing_cycle": "monthly", "amount": 199.00, "next_billing_date": "" }],
  "upcoming_schedule": [{ "date": "", "amount": 199.00, "type": "recurring" }],
  "pending_proration": null
}
```

### 14.4 Invoices & Payments (finance write; scoped customer read)
| Method | Path | Description |
|---|---|---|
| GET | `/invoices` | List. Filters: status, customer, date range. |
| GET | `/invoices/{id}` | Detail incl. line items, payment status. |
| POST | `/invoices/{id}/void` | finance only. |
| GET | `/payments` | List. Filters: status, customer, date. |
| POST | `/payments` | Record a payment: `{ invoice_id, amount, method, reference }`. |
| GET | `/payments/failed` | Failed payments queue (Finance dashboard). |
| POST | `/payments/{id}/retry` | Re-attempt a failed payment. |
| POST | `/invoices/{id}/credit-note` | Issue a credit note (from cancellation/partial refund). |

---

## 15. Intelligence & Deal Health — `/intelligence`, `/risk`, `/deal-health`, `/insights`
*(maps to 07)*. Roles: `business_admin`, `sales_manager`, `finance` (read); `sales_rep` sees only their own deals' subset via `/deals/{id}/health`.

| Method | Path | Description |
|---|---|---|
| GET | `/intelligence/dashboard` | Combined KPIs across risk, deal health, and recommendations. |
| GET | `/risk/overview` | Aggregate risk KPIs. |
| GET | `/risk/high-risk-deals` | List. Filters: risk level, rep, customer, value. |
| GET | `/risk/{quotation_id}` | Full risk breakdown for one quotation (same shape as §12.4 `risk`). |
| GET | `/recommendations/upsell` | Ranked platform-wide upsell opportunities (not scoped to one quote). |
| GET | `/recommendations/cross-sell` | Same, cross-sell. |
| GET | `/recommendations/{id}` | Detail: product, reason, promotion, margin delta, related deal. |
| GET | `/deal-health/overview` | Healthy/at-risk/stalled/critical counts, health score breakdown (sales activity, customer engagement, approval progress, discount risk, margin health, fulfillment health), distribution and trend. |
| GET | `/deal-health/stalled-deals` | List. Filters: stage, rep, customer, stalled days, value. Includes `reason` (customer_inactivity/approval_delay/negotiation_delay/pricing_issue/fulfillment_issue). |
| GET | `/deal-health/discount-anomalies` | List. Fields: deal, customer, discount, allowed_discount, difference, severity, detected_at, explanation (WHAT/WHY/IMPACT/recommended_action). |
| POST | `/deal-health/discount-anomalies/{id}/dismiss` | Dismiss an anomaly. |
| GET | `/deal-health/delivery-slippage` | List. Fields: order, customer, warehouse, expected_delivery, current_eta, delay, severity, reason (inventory_shortage/warehouse_delay/shipping_delay/backorder). |
| GET | `/insights` | Decision Insights feed: title, category, severity, WHAT/WHY/impact/WHO/WHEN/NEXT ACTION. |
| POST | `/insights/{id}/action` | `{ action: "view_record"|"take_action"|"assign"|"dismiss", assignee_id? }`. |

**Deal health score object** (`GET /deals/{id}/health`):
```json
{
  "overall_health": 72,
  "sales_activity": 80,
  "customer_engagement": 65,
  "approval_progress": 90,
  "discount_risk": 40,
  "margin_health": 78,
  "fulfillment_health": 85,
  "status": "at_risk"
}
```

---

## 16. Customer Portal — `/portal`
*(maps to 08)*. Roles: `customer` only — every endpoint is scoped server-side to `customer_id` from the JWT. This is a genuinely separate, restricted surface: a customer can never reach an internal endpoint, and internal roles cannot call `/portal/*`.

| Method | Path | Description |
|---|---|---|
| GET | `/portal/dashboard` | Customer's own summary: open quotations, active orders, upcoming invoices. |
| GET | `/portal/quotations` | My Quotations list. |
| GET | `/portal/quotations/{id}` | Customer-facing quotation detail (subset of §12.9 — no cost/margin, no internal audit, no approval-chain internals; only line items, pricing, status, negotiation panel). |
| POST | `/portal/quotations/{id}/request-changes` | `{ line_id?, comment }` — line-level comment/change request. |
| POST | `/portal/quotations/{id}/counter-offer` | `{ counter_discount_percent, comment? }`. Sets `negotiation_status: countered`; if resulting terms exceed thresholds, quotation automatically re-enters the approval flow (§12.6) and `re_approval_status` is set. |
| POST | `/portal/quotations/{id}/confirm` | One-click confirm final terms. If within thresholds → moves straight to fulfillment (§13); otherwise blocked until re-approval completes, with a clear `pending_reapproval` response. |
| GET | `/portal/orders` | My Orders. |
| GET | `/portal/orders/{id}` | Order detail. |
| GET | `/portal/shipments` | Shipment list. |
| GET | `/portal/shipments/{id}` | Shipment detail/tracking. |
| GET | `/portal/invoices` | My Invoices. |
| GET | `/portal/invoices/{id}` | Invoice detail (with signed PDF URL from Storage). |
| GET | `/portal/subscriptions` | My Subscriptions. |
| GET | `/portal/subscriptions/{id}` | Detail. |
| POST | `/portal/subscriptions/{id}/cancel` | Customer-initiated cancellation (subject to cancellation rules §14.1). |
| GET/PATCH | `/portal/account/profile` | Customer contact profile. |
| GET/PATCH | `/portal/account/company` | Company info. |
| GET/PATCH | `/portal/account/preferences` | Notification/locale preferences. |

---

## 17. Shared — Search, Notifications, Profile, Preferences, Audit — `/search`, `/notifications`, `/me`, `/audit`
*(maps to 10, plus 02.49/03.7 audit views)*. Roles: all authenticated.

| Method | Path | Description |
|---|---|---|
| GET | `/search?q=` | Global search across deals, quotations, customers, products, orders, invoices, shipments — result set auto-scoped by caller's role/tenant. Response items include `type`, `id`, `title`, `subtitle`, `status`, `url`. |
| GET | `/notifications` | List. Filters: type, read/unread, priority. |
| POST | `/notifications/{id}/read` | Mark read. |
| POST | `/notifications/mark-all-read` | Bulk. |
| GET | `/me/profile` | Full profile (extends §5 session object) — security tab data: active sessions, login activity. |
| PATCH | `/me/profile` | Update name/phone/job title/avatar. |
| POST | `/me/change-password` | `{ current_password, new_password }`. |
| GET | `/me/sessions` | Active sessions list. |
| DELETE | `/me/sessions/{id}` | Revoke a session. |
| GET/PATCH | `/me/preferences` | Theme, density, locale, currency, date format, notification channel toggles. |
| GET | `/audit` | Tenant audit trail. Filters: actor, action type, entity, date range. Every mutating action across discount rules, approval rules, quotations, approvals, fulfillment, billing writes here with `{ actor, action, entity_type, entity_id, before, after, reason, timestamp }`. |
| GET | `/help/articles` | Help Center content (guides/FAQs/tutorials). |
| POST | `/help/tickets` | Create a support ticket. |
| GET | `/help/tickets/{id}` | Ticket status. |

**Notification object:**
```json
{
  "id": "uuid",
  "type": "approval",
  "title": "Quotation Q-2026-000482 needs your approval",
  "message": "Blended risk score 62 (high) — Acme Corp, $11,660.",
  "priority": "high",
  "related_record": { "type": "quotation", "id": "uuid" },
  "read": false,
  "created_at": ""
}
```

---

## 18. Analytics & Reporting — `/analytics`
*(maps to 09, 02.47/04.10/05.12 team-level reports)*. Roles: `business_admin`, `sales_manager` (team-scoped), `finance` (financial-scoped).

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/executive` | Cross-functional executive KPIs + insights. |
| GET | `/analytics/sales` | Pipeline, revenue, deals, win rate, pipeline stage distribution/velocity, rep/team/customer performance, funnel conversion. |
| GET | `/analytics/revenue` | Total/one-time/recurring revenue, MRR, ARR, growth, trend, breakdown by product/service/subscription/segment. |
| GET | `/analytics/discounts` | Average/total discount, exceptions, margin impact, distribution by tier/category/product/rep, governance (allowed vs violations). |
| GET | `/analytics/margin` | Gross margin, margin %, margin-at-risk, breakdown, margin risk buckets, trend. |
| GET | `/analytics/approvals` | Volume, average approval time, approval/rejection/return rate, distribution, bottlenecks/SLA breaches. |
| GET | `/analytics/fulfillment` | Fulfillment rate, backorder rate, on-time delivery, warehouse throughput/capacity/allocation efficiency, shipping metrics. |
| GET | `/analytics/subscriptions` | Active subscriptions, MRR/ARR, churn, renewal rate, growth (new/upgrade/downgrade/cancel), customer behavior. |
| GET | `/analytics/reports` | List saved custom reports. |
| POST | `/analytics/reports` | Create a custom report: `{ data_source, fields, filters, grouping, sorting, aggregation, visualization }`. |
| GET | `/analytics/reports/{id}` | Run/fetch a saved report's data. |
| POST | `/analytics/reports/{id}/export` | `{ format: "pdf"|"xlsx" }` → signed download URL. |
| POST | `/analytics/reports/{id}/schedule` | Recurring delivery config. |

All analytics endpoints accept the standard reporting filters: `period` (today/week/custom range), `sales_team`/`rep`, `approval_status`, `product`/`category`.

---

## 19. Error Code Reference (§2.6 `error.code`)

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body failed schema validation. |
| `ROLE_NOT_ALLOWED` | 403 | Caller's role cannot access this endpoint/action. |
| `TENANT_MISMATCH` | 403 | Resource belongs to a different business than the caller's JWT. |
| `RESOURCE_NOT_FOUND` | 404 | — |
| `DISCOUNT_LIMIT_EXCEEDED` | 409 | Line or order discount exceeds an active rule ceiling (informational on save-as-draft, blocking on submit unless approval covers it). |
| `MARGIN_BELOW_MINIMUM` | 409 | Computed margin is under the configured minimum for that scope. |
| `APPROVAL_ALREADY_DECIDED` | 409 | Attempt to act on an approval instance that's already approved/rejected. |
| `QUOTATION_LOCKED` | 409 | Quotation is in a status that doesn't allow this mutation (e.g. editing lines on a `confirmed` quote). |
| `INSUFFICIENT_STOCK` | 409 | Requested quantity exceeds total available stock across all warehouses. |
| `RE_APPROVAL_REQUIRED` | 409 | Negotiation changed terms beyond threshold; confirm blocked until re-approval completes. |
| `PLAN_CHANGE_INVALID` | 422 | Subscription plan change not permitted by proration/cancellation rules. |
| `PAYMENT_FAILED` | 402 | Payment attempt failed. |
| `IDEMPOTENCY_CONFLICT` | 409 | Same `Idempotency-Key` reused with a different request body. |
| `RATE_LIMITED` | 429 | Too many requests. |
| `INTERNAL_ERROR` | 500 | Unhandled server error. |

---

## 20. Non-Functional Notes

- **RLS is the enforcement layer, not the UI.** The 403 Unauthorized page (00.7) is user-facing only — every endpoint above must be enforced server-side (RLS + role checks in Edge Functions/RPC), never trusted from the frontend's role display alone.
- **Consistency guarantee:** discount evaluation, risk scoring, approval routing, and proration all live behind single shared engines (§10–12, §14.1) that are invoked identically whether triggered from a simulator, a live quotation, or a customer negotiation — the contract intentionally reuses one response shape (`evaluate` object, §12.4) everywhere this logic surfaces, so frontend and backend never have two versions of "what counts as risky" to keep in sync.
- **Versioned quotations:** every approved/sent quotation increments `version` on any negotiated change; `GET /quotations/{id}?version=N` can fetch a historical snapshot for the version-comparison panel.
- **Rate limits:** default 120 req/min per user; bulk/export endpoints 10 req/min.
- **This document is authoritative.** Any deviation discovered during implementation should update this file first, then code — not the other way around.
