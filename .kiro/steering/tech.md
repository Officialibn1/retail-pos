---
inclusion: always
---

# Tech Stack

## Framework & Runtime

- **Next.js 14** (App Router) - React framework with server-side rendering
- **React 18** - UI library
- **TypeScript 5** - Type-safe JavaScript

## Database & ORM

- **PostgreSQL** - Primary database
- **Prisma 7** - ORM with custom output directory (`generated/prisma`)
- **@prisma/adapter-pg** - PostgreSQL adapter for Prisma

## UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library (New York style)
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Geist Font** - Sans and mono fonts
- **next-themes** - Dark mode support

## Forms & Validation

- **react-hook-form** - Form state management
- **zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

## Charts & Analytics

- **Recharts** - Data visualization library

## Common Commands

```bash
# Development
pnpm dev              # Start development server

# Build & Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Database
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run migrations in development
npx prisma studio     # Open Prisma Studio GUI
```

## Configuration Notes

- Path aliases use `@/*` for root-level imports
- Prisma client is generated to `generated/prisma` (not default location)
- TypeScript strict mode is enabled
- ESLint and TypeScript errors are ignored during builds (see next.config.mjs)
- Images are unoptimized in Next.js config
