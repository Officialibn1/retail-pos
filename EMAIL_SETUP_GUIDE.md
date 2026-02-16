# Email System Setup Guide

## Quick Start

### 1. Install Dependencies ✅

All dependencies are already installed:

- `nodemailer` - SMTP/Gmail support
- `@sendgrid/mail` - SendGrid support
- `resend` - Resend support
- `@aws-sdk/client-ses` - Amazon SES support

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# Choose ONE provider: NODEMAILER, SENDGRID, RESEND, or AMAZON_SES
EMAIL_PROVIDER=NODEMAILER

# NodeMailer Configuration (Gmail example)
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
```

### 3. Get Gmail App Password (for NodeMailer)

1. Go to your Google Account: https://myaccount.google.com
2. Enable 2-Factor Authentication if not already enabled
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Select "Mail" and generate a password
5. Copy the 16-character password to `NODEMAILER_PASSWORD`

### 4. Test the System

Start your application:

```bash
pnpm dev
```

The email system will automatically:

- Send emails when user status changes
- Send receipts when sales are completed
- Send reports when orders are canceled at midnight

## Email Notifications

### 1. User Status Change

**Trigger**: Update user status via `/api/users/[id]/status`
**Recipients**: The affected user
**Content**: Status change notification (ACTIVE, BLOCKED, or SUSPENDED)

### 2. Purchase Receipt

**Trigger**: Complete a sale via `/api/sales/[id]/complete`
**Recipients**: The customer (if they have an email)
**Content**: Detailed receipt with items, totals, and payment info

### 3. Canceled Orders Report

**Trigger**: Automatic at 23:59:59 daily (via cron job)
**Recipients**: All SUPERADMIN and MANAGER users
**Content**: Summary of all auto-canceled pending orders

## Provider Configuration

### NodeMailer (Recommended for Getting Started)

```env
EMAIL_PROVIDER=NODEMAILER
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
NODEMAILER_HOST=smtp.gmail.com  # Optional
NODEMAILER_PORT=587             # Optional
```

**Pros**: Easy setup, free
**Cons**: Daily sending limits (~500 emails/day)

### SendGrid (Recommended for Production)

```env
EMAIL_PROVIDER=SENDGRID
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

**Pros**: Reliable, analytics, high volume
**Cons**: Requires account and verified sender

### Resend (Modern Alternative)

```env
EMAIL_PROVIDER=RESEND
RESEND_API_KEY=your-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Pros**: Great developer experience, simple API
**Cons**: Newer service, requires verified domain

### Amazon SES (Enterprise)

```env
EMAIL_PROVIDER=AMAZON_SES
SES_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

**Pros**: Scalable, cost-effective for high volume
**Cons**: Complex setup, requires AWS account

## Testing

### Test User Status Email

1. Log in as SUPERADMIN
2. Go to Users page
3. Change a user's status to SUSPENDED or BLOCKED
4. Check the user's email inbox

### Test Purchase Receipt

1. Create a sale with a customer who has an email
2. Complete the sale
3. Check the customer's email inbox

### Test Canceled Orders Report

The cron job runs at midnight. To test immediately:

1. Open `lib/cron/cancel-pending-orders.ts`
2. Temporarily change line 29:
   ```typescript
   const cronSchedule = "* * * * *"; // Every minute for testing
   ```
3. Restart the application
4. Wait 1 minute
5. Check SUPERADMIN/MANAGER email inboxes
6. Change it back to `"59 59 23 * * *"`

## Troubleshooting

### Emails Not Sending

1. **Check console logs** - Look for error messages
2. **Verify EMAIL_PROVIDER** - Must be exactly: NODEMAILER, SENDGRID, RESEND, or AMAZON_SES
3. **Check credentials** - Ensure all required env vars are set
4. **Test with NodeMailer first** - Easiest to set up and debug

### Gmail/NodeMailer Issues

- **"Invalid credentials"** - Use App Password, not regular password
- **"Less secure apps"** - Don't enable this, use App Password instead
- **2FA required** - Must enable 2FA to generate App Passwords
- **Still not working** - Try port 465 instead of 587

### SendGrid Issues

- **"Unauthorized"** - Check API key is correct
- **"From email not verified"** - Verify sender in SendGrid dashboard
- **"Account suspended"** - Check SendGrid account status

### Resend Issues

- **"Invalid API key"** - Verify key is correct
- **"Domain not verified"** - Verify domain in Resend dashboard
- **Rate limits** - Check account limits

### Amazon SES Issues

- **"Access denied"** - Verify IAM permissions for SES
- **"Email not verified"** - Verify sender email in SES console
- **"Sandbox mode"** - Verify recipient emails or request production access
- **Wrong region** - Ensure AWS_REGION matches your SES setup

## Architecture

### Switch Case Pattern

The email system uses a unified switch case in `lib/email/email-provider.ts`:

```typescript
switch (provider) {
	case "NODEMAILER":
		await sendWithNodeMailer(params);
		break;
	case "SENDGRID":
		await sendWithSendGrid(params);
		break;
	case "RESEND":
		await sendWithResend(params);
		break;
	case "AMAZON_SES":
		await sendWithAmazonSES(params);
		break;
}
```

This ensures:

- All providers available without conditional imports
- Easy switching via environment variable
- Consistent error handling
- Single configuration point

### Error Handling

All email operations are non-blocking:

```typescript
try {
  await sendEmail(...);
} catch (error) {
  console.error('Failed to send email:', error);
  // Main operation continues
}
```

This means:

- User status updates always complete
- Sales always complete
- Orders are always canceled
- Email failures don't break functionality

## File Structure

```
lib/email/
├── email-provider.ts           # Unified provider with switch case
├── index.ts                    # Main email service exports
├── types.ts                    # TypeScript interfaces
├── templates/
│   ├── user-status.ts         # User status change template
│   ├── purchase-receipt.ts    # Purchase receipt template
│   └── canceled-orders.ts     # Canceled orders report template
└── README.md                   # Detailed documentation

lib/cron/
├── cancel-pending-orders.ts   # Cron job with email integration
└── index.ts                    # Cron initialization

lib/services/
├── user-status.service.ts     # User status with email integration
└── sale.service.ts            # Sale completion with email integration
```

## Environment Variables Reference

```env
# Required
EMAIL_PROVIDER=NODEMAILER|SENDGRID|RESEND|AMAZON_SES

# NodeMailer
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
NODEMAILER_HOST=smtp.gmail.com      # Optional
NODEMAILER_PORT=587                 # Optional

# SendGrid
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Resend
RESEND_API_KEY=your-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Amazon SES
SES_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1

# Cron Configuration
OPEN_IN_MIDNIGHT=false          # Set true for 24/7 stores
DISABLE_CRON=false              # Set true to disable cron
TZ=Africa/Lagos                 # Your timezone
```

## Next Steps

1. ✅ Dependencies installed
2. ⏳ Configure environment variables
3. ⏳ Test user status email
4. ⏳ Test purchase receipt email
5. ⏳ Test canceled orders email
6. ⏳ Monitor console logs
7. ⏳ Switch to production provider if needed

## Support

- **Detailed docs**: See `lib/email/README.md`
- **Cron setup**: See `CRON_SETUP.md`
- **Implementation**: See `EMAIL_SYSTEM_IMPLEMENTATION.md`
- **Example env**: See `.env.example`

## Security Checklist

- [ ] Environment variables set in `.env.local` (not committed)
- [ ] Using App Password for Gmail (not regular password)
- [ ] API keys kept secret
- [ ] Sender emails verified with providers
- [ ] Production credentials different from development
- [ ] Regular key rotation scheduled

## Production Checklist

- [ ] Switch from NodeMailer to SendGrid/Resend/SES
- [ ] Verify sender domain
- [ ] Test all three email types
- [ ] Monitor email delivery rates
- [ ] Set up email service alerts
- [ ] Configure proper timezone for cron
- [ ] Review email templates for branding
- [ ] Test email rendering on multiple clients
