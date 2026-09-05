# DealFlow360 Design System

> Single Source of Truth for all visual decisions.

---

## 01. Design Philosophy

**DATA > DECORATION**

Every visual element must have a purpose. Prefer whitespace, hierarchy, typography, borders, subtle elevation, semantic colors, consistent spacing, restrained motion.

Avoid: excessive gradients, shadows, glassmorphism, glowing borders, random colored cards, unnecessary illustrations, huge decorative icons, excessive rounded containers, excessive animations.

DealFlow360 is NOT:
- A marketing website
- A gaming dashboard
- A neon interface
- A crypto dashboard
- A decorative analytics dashboard

DealFlow360 IS:
- Professional Enterprise SaaS
- Sales Operations Platform
- Financial Decision System

---

## 02. Enterprise SaaS Design Principles

### Core Principles

| Principle | Definition |
|---|---|
| **Information Density** | Present maximum useful data without visual chaos. Enterprise users operate at speed. |
| **Operational Clarity** | Every screen communicates status, action, and consequence without ambiguity. |
| **Decision-Oriented UI** | Surfaces that influence business decisions must prioritize decision-critical information. |
| **Consistency** | Identical patterns produce identical outcomes. No surprises. |
| **Predictability** | Users can anticipate system behavior from prior interactions. |
| **Progressive Disclosure** | Show essentials first. Reveal complexity on demand. |
| **Trust** | Visual stability communicates reliability. No flickering, no shifting, no unexpected changes. |
| **Transparency** | Users see what affects them. Nothing is hidden without reason. |
| **Auditability** | Every significant action leaves a visible trace. |
| **Configurability** | Surfaces adapt to tenant and role without breaking coherence. |
| **Role-Aware Interfaces** | Different roles see different views of the same data. |
| **Data Hierarchy** | Primary data is prominent. Supporting data is accessible but not competing. |
| **Accessibility** | Usable by everyone. Color is never the sole communicator of meaning. |
| **Performance** | UI responsiveness is a feature, not a bonus. |

### Visual Identity

The final product must feel:
- Enterprise
- Professional
- Reliable
- Trustworthy
- Fast
- Data-driven
- Intelligent
- Consistent

Quality benchmark: Modern enterprise SaaS. Draw principles from Stripe, Salesforce, HubSpot, Linear — but maintain DealFlow360's own identity. Do NOT copy their UI.

---

## 03. Information Density System

### Three Density Modes

#### COMPACT

Used for:
- Data tables
- Inventory views
- Audit logs
- Approval queues
- Operations screens
- High-volume list views

| Property | Value |
|---|---|
| Row height | 40-48px |
| Cell padding | 8-12px |
| Font size | 13px (Small) |
| Line height | 20px |
| Grid gap | 8-12px |
| Card padding | 12-16px |
| Section gap | 16px |

#### COMFORTABLE

Used for:
- Dashboards
- Forms
- Deal details
- Configuration screens
- Standard list views

| Property | Value |
|---|---|
| Row height | 52-60px |
| Cell padding | 12-16px |
| Font size | 14px (Body Small) |
| Line height | 22px |
| Grid gap | 16px |
| Card padding | 20-24px |
| Section gap | 24-32px |

#### SPACIOUS

Used for:
- Customer portal
- Empty states
- Important decision screens
- Onboarding flows
- First-time experiences

| Property | Value |
|---|---|
| Row height | 60-72px |
| Cell padding | 16-24px |
| Font size | 14-16px |
| Line height | 22-24px |
| Grid gap | 20-24px |
| Card padding | 24-32px |
| Section gap | 32-48px |

### Density Rules

- Do not make every screen equally spacious.
- Enterprise users need high information density.
- Default to COMFORTABLE. Use COMPACT for data-heavy views. Use SPACIOUS only where deliberate spacing serves the user.
- Density mode may vary within a single page (e.g., compact table inside a comfortable layout).

---

## 04. Color Architecture

### Architecture
```
PRIMITIVE COLORS → SEMANTIC TOKENS → COMPONENT TOKENS → APPLICATION UI
```

### Color Rules (Strict)

1. Indigo is the primary brand identity.
2. Blue must NOT become a second primary brand color.
3. Green means success/positive state.
4. Amber means warning/pending state.
5. Red means danger/error/rejection/critical state.
6. Blue means informational state.
7. Violet means intelligence.
8. Do not use semantic colors as decorative colors.
9. Do not introduce arbitrary gradients.
10. Do not randomly introduce new accent colors.
11. Neutral colors should dominate the interface.
12. Brand color should be used intentionally.
13. Semantic colors must communicate actual state.
14. Risk colors must communicate actual risk.
15. Never use color merely because it "looks attractive."

### Color Proportion

- 70–80% Neutral foundation
- 12–15% Brand (Indigo)
- ~5% Semantic states
- Small controlled amount Intelligence/accents

---

## 05. Primitive Colors

### Brand

| Token | Value | Usage |
|---|---|---|
| `primary` | `#4F46E5` | Primary brand, active states, CTA |
| `primary-hover` | `#4338CA` | Primary hover |
| `primary-subtle` | `#EEF2FF` | Primary background subtle |

### Light Foundation

| Token | Value |
|---|---|
| `background` | `#F8FAFC` |
| `surface` | `#FFFFFF` |
| `surface-muted` | `#F1F5F9` |
| `text` | `#0F172A` |
| `text-secondary` | `#334155` |
| `text-muted` | `#64748B` |
| `disabled` | `#94A3B8` |
| `border` | `#E2E8F0` |
| `border-strong` | `#CBD5E1` |

### Semantic

| Token | Value | Meaning |
|---|---|---|
| `success` | `#10B981` | Approved, healthy, completed |
| `warning` | `#F59E0B` | Pending, attention, negotiation |
| `danger` | `#EF4444` | Error, rejected, failed, critical |
| `info` | `#3B82F6` | Informational, operational |
| `intelligence` | `#8B5CF6` | AI/ML recommendations, insights |

### Intelligence Color Rules

Violet `#8B5CF6` is reserved ONLY for:
- Smart Recommendations
- Upsell / Cross-sell
- Risk Insights
- Automated Decisions
- Intelligent Suggestions
- AI-like intelligence

Intelligence UI must communicate WHY + EXPECTED IMPACT.

Do not create fake futuristic AI visuals. Avoid: neon glow, excessive gradients, animated AI blobs, unnecessary particles.

Intelligence must feel useful, not decorative.

---

## 06. Semantic Colors

### Light Theme

| Token | Value |
|---|---|
| `background` | `#F8FAFC` |
| `surface` | `#FFFFFF` |
| `surface-muted` | `#F1F5F9` |
| `text` | `#0F172A` |
| `text-secondary` | `#334155` |
| `text-muted` | `#64748B` |
| `disabled` | `#94A3B8` |
| `border` | `#E2E8F0` |
| `border-strong` | `#CBD5E1` |
| `primary` | `#4F46E5` |
| `primary-hover` | `#4338CA` |
| `primary-subtle` | `#EEF2FF` |
| `success` | `#10B981` |
| `warning` | `#F59E0B` |
| `danger` | `#EF4444` |
| `info` | `#3B82F6` |
| `intelligence` | `#8B5CF6` |

### Dark Theme

| Token | Value |
|---|---|
| `background` | `#070A13` |
| `surface` | `#0F172A` |
| `surface-muted` | `#111827` |
| `text` | `#F8FAFC` |
| `text-secondary` | `#CBD5E1` |
| `text-muted` | `#94A3B8` |
| `disabled` | `#64748B` |
| `border` | `#1E293B` |
| `border-strong` | `#334155` |
| `primary` | `#6366F1` |
| `primary-hover` | `#818CF8` |
| `success` | `#34D399` |
| `warning` | `#FBBF24` |
| `danger` | `#F87171` |
| `info` | `#60A5FA` |
| `intelligence` | `#8B5CF6` |

---

## 07. Component Tokens

Component tokens reference semantic tokens and are consumed by UI components.

### Button Tokens

| Token | Value | Usage |
|---|---|---|
| `button-primary-bg` | `primary` | Primary button background |
| `button-primary-hover` | `primary-hover` | Primary button hover |
| `button-primary-text` | `primary-foreground` | Primary button text |
| `button-secondary-bg` | `secondary` | Secondary button background |
| `button-secondary-border` | `border` | Secondary button border |
| `button-ghost-hover` | `accent` | Ghost button hover |
| `button-danger-bg` | `danger` | Destructive button background |
| `button-intelligence-bg` | `intelligence` | Intelligence button background |

### Input Tokens

| Token | Value | Usage |
|---|---|---|
| `input-border` | `border` | Default border |
| `input-border-focus` | `primary` | Focus border |
| `input-border-error` | `danger` | Error border |
| `input-border-success` | `success` | Success border |
| `input-bg` | `surface` | Background |

### Card Tokens

| Token | Value | Usage |
|---|---|---|
| `card-bg` | `surface` | Card background |
| `card-border` | `border` | Card border |
| `card-shadow` | `elevation-1` | Optional card shadow |

### Table Tokens

| Token | Value | Usage |
|---|---|---|
| `table-header-bg` | `surface-muted` | Header background |
| `table-row-hover` | `surface-muted/50` | Row hover |
| `table-row-selected` | `primary-subtle` | Selected row |
| `table-border` | `border` | Cell borders |

### Modal Tokens

| Token | Value | Usage |
|---|---|---|
| `modal-overlay` | `rgba(15,23,42,.45)` | Overlay |
| `modal-bg` | `surface` | Modal background |
| `modal-radius` | `16px` | Border radius |

### Badge Tokens

| Token | Value | Usage |
|---|---|---|
| `badge-success-bg` | `success-subtle` | Success badge |
| `badge-warning-bg` | `warning-subtle` | Warning badge |
| `badge-danger-bg` | `danger-subtle` | Danger badge |
| `badge-info-bg` | `info-subtle` | Info badge |
| `badge-intelligence-bg` | `intelligence-subtle` | Intelligence badge |

---

## 08. Light Theme

Foundation:
- Background → `#F8FAFC`
- Surface → `#FFFFFF`
- Text → `#0F172A`
- Secondary → `#334155`
- Muted → `#64748B`
- Border → `#E2E8F0`

Brand:
- Primary → `#4F46E5`
- Primary Hover → `#4338CA`
- Primary Subtle → `#EEF2FF`

Semantic:
- Success → `#10B981`
- Warning → `#F59E0B`
- Danger → `#EF4444`
- Info → `#3B82F6`
- Intelligence → `#8B5CF6`

---

## 09. Dark Theme

Not simple inversion. Maintains:
- Surface hierarchy
- Border visibility
- Text hierarchy
- Semantic meaning
- Focus visibility

Foundation:
- Background → `#070A13`
- Surface → `#0F172A`
- Surface Muted → `#111827`
- Text → `#F8FAFC`
- Secondary → `#CBD5E1`
- Muted → `#94A3B8`
- Border → `#1E293B`
- Strong Border → `#334155`

Brand:
- Primary → `#6366F1`
- Primary Hover → `#818CF8`
- Primary Subtle → `#1E1B4B`

Verify dark mode works correctly in: tables, forms, modals, drawers, charts, badges, alerts, sidebar, topbar, quotation builder.

---

## 10. Multi-Tenant Branding

### Tenant Configurable

- Company Name
- Logo
- Favicon
- Primary Brand Color
- Primary Hover
- Primary Subtle
- Optional Secondary Brand Color
- Theme Preference

### Tenant MUST NOT Modify

- Success
- Warning
- Danger
- Info
- Critical risk colors
- Validation semantics

### Tenant Branding Tokens

```css
--tenant-primary: #4F46E5;
--tenant-primary-hover: #4338CA;
--tenant-primary-subtle: #EEF2FF;
```

Semantic colors remain global. Business A and Business B can have different branding, but success must still mean success, warning must still mean warning, danger must still mean danger.

---

## 11. Typography

**Primary font:** Inter (400, 500, 600, 700)
**Fallback:** system-ui, sans-serif

| Name | Size | Line Height |
|---|---|---|
| Display | 48px | 56px |
| H1 | 32px | 40px |
| H2 | 24px | 32px |
| H3 | 20px | 28px |
| H4 | 18px | 26px |
| Body | 16px | 24px |
| Body Small | 14px | 22px |
| Small | 13px | 20px |
| Caption | 12px | 16px |
| Label | 13px | 18px |

Do not overuse bold text. Use typography to establish hierarchy rather than excessive color.

---

## 12. Financial Typography

Numbers are critical in a sales/finance application.

Use `tabular-nums` and `lining-nums` for:
- Revenue
- Price
- Discount
- Margin
- Quantity
- Risk Score
- Invoice Amount
- Subscription Amount
- Order Total
- MRR / ARR
- Tax
- Subtotal
- Total

KPI numbers should be visually prominent without becoming oversized.

Financial values must remain readable at all sizes. Do not sacrifice readability for visual impact.

---

## 13. Spacing System

4/8-based. Allowed: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

| Context | Value |
|---|---|
| Page padding | 24px |
| Card padding | 20-24px |
| Grid gap | 16px |
| Section gap | 32px |
| Major section gap | 48px |

Avoid random spacing values. Do not use excessive empty space. Enterprise users need high information density without visual chaos.

---

## 14. Border Radius

| Element | Radius |
|---|---|
| Small controls | 6-8px |
| Buttons | 8px |
| Inputs | 8px |
| Cards | 12px |
| Tables | 12px |
| Modal | 16px |
| Drawer | 16px |
| Badges | Full/pill (9999px) |

Do not make every element extremely rounded. Avoid excessive "modern startup" pill styling.

---

## 15. Elevation

Borders first. Shadows secondary.

| Level | Value | Usage |
|---|---|---|
| 1 | `0 1px 2px rgba(15,23,42,.04)` | Cards (optional) |
| 2 | `0 4px 12px rgba(15,23,42,.06)` | Dropdown, Popover |
| 3 | `0 8px 24px rgba(15,23,42,.08)` | — |
| 4 | `0 16px 40px rgba(15,23,42,.12)` | Modal, Drawer |

Avoid heavy floating cards, dramatic shadows, glowing UI, neon effects. The product should feel stable, trustworthy, enterprise, professional.

---

## 16. Layout

### Application Shell

```
SIDEBAR (240-256px, collapsed 72px)
+ TOPBAR (64px)
+ MAIN CONTENT (max-width ~1600px, padding 24px)
```

### Breakpoints

| Name | Width | Behavior |
|---|---|---|
| Mobile S | 320px | Single column, stacked forms |
| Mobile M | 375px | Single column, stacked forms |
| Mobile L | 430px | Single column, stacked forms |
| Tablet | 768px | Collapsible sidebar, reduced columns |
| Laptop | 1024px | Sidebar + reduced layout |
| Desktop | 1280px | Full layout |
| Desktop L | 1440px | Full layout, max-width content |
| Desktop XL | 1920px | Full layout, max-width content |

---

## 17. Page Templates

### 1. Dashboard

Page Header → KPI Row → Primary Content (charts/tables) → Secondary Content

### 2. List

Page Header → Filters/Search → Data Table → Pagination → Bulk Actions

### 3. Detail

Page Header → Summary Card → Tabs/Sections → Related Data → Actions

### 4. Create/Edit

Page Header → Form Sections → Validation → Actions (Save/Cancel)

### 5. Workspace

Page Header → Main Workspace + Right Summary Panel → Actions

### 6. Decision Center

Page Header → Decision-Critical Information → Risk/Impact → Actions (Approve/Reject/Return)

### 7. Configuration

Page Header → Settings Sections → Save/Reset

### 8. Analytics

Page Header → Filters → Charts/Visualizations → Data Tables → Export

### 9. Timeline

Page Header → Timeline Events → Filters → Detail Expansion

### 10. Customer Portal

Page Header → Simplified Content → Primary Actions → Terms/Details

### 11. Settings

Page Header → Setting Groups → Form Controls → Save

### 12. Fullscreen Workspace

Full-bleed content area → Minimal chrome → Context preservation

Every page should use one of these templates whenever possible. Avoid creating a completely unique layout for every route.

---

## 18. Responsive Architecture

Responsive design must NOT simply shrink desktop layouts.

### Information Priority by Viewport

| Viewport | Information Level |
|---|---|
| Desktop (1280px+) | Full information, multi-column |
| Tablet (768-1024px) | Reduced secondary information, collapsible sidebar |
| Mobile (< 768px) | Primary information only, single column |

### Example: Deal Detail

**Desktop:**
Customer, Discount, Margin, Risk, Approval, Total, Actions, Notes, Timeline

**Mobile:**
Customer, Total, Risk, Approval, Primary Action

Everything else moves into expandable sections or drawers.

### Mobile Rules

- Single column layouts
- Stacked forms
- Horizontal-scroll tables
- Full-screen dialogs
- Responsive drawers
- No horizontal page overflow
- Touch targets minimum 44x44px

---

## 19. Information Priority

### Decision-Critical Information

Any action that can materially affect the business must clearly communicate:

| Element | Purpose |
|---|---|
| **WHAT** | What is the action or change |
| **WHY** | Why it is needed or triggered |
| **IMPACT** | What the impact is (financial, risk, operational) |
| **WHO** | Who is affected or who needs to act |
| **WHEN** | When it happened or when action is needed |
| **NEXT ACTION** | What the user should do next |

### Applied To

- Approval / Rejection
- Discount override
- Warehouse override
- Backorder
- Cancellation
- Refund
- Negotiation
- Subscription changes

### Example

```
HIGH RISK

Discount:        18%
Allowed:         10%
Margin Impact:   -6.4%
Risk:            72 / 100
Approval:        Finance Required
```

The visual hierarchy must prioritize decision-critical information. Do not hide important business decisions inside tiny UI elements.

---

## 20. Navigation

### Sidebar

Structure:
```
DEALFLOW360 LOGO
Workspace Switcher
---
SALES: Dashboard, Quotations, Customers
---
OPERATIONS: Fulfillment, Warehouses
---
FINANCE: Billing
---
ANALYTICS: Reports, Deal Health
---
ADMIN: Users, Rules, Settings
```

Width: 240–256px. Collapsed: 72px.

Active: Indigo subtle bg, Indigo icon, Strong text.
Hover: Subtle neutral/brand treatment.

Do NOT use bright solid indigo blocks for every active item.

### Topbar

- Breadcrumb
- Global Search (Ctrl+K / Cmd+K)
- Help
- Notifications
- Theme Toggle
- User Profile

Keep the topbar clean. Do not overload it with unnecessary controls.

### Breadcrumb

Example:
```
Sales → Quotations → QT-1042 → Negotiation
```

Navigation must clearly communicate hierarchy.

### Sub-Navigation

Tabs for within-page navigation. Use for switching between related views within the same context.

---

## 21. Application Shell

```
SIDEBAR (240-256px, collapsed 72px)
+ TOPBAR (64px)
+ MAIN CONTENT (max-width ~1600px, padding 24px)
```

Main content area uses 24px page padding. Content max-width approximately 1600px.

---

## 22. Sidebar

### Structure

- Logo / Brand
- Workspace Switcher
- Navigation sections with grouped items
- Collapse toggle

### States

| State | Treatment |
|---|---|
| Default | Text color `text-secondary`, icon muted |
| Hover | Subtle accent background |
| Active | `primary-subtle` background, `primary` icon, strong text |
| Disabled | Muted text, no interaction |

### Responsive

- Desktop: Full sidebar (240-256px)
- Tablet: Collapsible to icon-only (72px)
- Mobile: Hidden by default, overlay drawer

---

## 23. Topbar

Height: 64px.

Components:
- Breadcrumb
- Global Search trigger
- Help
- Notifications (with indicator)
- Theme Toggle (light/dark)
- User Profile with avatar

Global search: Ctrl+K or Cmd+K.

Keep the topbar clean. Do not overload with unnecessary controls.

---

## 24. Buttons

### Hierarchy

| Variant | Usage |
|---|---|
| **Primary** | Main action on screen |
| **Secondary** | Supporting action |
| **Ghost** | Low-emphasis action |
| **Outline** | Neutral action with border |
| **Destructive** | Dangerous/irreversible action |
| **Intelligence** | AI/recommendation action |

### States

| State | Treatment |
|---|---|
| Default | Base styling |
| Hover | Darkened/enhanced |
| Focus | Visible focus ring |
| Active | Pressed state |
| Disabled | Muted, non-interactive |
| Loading | Spinner replaces content |

### Rules

- Never place multiple competing primary buttons together.
- Destructive actions require confirmation.
- Loading state disables interaction.
- Minimum touch target: 44x44px on mobile.

---

## 25. Forms

### Input Height

40-44px.

### Radius

8px.

### States

| State | Treatment |
|---|---|
| Default | Border `border` |
| Focus | Border `primary`, ring `primary` |
| Filled | Standard border |
| Disabled | Muted background, disabled cursor |
| Loading | Spinner indicator |
| Error | Border `danger`, error message below |
| Success | Border `success` |
| Readonly | Standard appearance, no editing |
| Locked | Visual indicator of locked state |

### Rules

- Labels clear and always visible
- Helper text subtle (muted)
- Errors actionable (explain what is wrong and how to fix)
- Required fields indicated clearly
- Do not use bright colors for normal form controls

---

## 26. Cards

### Shared Properties

All card variants share: radius 12px, consistent padding, typography scale, border, elevation level 1.

### Variants

| Variant | Purpose |
|---|---|
| Default | Standard content container |
| KPI | Key performance indicator display |
| Metric | Single metric with trend |
| Status | Status summary |
| Activity | Recent activity feed |
| Recommendation | Intelligence/recommendation |
| Warning | Warning with context |
| Risk | Risk indicator |
| Featured | Highlighted/important content |
| Interactive | Clickable card |

Do NOT make every card colorful. Accent color should communicate meaning.

---

## 27. Tables

### Core UI Element

Tables are a CORE DealFlow360 UI element.

### Structure

- Header (neutral background)
- Row (52-60px height)
- Hover (subtle slate)
- Selected (primary subtle)
- Loading state
- Empty state
- Error state

### Support

- Search
- Filter
- Sort
- Pagination
- Bulk actions
- Column visibility
- Row actions

### Density Modes

| Mode | Row Height | Use Case |
|---|---|---|
| Compact | 40-48px | Audit logs, inventory, high-volume data |
| Comfortable | 52-60px | Standard data tables |

### Rules

- Numbers must use tabular numerals
- Avoid excessive cell borders
- Use border-first elevation
- Support responsive horizontal scroll on mobile

---

## 28. Modals

### Sizes

| Size | Width | Usage |
|---|---|---|
| Small | 400px | Simple confirmations |
| Medium | 560px | Forms, details |
| Large | 720px | Complex content |
| Fullscreen | 100vw/100vh | Workspace, editor |

### Properties

- Radius: 16px
- Padding: 24px
- Overlay: `rgba(15,23,42,.45)`

### Hierarchy

Header → Content → Actions

Do not make every action a modal. Use confirmation dialogs for sensitive actions.

---

## 29. Drawers

Width: 420–560px.

Use drawers for:
- Deal details
- Product details
- Customer details
- Approval details
- Audit details
- Warehouse allocation details

Drawer should preserve the user's context.

---

## 30. Toast / Notification System

Use Sonner.

### Types

| Type | Usage |
|---|---|
| Success | Action completed successfully |
| Warning | Attention needed |
| Error | Action failed |
| Info | Informational message |

### Rules

- Short and concise
- Actionable when appropriate
- Non-blocking
- Do not spam the user with unnecessary notifications

---

## 31. Status System

| Status | Color | Usage |
|---|---|---|
| Draft | Slate | Initial state |
| Pending | Amber | Awaiting action |
| Approved | Emerald | Approved / positive |
| Rejected | Red | Rejected / negative |
| Negotiation | Amber | In negotiation |
| Confirmed | Indigo/Blue | Confirmed |
| Fulfillment | Blue | In fulfillment |
| Backorder | Amber/Orange | Backorder |
| Completed | Emerald | Completed |
| Failed | Red | Failed |

Never change the semantic meaning of these colors.

---

## 32. Risk System

### Levels

| Range | Level | Color |
|---|---|---|
| 0-30 | LOW | Green (`success`) |
| 31-60 | MEDIUM | Amber (`warning`) |
| 61-80 | HIGH | Orange/Red |
| 81-100 | CRITICAL | Red (`danger`) |

### Visualization Support

1. Badge — Compact inline indicator
2. Score — Numeric value (0-100)
3. Progress indicator — Visual bar
4. Explanation — What the risk means
5. Contributing factors — Breakdown of risk sources

### Example

```
HIGH RISK
72 / 100

Contributing Factors:
  Discount Violation     +24
  Margin Compression     +18
  Customer Risk          +12
  Order Discount         +8

Blended Risk: 72
```

### Rules

- Risk must be visually obvious but not visually overwhelming.
- Do not show risk color without explaining what the risk represents.
- Do not communicate risk through color alone.
- Always include text, badge, or icon alongside color.

---

## 33. Intelligence System

Violet `#8B5CF6` reserved for:

- Smart Recommendations
- Upsell / Cross-sell
- Risk Insights
- Automated Decisions
- Intelligent Suggestions
- AI-like intelligence

### Intelligence UI Must Communicate

WHY + EXPECTED IMPACT

### Example

```
Recommended Product: Premium Support
Purchase Affinity:   +32%
Expected Revenue:    +₹42,000
Expected Margin:     +₹11,500
Reason:              Frequently purchased with Laptop Pro.
```

### Rules

- Intelligence must feel useful, not decorative
- Do not create fake futuristic AI visuals
- Avoid: neon glow, excessive gradients, animated blobs, unnecessary particles
- Intelligence color must never be used for non-intelligence features

---

## 34. Financial UI

### Data Display Rules

- Financial numbers use tabular numerals
- Align financial values consistently (right-aligned in tables)
- Use consistent decimal precision
- Positive financial impact → Success
- Negative financial impact → Danger
- Warning financial impact → Warning
- Do not use color without a textual/contextual label
- Large financial values must remain readable without excessive font size

### Formatting Reference

| Data Type | Format | Example |
|---|---|---|
| Currency | Locale-aware with symbol | ₹12,40,000 / $12,400.00 |
| Percentage | 1 decimal + % | 12.5% |
| Quantity | Integer with commas | 1,240 units |
| Revenue | Currency format | ₹45,000 |
| MRR / ARR | Currency format | ₹45,000 / ₹5,40,000 |
| Margin | Percentage format | 24.6% |
| Discount | Percentage format | 12% |
| Tax | Currency format | ₹2,232 |
| Invoice | Currency format | ₹14,632 |

---

## 35. Decision-Critical UI

Any action that can materially affect the business must clearly communicate:

| Element | Purpose |
|---|---|
| **WHAT** | The action or change being made |
| **WHY** | Why it is needed or triggered |
| **IMPACT** | Financial, risk, operational impact |
| **WHO** | Who is affected or who needs to act |
| **WHEN** | Timing of the action |
| **NEXT ACTION** | What the user should do next |

### Applied To

- Approval / Rejection
- Discount override
- Warehouse override
- Backorder
- Cancellation
- Refund
- Negotiation
- Subscription changes

The visual hierarchy must prioritize decision-critical information. Do not hide important business decisions inside tiny UI elements.

---

## 36. Workflow Visualization

### Deal Lifecycle

```
DRAFT
↓
PENDING APPROVAL
↓
APPROVED
↓
CUSTOMER REVIEW
↓
NEGOTIATION
↓
RE-APPROVAL
↓
CONFIRMED
↓
FULFILLMENT
↓
BILLING
↓
COMPLETED
```

### States

| State | Treatment |
|---|---|
| Current | Active highlight |
| Completed | Filled/success indicator |
| Pending | Muted/outline |
| Blocked | Danger indicator |
| Failed | Danger |
| Returned | Warning |
| Cancelled | Muted/disabled |

### Components

- Stepper — Linear workflow progression
- Timeline — Historical activity view
- Status indicator — Current state badge
- Progress indicator — Completion percentage

All workflow components must follow the same visual language.

---

## 37. Approval System

### Information Displayed

- Deal reference
- Customer name
- Sales Rep
- Total value
- Discount applied
- Margin
- Risk level
- Approval level required
- Reason for approval request
- Timeline

### Actions

| Action | Treatment |
|---|---|
| Approve | Primary button |
| Reject | Destructive button (requires reason) |
| Return | Secondary button (requires reason) |

### Visual States

| State | Treatment |
|---|---|
| Pending | Warning accent |
| Approved | Success accent |
| Rejected | Danger accent |
| Returned | Warning accent |

Do not make Approve and Reject visually equal in a confusing way. Approve should be primary. Reject should be destructive but not competing.

High-impact actions require clear confirmation.

---

## 38. Audit & Activity System

### Audit Event Structure

Each event contains:
- Actor
- Action
- Resource
- Before value
- After value
- Reason
- Timestamp

### Example

```
Rahul changed discount
12% → 18%
Reason: Customer negotiation
05 Sep 2026, 13:42
```

### Display Formats

| Format | Usage |
|---|---|
| Timeline | Visual chronological view |
| Table | Dense data view |
| Detail view | Expanded single event |

Audit information must remain readable at high data volume. Use compact density for audit logs.

---

## 39. Notification System

### Types

| Type | Purpose |
|---|---|
| Toast | Immediate feedback for user actions |
| Notification Inbox | Persistent notification center |
| Activity | Activity feed |
| System Alert | System-level alerts |
| Business Alert | Business logic alerts |
| Critical Alert | Urgent critical notifications |

### Rules

- Short and concise
- Actionable when appropriate
- Contextual to the current view
- Do not spam the user with unnecessary notifications

### Example

```
Approval Required
Quote QT-1042 requires Finance approval.
[Review]
```

---

## 40. Quotation Builder

### Design Hierarchy

```
Customer
↓
Quote Information
↓
Line Items
↓
Pricing
↓
Discount
↓
Margin
↓
Recommendations
↓
Risk
↓
Actions
```

### Visual Emphasis

Must visually emphasize:
- Subtotal
- Discount
- Tax
- Total
- Margin
- Risk

Use a sticky summary/action area where appropriate.

### Discount Violation Display

```
Allowed:       10%
Applied:       18%
Difference:    +8 percentage points
Risk:          High
Approval:      Finance Required
```

Discount violations should be visible immediately. Do not hide important business decisions inside tiny UI elements.

---

## 41. Customer Portal

### Design Language

Internal application: Dense, Operational, Data-rich
Customer portal: Simple, Clear, Trustworthy, Low cognitive load, Action-oriented

### Customer Can See

- Quotation
- Products
- Quantity
- Price
- Discount
- Terms
- Delivery
- Actions

### Customer Can Do

- Accept
- Reject
- Request Change
- Counter Discount

### Customer MUST NOT See

- Internal Cost
- Internal Margin
- Risk Score
- Internal Approval Comments
- Internal Notes
- Internal Rules

Do not leak internal business intelligence through frontend responses or UI.

---

## 42. Warehouse / Fulfillment UI

### Data Display

- Warehouse name
- Available Stock
- Allocated Quantity
- Remaining Quantity
- Shipment Count
- Shipping Cost
- Allocation Reason

### States

| State | Color | Meaning |
|---|---|---|
| Available | Green (success) | Stock available |
| Partial | Amber (warning) | Partial allocation possible |
| Backorder | Amber/Orange | Needs restocking |
| Unavailable | Red (danger) | No stock |

### Rules

- Manual override must be visually distinguishable from automatic allocation
- Show allocation reason for every allocation
- Warehouse allocation details accessible via drawer

---

## 43. Billing UI

### Visual Hierarchy

- One-Time charges
- Recurring charges
- Proration
- Invoice
- Payment
- Billing Schedule

### States

| State | Color |
|---|---|
| Paid | Emerald (success) |
| Pending | Amber (warning) |
| Failed | Red (danger) |
| Recurring | Blue (info) |

### Rules

- Do not visually mix one-time and recurring billing without clear labels
- Clearly distinguish subscription types
- Show billing schedule for recurring charges

---

## 44. Deal Health System

### Health Levels

| Level | Treatment |
|---|---|
| Healthy | Success accent |
| Needs Attention | Warning accent |
| At Risk | Orange/danger accent |
| Critical | Danger accent |

### Important Signals

- Stalled deals
- Discount anomalies
- Margin degradation
- Delivery slippage
- Negotiation delays
- Approval delays

### Alert Structure

Every alert should answer:
1. **WHAT** happened?
2. **WHY** does it matter?
3. **WHAT** should the user do?

Avoid generic red warning boxes without context.

---

## 45. Analytics & Charts

### Supported Patterns

| Pattern | Usage |
|---|---|
| KPI | Single metric with trend |
| Line | Trend over time |
| Area | Volume over time |
| Bar | Comparison |
| Stacked Bar | Composition comparison |
| Donut | Proportion |
| Funnel | Conversion flow |
| Comparison | Side-by-side |
| Trend | Direction over time |
| Heatmap | Density/intensity |

### Color Rules

| Data Type | Color |
|---|---|
| Primary | Indigo |
| Positive | Emerald |
| Warning | Amber |
| Danger | Red |
| Info | Blue |
| Intelligence | Violet |

No rainbow charts. Do not assign random colors to every data series. Charts must work in both light and dark mode.

---

## 46. Permission-Aware UI

### Visual States

| State | Treatment |
|---|---|
| Visible | Full access, editable |
| Read Only | Visible but not editable |
| Disabled | Visible, grayed out, non-interactive |
| Hidden | Not rendered in DOM |
| Restricted | Shows access-denied message |
| Locked | Visual lock indicator |
| Pending Authorization | Shows pending state |

### Examples

| Role | Discount Rules | Treatment |
|---|---|---|
| Sales Rep | Read Only | Can view, cannot edit |
| Admin | Editable | Full access |
| Customer | Not Visible | Completely hidden |

### Security Rule

This section defines UI behavior only. Actual authorization MUST remain server-side. Never rely on frontend hiding for security.

---

## 47. Multi-Tenant UI

### Tenant Context

- Tenant Switcher (Super Admin: "All Businesses", Business Admin: "Acme Corporation")
- Company Logo
- Company Name
- Tenant Branding
- Tenant Theme
- Tenant Indicator

### Rules

- Business users must always understand which organization they are operating inside
- Tenant branding may customize: Logo, Favicon, Primary, Primary Hover, Primary Subtle, Optional Secondary Brand
- Tenant customization MUST NOT modify semantic colors, risk colors, or validation semantics

---

## 48. Accessibility

### Requirements

- WCAG-conscious contrast
- Keyboard navigation
- Visible focus states
- Semantic HTML
- Accessible labels
- ARIA where required
- Accessible forms
- Accessible dialogs
- Accessible tables
- Reduced motion support
- Touch target sizing (minimum 44x44px)

### Critical Rule

COLOR MUST NEVER BE THE ONLY WAY TO COMMUNICATE MEANING.

Do not show only a red dot. Use:
```
HIGH RISK
72 / 100
```
+ appropriate visual indicator.

---

## 49. Motion

### Timing

| Type | Duration |
|---|---|
| Fast | 120-180ms |
| Normal | 200-250ms |
| Modal/Drawer | 250-350ms |
| Page transitions | 300-400ms |

### Use Cases

- Hover effects
- State changes
- Modal/Drawer open/close
- List appearance
- Expand/collapse
- Toast appearance
- Page transitions

### Restrictions

- Excessive bounce
- Constant animation
- Parallax
- Large zoom
- Decorative motion
- Slow transitions

Respect `prefers-reduced-motion`.

---

## 50. Performance-Aware UI

### Requirements for Large Enterprise Datasets

- Pagination (server-side)
- Server-side filtering
- Debounced search (300ms default)
- Lazy loading
- Progressive rendering
- Skeleton states for all loading
- Virtualization where appropriate (1000+ rows)
- Optimistic UI only where safe and reversible
- Stale-data indicators

### High-Volume Screens

- Customers
- Products
- Deals
- Audit logs
- Inventory
- Transactions

Every data-heavy component must support: Loading, Skeleton, Empty, Error, Success states.

---

## 51. Component State Matrix

Every interactive component must consider where relevant:

| State | Purpose |
|---|---|
| Default | Base state |
| Hover | Mouse hover |
| Focus | Keyboard focus |
| Active | Being pressed/activated |
| Selected | Currently selected |
| Disabled | Non-interactive |
| Loading | Processing |
| Success | Operation succeeded |
| Warning | Attention needed |
| Error | Operation failed |
| Readonly | Visible, not editable |
| Locked | Cannot be changed |
| Restricted | Access denied |
| Unsaved | Changes not saved |
| Dirty | Form has unsaved changes |
| Syncing | Syncing with server |
| Offline | No connection |
| Stale Data | Data may be outdated |

Do not design only the happy path.

---

## 52. Loading / Empty / Error

### Loading

Every data-driven component must support:
- Loading state
- Skeleton state (matching component structure)
- Spinner for buttons/actions
- Page-level loading

Never leave blank white areas while data loads.

### Empty States

Contextual empty messages:

Bad: "No data."

Good: "No quotations yet. Create your first quotation to start the approval workflow."

Include a relevant CTA when appropriate.

### Error States

Human-readable. Never expose:
- Stack traces
- Database errors
- Internal implementation details

Provide:
- What happened
- What the user can do
- Retry/action button

---

## 53. Search / Productivity

### Global Search

- Trigger: Ctrl+K / Cmd+K
- Scope: Cross-entity search
- Results: Grouped by entity type
- Actions: Quick actions from search results

### Command Palette

Keyboard-first interface for power users. Access all actions without mouse.

### Advanced Filters

- Date ranges
- Status filters
- Numeric ranges
- Text search
- Saved filters
- Recent filters

### Rules

Do not overload the interface with productivity features where they are not useful. Apply search/filter patterns where data volume warrants it.

---

## 54. Do / Don't

### Do

- Use semantic colors consistently
- Use tabular numerics for financial data
- Use clear typography hierarchy
- Use border-first elevation
- Use progressive disclosure
- Design for all component states
- Support keyboard navigation
- Use accessible color combinations
- Maintain information density for enterprise users
- Use consistent spacing from the 4/8 scale
- Provide clear feedback for every action
- Show decision-critical information prominently

### Don't

- Use random hex colors
- Use random border radius
- Use random shadows
- Use random font sizes
- Use random spacing
- Use random gradients
- Use random animation
- Use random icon styles
- Make every screen spacious
- Use color alone to communicate meaning
- Expose internal data to customers
- Create fake AI visuals
- Use neon/glowing UI elements
- Mix one-time and recurring billing without labels
- Hide important decisions in tiny UI elements
- Use multiple competing primary buttons

---

## 55. Final Implementation Tokens

### Color Tokens

```css
/* Primitive */
--color-slate-50: #f8fafc;
--color-slate-100: #f1f5f9;
--color-slate-200: #e2e8f0;
--color-slate-300: #cbd5e1;
--color-slate-400: #94a3b8;
--color-slate-500: #64748b;
--color-slate-700: #334155;
--color-slate-800: #1e293b;
--color-slate-900: #0f172a;

--color-indigo-50: #eef2ff;
--color-indigo-500: #6366f1;
--color-indigo-600: #4f46e5;
--color-indigo-700: #4338ca;

/* Semantic — Light */
--color-background: #f8fafc;
--color-foreground: #0f172a;
--color-surface: #ffffff;
--color-surface-muted: #f1f5f9;
--color-primary: #4f46e5;
--color-primary-hover: #4338ca;
--color-primary-subtle: #eef2ff;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;
--color-intelligence: #8b5cf6;
--color-border: #e2e8f0;
--color-border-strong: #cbd5e1;

/* Semantic — Dark */
.dark {
  --color-background: #070a13;
  --color-surface: #0f172a;
  --color-primary: #6366f1;
  --color-primary-hover: #818cf8;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
  --color-info: #60a5fa;
  --color-border: #1e293b;
  --color-border-strong: #334155;
}

/* Tenant Branding */
--tenant-primary: #4f46e5;
--tenant-primary-hover: #4338ca;
--tenant-primary-subtle: #eef2ff;
```

### Typography Tokens

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--text-display: 48px / 56px;
--text-h1: 32px / 40px;
--text-h2: 24px / 32px;
--text-h3: 20px / 28px;
--text-h4: 18px / 26px;
--text-body: 16px / 24px;
--text-body-small: 14px / 22px;
--text-small: 13px / 20px;
--text-caption: 12px / 16px;
--text-label: 13px / 18px;
```

### Spacing Tokens

```css
/* 4/8-based scale */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;

/* Context */
--page-padding: 24px;
--card-padding: 20px;
--grid-gap: 16px;
--section-gap: 32px;
```

### Radius Tokens

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-pill: 9999px;
```

### Shadow Tokens

```css
--shadow-1: 0 1px 2px rgba(15,23,42,.04);
--shadow-2: 0 4px 12px rgba(15,23,42,.06);
--shadow-3: 0 8px 24px rgba(15,23,42,.08);
--shadow-4: 0 16px 40px rgba(15,23,42,.12);
```

### Layout Tokens

```css
--sidebar-width: 240px;
--sidebar-collapsed: 72px;
--topbar-height: 64px;
--content-max-width: 1600px;
```

### Breakpoint Tokens

```css
--bp-mobile-s: 320px;
--bp-mobile-m: 375px;
--bp-mobile-l: 430px;
--bp-tablet: 768px;
--bp-laptop: 1024px;
--bp-desktop: 1280px;
--bp-desktop-l: 1440px;
--bp-desktop-xl: 1920px;
```

### Status Tokens

```css
/* Draft → Slate */
/* Pending → Amber */
/* Approved → Emerald */
/* Rejected → Red */
/* Negotiation → Amber */
/* Confirmed → Indigo/Blue */
/* Fulfillment → Blue */
/* Backorder → Amber/Orange */
/* Completed → Emerald */
/* Failed → Red */
```

### Risk Tokens

```css
/* LOW (0-30) → success */
/* MEDIUM (31-60) → warning */
/* HIGH (61-80) → orange/danger */
/* CRITICAL (81-100) → danger */
```

### Intelligence Tokens

```css
/* Intelligence color: #8B5CF6 */
/* Reserved for: recommendations, insights, AI features */
```

### Financial Formatting Rules

```css
.tabular-nums {
  font-variant-numeric: tabular-nums lining-nums;
}
```

### Motion Tokens

```css
--duration-fast: 120ms;
--duration-normal: 200ms;
--duration-modal: 300ms;
--duration-page: 350ms;
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 56. Final Quality Standard

The final product must feel:

- Enterprise
- Professional
- Reliable
- Trustworthy
- Fast
- Data-driven
- Intelligent
- Consistent

Industry-level does NOT mean:
- More gradients
- More animations
- More colors
- More shadows
- More glassmorphism
- More cards
- More decoration

Industry-level means:
- Better hierarchy
- Better information architecture
- Better decision support
- Better states
- Better consistency
- Better accessibility
- Better responsiveness
- Better operational density
- Better auditability
- Better tenant support
