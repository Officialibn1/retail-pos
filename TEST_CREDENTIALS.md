# Test User Credentials

After running the database seed script, you can log in with these test accounts:

## SUPERADMIN

- **Email**: superadmin@pos.com
- **Password**: password123
- **Permissions**: Full system access, can manage users

## ADMIN

- **Email**: admin@pos.com
- **Password**: password123
- **Permissions**: Administrative access

## MANAGER

- **Email**: manager@pos.com
- **Password**: password123
- **Permissions**: Can view all data, manage inventory, view activity logs

## CASHIER

- **Email**: cashier@pos.com
- **Password**: password123
- **Permissions**: Basic sales and checkout operations

---

⚠️ **Important**: These are test credentials for development only. Never use these in production!

To seed the database with this test data, run:

```bash
pnpm db:seed
```

See `prisma/SEED_README.md` for more details.
