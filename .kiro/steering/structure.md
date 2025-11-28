---
inclusion: always
---

# Project Structure

## Directory Organization

```
/app                    # Next.js App Router pages and layouts
  /dashboard           # Main dashboard area (protected routes)
    /activity          # Activity logs
    /analytics         # Analytics and reports
    /inventory         # Inventory management
    /sales             # Sales processing
    /settings          # Settings page
    /users             # User management
  /login               # Authentication pages
  layout.tsx           # Root layout with AuthProvider
  globals.css          # Global styles

/components            # React components
  /analytics           # Chart components for analytics
  /auth                # Authentication components (providers, guards)
  /dashboard           # Dashboard layout components
  /inventory           # Inventory-specific components
  /receipts            # Receipt templates and printing
  /sales               # Sales and checkout components
  /ui                  # shadcn/ui components (50+ components)

/lib                   # Utility functions and shared logic
  /dummy-data          # Mock data for development
  analytics.ts         # Analytics calculations
  auth.ts              # Authentication helpers
  prisma.ts            # Prisma client instance
  types.ts             # Shared TypeScript types
  utils.ts             # General utilities (cn, etc.)

/hooks                 # Custom React hooks
  use-mobile.ts        # Mobile detection
  use-toast.ts         # Toast notifications

/prisma                # Database schema and migrations
  /migrations          # Database migration files
  schema.prisma        # Prisma schema definition

/generated/prisma      # Generated Prisma client (custom output)

/public                # Static assets (images, logos)

/styles                # Additional stylesheets
```

## Key Conventions

### Import Aliases

- Use `@/` prefix for all imports from project root
- Example: `@/components/ui/button`, `@/lib/utils`

### Component Patterns

- Client components use `"use client"` directive
- Server components by default (no directive needed)
- UI components from shadcn/ui are in `/components/ui`
- Feature-specific components are grouped by domain

### Authentication

- `AuthProvider` wraps the entire app in root layout
- `useAuth()` hook provides current user context
- Role-based guards use helper functions from `lib/auth.ts`
- Permission checks: `canViewAllData()`, `canManageInventory()`, etc.

### Database

- Prisma client is imported from `generated/prisma/client`
- Database connection uses PostgreSQL adapter
- Models follow singular naming (User, Sale, InventoryItem)
- Database tables use snake_case with plural names (users, sales, inventory_items)

### Styling

- Tailwind utility classes for styling
- Custom color scheme uses "lunar-green" variants
- `cn()` utility from `lib/utils` for conditional classes
- Component variants use `class-variance-authority`

### File Naming

- React components: PascalCase (e.g., `DashboardLayout.tsx`)
- Utilities and hooks: kebab-case (e.g., `use-mobile.ts`)
- Pages in App Router: lowercase (e.g., `page.tsx`, `layout.tsx`)
