# Email Notification System

This module provides email notification functionality for the POS system with support for multiple email providers.

## Supported Providers

All providers are installed and ready to use. Simply configure the one you want via environment variables:

- **NodeMailer** - SMTP (Gmail, Outlook, custom SMTP servers)
- **SendGrid** - Cloud email service
- **Resend** - Modern email API
- **Amazon SES** - AWS email service

## Configuration

Set the `EMAIL_PROVIDER` environment variable to one of: `NODEMAILER`, `SENDGRID`, `RESEND`, or `AMAZON_SES`

### NodeMailer Configuration

```env
EMAIL_PROVIDER=NODEMAILER
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
NODEMAILER_HOST=smtp.gmail.com  # Optional, defaults to smtp.gmail.com
NODEMAILER_PORT=587             # Optional, defaults to 587
```

**For Gmail:**

1. Enable 2-factor authentication
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use the generated password in `NODEMAILER_PASSWORD`

### SendGrid Configuration

```env
EMAIL_PROVIDER=SENDGRID
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Resend Configuration

```env
EMAIL_PROVIDER=RESEND
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Amazon SES Configuration

```env
EMAIL_PROVIDER=AMAZON_SES
SES_FROM_EMAIL=noreply@yourdomain.com
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

## Email Notifications

### 1. User Status Changes

Automatically sent when a user's status is changed to ACTIVE, BLOCKED, or SUSPENDED.

**Trigger:** User status update via `/api/users/[id]/status`

**Recipients:** The affected user (if they have an email)

**Content:** Status change notification with reason (if provided)

### 2. Purchase Receipts

Automatically sent when a customer completes a purchase.

**Trigger:** Sale completion via `/api/sales/[id]/complete`

**Recipients:** The customer (if they have an email)

**Content:**

- Order details with item list
- Subtotal, tax, and total
- Payment method and date
- Professional receipt design

### 3. Canceled Orders Report

Automatically sent when pending orders are canceled at midnight by the cron job.

**Trigger:** Built-in cron job at 23:59:59 daily

**Recipients:** All SUPERADMIN and MANAGER users with email addresses

**Content:**

- List of all canceled orders
- Customer names and order totals
- Total amount of canceled orders
- Timestamp of cancellation

## Cron Job Integration

The email system is integrated with the existing built-in cron job that runs at midnight. See `CRON_SETUP.md` for details on the cron configuration.

**Environment Variables:**

```env
OPEN_IN_MIDNIGHT=false  # Set to true to disable auto-cancellation
DISABLE_CRON=false      # Set to true to disable all cron jobs
TZ=Africa/Lagos         # Set your timezone
```

## Installation

All required dependencies are already installed:

```json
{
	"dependencies": {
		"nodemailer": "^8.0.1",
		"@sendgrid/mail": "^8.1.6",
		"resend": "^6.9.2",
		"@aws-sdk/client-ses": "^3.990.0"
	},
	"devDependencies": {
		"@types/nodemailer": "^7.0.10"
	}
}
```

## How It Works

The email system uses a **switch case** pattern to select the appropriate email provider based on the `EMAIL_PROVIDER` environment variable. This ensures:

1. All providers are available without conditional imports
2. Easy switching between providers
3. Consistent error handling
4. Single point of configuration

## Usage

The email system is automatically integrated. No manual calls needed:

```typescript
// User status change (automatic)
await updateUserStatus(userId, "BLOCKED");
// → Email sent automatically if user has email

// Purchase completion (automatic)
await completeSale(saleId, paymentData);
// → Email sent automatically if customer has email

// Canceled orders (automatic via cron)
// → Runs at midnight, sends email to admins
```

## Error Handling

Email failures are logged but **do not prevent** the main operation:

- User status updates complete even if email fails
- Sales complete even if receipt email fails
- Orders are canceled even if admin notification fails

All errors are logged to console for monitoring.

## Testing

### Test User Status Email

```bash
# Update a user's status via API
curl -X PATCH http://localhost:3000/api/users/[id]/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "SUSPENDED"}'
```

### Test Purchase Receipt

Complete a sale with a customer who has an email address.

### Test Canceled Orders Email

Wait for midnight or temporarily modify the cron schedule in `lib/cron/cancel-pending-orders.ts`:

```typescript
// For testing only - runs every minute
const cronSchedule = "* * * * *";
```

**Remember to change it back to `"59 59 23 * * *"` after testing!**

## Troubleshooting

### Email Not Sending

1. Check `EMAIL_PROVIDER` is set correctly
2. Verify all required credentials are configured
3. Check console logs for error messages
4. Ensure the recipient has a valid email address

### NodeMailer Issues

- Use App Password, not regular password
- Verify 2FA is enabled on Google account
- Check SMTP host and port settings
- Try port 465 with SSL if 587 fails

### SendGrid Issues

- Verify API key has "Mail Send" permissions
- Ensure from email is verified in SendGrid
- Check SendGrid account status

### Resend Issues

- Verify API key is valid
- Ensure from email domain is verified
- Check account limits

### Amazon SES Issues

- Verify AWS credentials have SES permissions
- Ensure from email is verified in SES
- Check if account is in sandbox mode
- Verify AWS region is correct

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use App Passwords** - For Gmail/SMTP services
3. **Verify domains** - For SendGrid, Resend, and SES
4. **Rotate keys** - Regularly update API keys
5. **Monitor usage** - Check email service dashboards

## Provider Comparison

| Provider   | Best For                 | Pros                 | Cons                       |
| ---------- | ------------------------ | -------------------- | -------------------------- |
| NodeMailer | Development, Small scale | Easy setup, Free     | Rate limits, Less reliable |
| SendGrid   | Production, High volume  | Reliable, Analytics  | Paid service               |
| Resend     | Modern apps, Developers  | Great DX, Simple API | Newer service              |
| Amazon SES | AWS users, Enterprise    | Scalable, Cheap      | Complex setup              |

## Support

For issues or questions:

1. Check console logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with a simple provider like NodeMailer first
4. Review provider-specific documentation
5. Check email service status pages
