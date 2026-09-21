# Retail POS System

A full-featured, web-based Point of Sale system built for retail stores. Designed to handle everything from day-to-day sales to inventory management, analytics, and staff administration — all in one place.

**Live Preview:** [https://retail-pos-vert.vercel.app/](https://retail-pos-vert.vercel.app/)

**Demo Credentials:**

| Role | Email | Username | Password |
|---|---|---|---|
| Admin | admin@pos.com | admin | password123 |
| Manager | manager@pos.com | manager | password123 |

---

## Purpose

Running a retail store involves more than just ringing up sales. This project aims to give store owners, managers, and cashiers a single tool that covers the full operational picture: tracking stock, recording expenses, managing staff, processing returns, and understanding business performance through data.

The system is built with small-to-medium retail operations in mind, with the Nigerian Naira (₦) as the primary currency, though it can be adapted for other markets.

---

## Screenshots

**Dashboard** — at-a-glance view of total revenue, orders, average order value, and recent transactions.

![Dashboard](public/Screenshot%201.png)

**Inventory Management** — full product list with stock levels, low-stock alerts, category filtering, and quick actions.

![Inventory Management](public/Screenshot%202.png)

**Analytics Dashboard** — sales trend charts, revenue breakdowns, cashier performance, and CSV export.

![Analytics Dashboard](public/Screenshot%203.png)

---

## What Has Been Built

### Core Sales & Checkout
- Product search with barcode scanner support
- Shopping cart with per-line item notes and quantity controls
- Multiple payment method support
- Receipt generation and printing
- Pending orders — save a sale mid-session and resume it later
- Edit pending orders — add or remove items from a saved sale before completing it
- Promotion/coupon code input at checkout

### Inventory Management
- Full CRUD for inventory items with category support
- Stock adjustment with movement tracking and reasons
- Low-stock threshold alerts with in-app notification bell and email alerts to managers
- Supplier management — link inventory items to suppliers
- Purchase orders — create orders from suppliers and auto-adjust stock on receipt
- Item cost (purchase price) tracking per inventory item

### Customer Management
- Customer registration and profile management
- Purchase history per customer
- Spending tier / loyalty indicator (Bronze, Silver, Gold) based on total spend

### Sales History & Returns
- Searchable and filterable sales history
- Full and partial returns with automatic stock restocking
- Return reason tracking

### Analytics & Reporting
- Revenue and sales trend charts
- Top products by quantity and revenue
- Category revenue breakdown
- Payment method distribution
- Cashier performance tracking
- Customer analytics
- Total expenses and net profit cards
- Export support (CSV/PDF)

### Expense Tracking
- Record operational costs by category (Rent, Salaries, Utilities, Restocking, etc.)
- Expenses feed into net profit calculations on the analytics dashboard

### Cash Drawer / Shift Management
- Cashiers declare an opening float when starting a shift
- Closing shift reconciles expected cash vs declared cash and shows variance
- Shift status visible in the dashboard header

### Discount Codes & Promotions
- Create promotions with percentage or fixed-amount discounts
- Scope promotions to all items, specific categories, or specific products
- Expiry dates and usage limits per promotion
- Apply promotions at checkout via coupon code or automatic matching

### User Management & Role-Based Access Control
Four user roles with distinct permission levels:
- **SUPERADMIN** — full system access including user management and all settings
- **ADMIN** — administrative access
- **MANAGER** — can view all data, manage inventory, view activity logs, and edit basic store info
- **CASHIER** — sales and checkout operations

### Authentication & Security
- JWT-based session management
- Password reset via email (supports SendGrid, Resend, AWS SES, or Nodemailer)
- Change password from within the dashboard
- Role-based route guards on both client and server

### Activity Logs
- System-wide audit trail of user actions
- Structured metadata per log entry (entity type, entity ID, change diffs)
- Filterable by entity type and entity ID

### Store Settings
- Store name, address, phone, email, logo, and primary color
- Tax rate configuration
- Currency symbol configuration (replaces hardcoded ₦ throughout the app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| State Management | Redux Toolkit + RTK Query |
| Forms | React Hook Form + Zod |
| Auth | JWT + bcryptjs |
| Email | Nodemailer / SendGrid / AWS SES / Resend |
| Testing | Jest + Testing Library |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm (recommended)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd retail-pos

# Install dependencies
pnpm install

# Copy the example env file and fill in your values
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data (optional)
pnpm db:seed

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See `.env.example` for all required variables. Key ones include:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret key for signing tokens
- Email provider credentials (choose one: SendGrid, AWS SES, Resend, or SMTP via Nodemailer)

### Common Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests
npx prisma studio     # Open Prisma Studio GUI
npx prisma migrate dev # Run pending migrations
```

---

## Known Bugs

### Pending Order Total Discrepancy

When a sale is saved as **pending** and later edited (items added or removed), the displayed total price can show a discrepancy compared to what is actually stored in the database. The root cause lies in how the `subTotal`, `taxAmount`, `discountAmount`, and `total` fields are recalculated (or not fully recalculated) during the `PATCH /api/sales/[id]/items` update.

**This is an open issue and a great first contribution.** The relevant files are:

- `app/api/sales/[id]/items/route.ts` — the PATCH handler where the recalculation should happen
- `lib/services/sale.service.ts` — the service layer for sale operations
- `components/sales/shopping-cart.tsx` — the cart UI that displays the totals

---

## Open for Collaboration

This project is open to contributions from anyone. Whether you want to fix a bug, improve performance, add a missing feature, or improve documentation — pull requests are welcome.

A few areas that still need work (see `IMPROVEMENT_PLAN.md` for the full list):

- **Bulk CSV import** for inventory items
- **Product images** on inventory items and the checkout product search
- **Analytics period comparison** — overlay current vs previous date range on charts
- **Barcode label printing** directly from the inventory table
- **Shift-based reporting** in analytics

If you find this project useful, please **star the repository** ⭐ — it helps others discover it and motivates continued development.

If this system provides real value to your business, the owner would genuinely appreciate a voluntary contribution as a thank you. There is no obligation, but it goes a long way in supporting continued work on the project.

---

## License

This project is free to use for **personal or commercial purposes**. You may modify and deploy it for your own store or for clients. The only ask is that you **star the repository** if you use it, so others can find it too.

---

## API Documentation

A full REST API reference is available in `API_DOCUMENTATION.md`. It covers all endpoints, request/response shapes, and authentication requirements.

## RBAC Reference

A detailed breakdown of role permissions is in `RBAC.md`.
