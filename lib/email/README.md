# Email System

The email module handles all outbound notifications. It supports four providers selectable via the `EMAIL_PROVIDER` environment variable.

## Supported Providers

| Provider     | Best For                 | Key Notes                                      |
| ------------ | ------------------------ | ---------------------------------------------- |
| `NODEMAILER` | Development / small-scale | Requires Gmail App Password; ~500 emails/day  |
| `SENDGRID`   | Production / high volume  | Requires verified sender in SendGrid dashboard |
| `RESEND`     | Modern apps               | Requires verified domain                       |
| `AMAZON_SES` | Enterprise / AWS users    | Requires SES IAM permissions + verified email  |

## Configuration

Add the relevant block to your `.env` file:

```env
# Select one provider
EMAIL_PROVIDER=NODEMAILER

# --- NodeMailer (Gmail) ---
NODEMAILER_EMAIL=you@gmail.com
NODEMAILER_PASSWORD=your-16-char-app-password
NODEMAILER_HOST=smtp.gmail.com   # optional, default shown
NODEMAILER_PORT=587              # optional, default shown

# --- SendGrid ---
# EMAIL_PROVIDER=SENDGRID
# SENDGRID_API_KEY=SG.xxx
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# --- Resend ---
# EMAIL_PROVIDER=RESEND
# RESEND_API_KEY=re_xxx
# RESEND_FROM_EMAIL=noreply@yourdomain.com

# --- Amazon SES ---
# EMAIL_PROVIDER=AMAZON_SES
# SES_FROM_EMAIL=noreply@yourdomain.com
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
# AWS_REGION=us-east-1
```

**Gmail App Password setup:**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate a password for "Mail" and use it as `NODEMAILER_PASSWORD`

## Automatic Notifications

All email sending is automatic — no manual calls are needed:

| Event | Trigger | Recipients |
|---|---|---|
| User status change | `PATCH /api/users/[id]/status` | Affected user |
| User creation | `POST /api/users` | New user (credentials email) |
| Customer welcome | `POST /api/customers` (with email) | New customer |
| Purchase receipt | `POST /api/sales/[id]/complete` | Customer (if email on file) |
| Canceled orders report | Midnight cron job | All SUPERADMIN + MANAGER users |

All email sends are **non-blocking** — the primary operation (status update, sale completion, etc.) succeeds even if the email fails. Failures are logged to the console.

## File Structure

```
lib/email/
├── email-provider.ts     # Unified provider switch-case
├── index.ts              # Public send functions
├── store-info.ts         # Store info fetched from DB for templates
├── types.ts              # TypeScript interfaces
└── templates/
    ├── user-status.ts
    ├── user-creation.ts
    ├── customer-welcome.ts
    ├── purchase-receipt.ts
    ├── canceled-orders.ts
    └── password-reset.ts
```

## Testing

**User status email** — change a user's status via the Users page or API.

**Purchase receipt** — complete a sale with a customer who has an email address.

**Canceled orders report** — temporarily change the cron schedule in `lib/cron/cancel-pending-orders.ts` for local testing:
```typescript
// Every second instead of midnight — revert after testing
const cronSchedule = "* * * * * *";
```

**Cron environment variables:**
```env
OPEN_IN_MIDNIGHT=false  # true = store is 24/7, disables auto-cancel
DISABLE_CRON=false      # true = disable all cron jobs entirely
TZ=Africa/Lagos         # IANA timezone for cron scheduling
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| No emails sent | Check `EMAIL_PROVIDER` matches one of the four values exactly |
| Gmail "Invalid credentials" | Use App Password, not your regular password |
| SendGrid "Unauthorized" | Verify API key has Mail Send permission |
| SES "Access denied" | Check IAM role has `ses:SendEmail` permission |
| SES sandbox | Verify recipient emails or request production access |
