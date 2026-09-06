# DealFlow360

<p align="center">
  <strong>Next-Generation Enterprise CPQ, Deal Orchestration & Revenue Operations Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Express-v5.1-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=flat-square" alt="License" />
</p>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features & Capabilities](#-key-features--capabilities)
- [System Architecture](#-system-architecture)
- [Live Testing Personas & Credentials](#-live-testing-personas--credentials)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [API Reference & Endpoints](#-api-reference--endpoints)
- [Data Model & Multi-Tenancy](#-data-model--multi-tenancy)
- [Build & Quality Assurance](#-build--quality-assurance)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**DealFlow360** is an enterprise-grade **Configure, Price, Quote (CPQ)**, deal orchestration, and revenue operations platform engineered to unify fragmented sales processes. 

Traditional B2B quote-to-cash workflows suffer from rogue discounting, slow approval cycles, disjointed inventory fulfillment, and manual invoice tracking. DealFlow360 solves this by connecting **Sales, Operations, Finance, and Customers** in a single multi-tenant system powered by automated governance, real-time margin visibility, multi-warehouse fulfillment, and predictive deal intelligence.

---

## 🚀 Key Features & Capabilities

### 1. 🏢 Multi-Tenant Foundation & RBAC
- **Strict Tenant Boundaries**: Isolated data access enforced at both database (RLS) and API gateway layers via `business_id`.
- **Granular Role-Based Access Control**: Tailored workspaces for Super Admins, Business Admins, Sales Managers, Sales Reps, Operations Specialists, Finance Officers, and Customers.
- **Organization Management**: Customizable company profiles, currency formatting, tax rates, team hierarchies, and permission sets.

### 2. 💰 Dynamic CPQ & Pricing Engine
- **Product Catalog Management**: Multi-category hierarchical catalog with SKU tracking, unit costs, list prices, and active/archived statuses.
- **Price Lists & Customer Tiers**: Flexible tiered pricing models, volume break tables, and customer-specific contract pricing.
- **Real-Time Margin Calculation**: Automatic margin safeguards with instant gross profit feedback during quote creation.

### 3. 🛡️ Discount Governance & Approval Chains
- **Approval Threshold Rules**: Define discount ceilings requiring managerial sign-off based on percentage or deal value.
- **Multi-Level Approval Routing**: Hierarchical approval escalation chains ensuring deals pass through team leads, sales directors, or finance.
- **Discount & Approval Simulator**: Interactive sandbox enabling sales reps to test proposed discounts against active rules prior to quote submission.

### 4. 📊 Deal Pipeline & Opportunity Management
- **Visual Sales Pipeline**: Interactive Kanban board and tabular views with drag-and-drop stage updates (`Discovery` &rarr; `Proposal` &rarr; `Negotiation` &rarr; `Won` / `Lost`).
- **Stage Velocity & Timeline Tracking**: Full audit history of stage transitions, activity notes, and deal progress timestamps.
- **Blended Deal Health Scoring**: Predictive health scores calculated using stage age, discount deviation, contact recency, and activity cadence.

### 5. 📝 Quotation Lifecycle & Customer Negotiation
- **Visual Quote Builder**: Line-item configuration with multi-product additions, item-level discounts, tax computation, and live subtotal calculations.
- **Customer Negotiation Portal**: Secure customer portal enabling clients to review quotes, submit line-item counter-offers, accept terms, or request revisions.
- **Revision History & PDF Generation**: Version-controlled quotations preserving historical changes with automated PDF generation.

### 6. 📦 Operations & Multi-Warehouse Fulfillment
- **Multi-Warehouse Inventory**: Real-time stock tracking across global and regional distribution hubs.
- **Automated Stock Allocation**: Split order fulfillment across multiple facilities based on stock availability and shipping rules.
- **Shipment & Backorder Management**: Dispatch tracking, carrier rules, backorder queueing, and status progression (`Pending` &rarr; `Allocated` &rarr; `Shipped` &rarr; `Delivered`).

### 7. 💳 Billing, Invoicing & Subscriptions
- **Recurring Subscription Plans**: Monthly, quarterly, and annual billing cycle configurations.
- **Automated Invoice Generation**: Convert accepted quotations into compliant invoices with due dates, taxes, and unique invoice numbers.
- **Payment Reconciliation & Proration**: Track paid, issued, and overdue invoices with proration support for mid-cycle plan changes.

### 8. 🧠 AI Deal Intelligence & Analytics
- **Stalled Deal Detection**: Automated alerts identifying deals lingering beyond expected stage duration.
- **Win/Loss & Risk Analytics**: Actionable risk factor flags highlighting margin risks, approval bottlenecks, and competitive pressures.
- **Prescriptive Recommendations**: AI-driven guidance suggesting optimal discount ranges and next-best actions to accelerate closing.

### 9. 🌐 Customer Self-Service Portal
- Dedicated external portal for client accounts (`/portal`).
- Review open quotations, negotiate pricing in real-time, accept proposals, track shipment statuses, and view invoice payment history.

### 10. 👑 Platform Superadmin Console
- Centralized multi-business management (`/platform`).
- Tenant creation, subscription plan administration, cross-tenant revenue analytics, system health monitoring, and global audit logs.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Frontend)"]
        SPA["DealFlow360 Web App (React 19 + Vite + Tailwind CSS v4)"]
        Portal["Customer Self-Service Portal (/portal)"]
        Admin["Platform Superadmin Console (/platform)"]
    end

    subgraph APILayer ["API Gateway (Backend - Express v5 + TypeScript)"]
        AuthMiddleware["Auth & Tenant Isolation Middleware (JWT + business_id)"]
        Router["49 REST Endpoints (/api/v1/*)"]
        PricingEngine["CPQ & Pricing Calculation Engine"]
        ApprovalEngine["Multi-Level Approval Engine"]
        FulfillmentEngine["Warehouse Stock Allocation Engine"]
    end

    subgraph DataLayer ["Data & Cloud Layer (Supabase)"]
        Postgres[(Supabase PostgreSQL Database)]
        RLS["Row-Level Security Policies"]
        AuthService["Supabase Auth (JWT + Custom Claims)"]
        Storage["Supabase Storage (PDFs, Logos, Attachments)"]
    end

    SPA -->|REST API Requests (Bearer JWT)| AuthMiddleware
    Portal -->|REST API Requests (Bearer JWT)| AuthMiddleware
    Admin -->|REST API Requests (Bearer JWT)| AuthMiddleware

    AuthMiddleware --> Router
    Router --> PricingEngine
    Router --> ApprovalEngine
    Router --> FulfillmentEngine

    PricingEngine --> Postgres
    ApprovalEngine --> Postgres
    FulfillmentEngine --> Postgres
    AuthMiddleware --> AuthService
    Postgres --> RLS
    Router --> Storage
```

---

## 👥 Live Testing Personas & Credentials

The system comes pre-seeded with sample enterprise data for **Acme Enterprise Solutions** (`a0000000-0000-0000-0000-000000000001`) and a platform superadmin:

| Role | Name | Email | Password | Scope & Access |
|---|---|---|---|---|
| **Platform Superadmin** | DealFlow Admin | `admin@dealflow360.com` | `admin123` | Global cross-tenant management, all businesses, platform audit |
| **Business Admin** | Sarah Johnson | `admin@acme.com` | `admin123` | Acme organization settings, users, roles, teams, catalog, pricing |
| **Sales Manager** | Michael Chang | `manager@acme.com` | `admin123` | Approval inbox, team deals, pipeline analytics, team performance |
| **Sales Representative** | Emma Davis | `rep@acme.com` | `admin123` | Deal pipeline, quotation builder, customer list, discount simulator |
| **Operations Specialist** | David Miller | `ops@acme.com` | `admin123` | Warehouses, stock movements, fulfillment queue, shipments |
| **Finance Officer** | Rachel Green | `finance@acme.com` | `admin123` | Invoices, payment records, billing cycles, subscription plans |
| **Customer Portal** | Alex Vance | `customer@acmeglobal.com` | `admin123` | Client portal, quotation review, counter-offers, invoice payments |

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 with `@vitejs/plugin-react`
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), `clsx`, `tailwind-merge`
- **UI Components**: Radix UI Primitives (Dialog, Dropdown Menu, Tabs, Select, Tooltip, Avatar, Slot)
- **Icons**: Lucide React (`lucide-react`)
- **State & Data Fetching**: TanStack React Query (`@tanstack/react-query`), Axios
- **Routing**: React Router v7 (`react-router-dom`)
- **Forms & Validation**: React Hook Form (`react-hook-form`), Zod (`zod`)
- **Charts & Visualizations**: Recharts (`recharts`)
- **Notifications**: Sonner (`sonner`)
- **Animations**: Framer Motion (`framer-motion`)

### Backend
- **Runtime**: Node.js (v20+ recommended)
- **Framework**: Express v5 (`express`)
- **Language**: TypeScript 5.8 (executed with `tsx watch` in dev, `tsc` for production)
- **Database & Auth Client**: Supabase JS (`@supabase/supabase-js`)
- **Security & Utilities**: Helmet (`helmet`), CORS (`cors`), Cookie-Parser (`cookie-parser`), JSONWebToken (`jsonwebtoken`), BCrypt (`bcrypt`)
- **Data Validation**: Zod (`zod`)

### Database & Cloud
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (Email/Password, JWT with custom claims for `business_id` and `role`)
- **Authorization**: Row-Level Security (RLS) policies scoped per tenant

---

## 📂 Project Directory Structure

```text
dealflow360-msr/
├── backend/                             # Express REST API Server
│   ├── src/
│   │   ├── config/                      # Environment and Supabase client config
│   │   ├── lib/                         # Error handlers and response formatting
│   │   ├── middleware/                  # Auth, role check, error middleware
│   │   ├── routes/                      # 49 REST routes divided by business domain
│   │   │   ├── analytics.ts             # Revenue and pipeline analytics
│   │   │   ├── auth.ts                  # Auth (signup, login, refresh, logout)
│   │   │   ├── billing.ts               # Invoices, subscriptions, payments
│   │   │   ├── customer.ts              # Customers, contacts, tiers
│   │   │   ├── deal.ts                  # Deals, quotations, approvals
│   │   │   ├── discount.ts              # Rules, thresholds, discount simulator
│   │   │   ├── fulfillment.ts           # Warehouses, shipments, stock movements
│   │   │   ├── intelligence.ts          # Deal health, risks, insights
│   │   │   ├── org.ts                   # Organization, users, teams, roles
│   │   │   ├── platform.ts              # Superadmin business management
│   │   │   ├── portal.ts                # Customer self-service portal
│   │   │   ├── product.ts               # Catalog, price lists, volume pricing
│   │   │   └── shared.ts                # Notifications, search, help, me
│   │   ├── app.ts                       # Express app builder and route registry
│   │   └── server.ts                    # HTTP server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                            # React 19 + Vite Single Page Application
│   ├── src/
│   │   ├── components/                  # Shared UI components, layout, topbars
│   │   │   ├── layout/                  # Main layout, sidebar, navigation
│   │   │   ├── shared/                  # Common UI components, buttons, inputs
│   │   │   └── ui/                      # Radix UI wrapper primitives & top menu
│   │   ├── features/                    # Modular feature-driven architecture
│   │   │   ├── business-admin/          # Org settings, users, catalog, pricing
│   │   │   ├── finance/                 # Invoices, payments, subscriptions
│   │   │   ├── intelligence/            # Deal health, stalled deals, insights
│   │   │   ├── operations/              # Fulfillment queue, warehouses, inventory
│   │   │   ├── platform/                # Superadmin business directory & audit
│   │   │   ├── quotations/              # Quote builder, approval actions, negotiations
│   │   │   └── sales-manager/           # Approval inbox, team pipeline
│   │   ├── pages/                       # Route pages (Deals, Quotes, Portal, Landing)
│   │   │   ├── auth/                    # Login, Reset Password, 403, 404, Error
│   │   │   └── customer-portal/         # Client self-service portal
│   │   ├── services/                    # API clients and real data services
│   │   ├── types/                       # TypeScript models and domain types
│   │   ├── App.tsx                      # Root component with routing table
│   │   ├── index.css                    # Tailwind CSS v4 styling rules
│   │   └── main.tsx                     # Vite React entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── tests/                               # Test logs and automated verification scripts
├── apicontract.md                       # Canonical API contract (v1.0)
├── README.md                            # Project documentation
└── .gitignore
```

---

## ⚡ Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher (or `pnpm` / `yarn`)
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/lab4-MSR/dealflow360-msr.git
cd dealflow360-msr
```

---

### Step 2: Backend Configuration & Start
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Create or verify your `.env` file in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5174
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   JWT_SECRET=<your-jwt-secret>
   ```

3. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *The backend will boot up on `http://localhost:5000`. Test health at `http://localhost:5000/health`.*

---

### Step 3: Frontend Configuration & Start
1. In a new terminal window, navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Verify or create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend dev server will launch (typically at `http://localhost:5173` or `http://localhost:5174`).*

4. Open your browser and log in with any of the [Live Testing Personas](#-live-testing-personas--credentials) using password `admin123`.

---

## 🔌 API Reference & Endpoints

All backend endpoints are prefixed with `/api/v1` and follow a unified JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 100 },
  "error": null
}
```

### Endpoint Summary (49 Core Routes)

| Category | Endpoint Base | Key Actions |
|---|---|---|
| **Auth** | `/api/v1/auth` | `POST /login`, `POST /signup`, `POST /refresh`, `POST /logout`, `GET /session` |
| **Profile** | `/api/v1/me` | `GET /`, `PATCH /`, `PUT /password`, `GET /preferences` |
| **Organization** | `/api/v1/org` | `GET /`, `PATCH /`, `GET /branding`, `PUT /branding` |
| **Users** | `/api/v1/users` | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |
| **Teams & Roles** | `/api/v1/teams`, `/api/v1/roles` | Team hierarchies, role definitions, and permission matrices |
| **Customers** | `/api/v1/customers` | Account records, contact directories, customer tiers, purchase history |
| **Products & Catalog** | `/api/v1/products`, `/api/v1/categories` | Product CRUD, SKU management, category nesting |
| **Pricing Engine** | `/api/v1/pricing`, `/api/v1/price-lists`, `/api/v1/volume-pricing` | Dynamic price calculation, tiered break rules, customer pricing |
| **Discount Governance** | `/api/v1/discount-rules`, `/api/v1/discount-simulator` | Margin rules, discount caps, real-time discount simulator |
| **Approvals** | `/api/v1/approval-rules`, `/api/v1/approval-chains`, `/api/v1/approvals` | Multi-step approval chains, threshold routing, approve/reject actions |
| **Deals Pipeline** | `/api/v1/deals` | Opportunity tracking, pipeline stage transitions, win/loss probabilities |
| **Quotations** | `/api/v1/quotations` | Multi-item quote builder, revisions, negotiation counter-offers, PDF generation |
| **Fulfillment** | `/api/v1/fulfillment`, `/api/v1/warehouses`, `/api/v1/shipments` | Stock allocation, split shipments, carrier rules, backorders |
| **Billing & Invoices** | `/api/v1/invoices`, `/api/v1/subscriptions`, `/api/v1/payments` | Invoicing lifecycle, recurring subscription cycles, payments |
| **Intelligence** | `/api/v1/intelligence`, `/api/v1/deal-health`, `/api/v1/insights` | Blended deal health score, risk flags, closing velocity |
| **Customer Portal** | `/api/v1/portal` | Client self-service quote review, negotiation, and invoice tracking |
| **Superadmin Platform** | `/api/v1/platform` | Multi-tenant tenant directory, global audit trail, cross-business metrics |

---

## 🔒 Data Model & Multi-Tenancy

DealFlow360 implements strict multi-tenancy at the data layer:
1. **Tenant ID Isolation**: Every tenant-scoped entity (`deals`, `quotations`, `products`, `customers`, `warehouses`, `invoices`) contains a mandatory foreign key reference to `business_id`.
2. **Row-Level Security (RLS)**: PostgreSQL RLS policies evaluate `auth.jwt() ->> 'business_id'` on every read and write query to prevent cross-tenant data leakage.
3. **Internal RBAC Safeguards**: Internal endpoints enforce role restrictions (`business_admin`, `sales_manager`, `sales_rep`, `operations`, `finance`), ensuring users only access authorized domain capabilities.

---

## 🧪 Build & Quality Assurance

### Compile & Build Checks
Both frontend and backend compile with **0 TypeScript and build errors**:

```bash
# Verify Backend TypeScript compilation
cd backend
npm run build

# Verify Frontend Vite production bundle
cd ../frontend
npm run build
```

---

## 🤝 Contributing & License

### Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

### License
This project is licensed under the **ISC License**.
