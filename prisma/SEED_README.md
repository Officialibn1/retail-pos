# Database Seed Script

This seed script populates your database with test data for development and testing purposes.

## What Gets Seeded

### Users (4 users - one per role)

- **SUPERADMIN**: superadmin@pos.com / password123
- **ADMIN**: admin@pos.com / password123
- **MANAGER**: manager@pos.com / password123
- **CASHIER**: cashier@pos.com / password123

### Customers (3 records)

- John Doe
- Jane Smith
- Ahmed Ibrahim

### Categories (4 records)

- Electronics
- Groceries
- Beverages
- Household Items

### Inventory Items (12 records)

- 3 Electronics items (USB cables, chargers, earphones)
- 3 Groceries items (rice, oil, sugar)
- 3 Beverages items (cola, water, juice)
- 3 Household items (detergent, toilet paper, dish soap)

### Stock Movements (4 records)

- Initial stock entries
- Sample sale movements

### Sales (5 records)

- 3 completed sales (with different payment methods: CASH, CARD, MOBILE_MONEY)
- 1 pending sale
- 1 cancelled sale

## How to Run

### First Time Setup

1. Install dependencies (if not already done):

```bash
pnpm install
```

2. Make sure your database is set up and migrations are run:

```bash
npx prisma migrate dev
```

3. Run the seed script:

```bash
pnpm db:seed
```

Or using Prisma directly:

```bash
npx prisma db seed
```

### Reset and Reseed

If you want to clear all data and reseed:

```bash
# Reset database (drops all data and reruns migrations)
npx prisma migrate reset

# This will automatically run the seed script after reset
```

Or manually:

```bash
# Clear and reseed
pnpm db:seed
```

## Important Notes

⚠️ **Warning**: The seed script will DELETE ALL EXISTING DATA before seeding. Only use this in development environments.

🔐 **Security**: All test users have the password `password123`. Change these in production!

💰 **Currency**: All prices are in Nigerian Naira (₦).

## Test Data Details

### User Roles & Permissions

- **SUPERADMIN**: Full system access, can manage users
- **ADMIN**: Administrative access
- **MANAGER**: Can view all data, manage inventory, view activity logs
- **CASHIER**: Basic sales and checkout operations

### Sample Sales Data

The seed includes realistic sales scenarios:

- Multi-item purchases
- Different payment methods (Cash, Card, Mobile Money)
- Sales with and without customers
- Pending and cancelled sales for testing workflows

### Inventory Stock Levels

All items are seeded with reasonable stock levels:

- Electronics: 30-50 units
- Groceries: 60-100 units
- Beverages: 80-300 units
- Household: 85-120 units

## Troubleshooting

### Error: "tsx: command not found"

Make sure you've installed dependencies:

```bash
pnpm install
```

### Error: "Database connection failed"

Check your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Error: "Unique constraint failed"

The database might already have data. Run:

```bash
npx prisma migrate reset
```

## Customization

To modify the seed data, edit `prisma/seed.ts`. The script is organized into sections:

1. Users
2. Customers
3. Categories
4. Inventory Items
5. Stock Movements
6. Sales

Each section can be customized independently.
