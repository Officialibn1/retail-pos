# Automatic Pending Order Cancellation - Built-in Cron Job

This document explains the built-in automatic cancellation of pending orders at midnight (23:59:59).

## Overview

The system includes a **built-in cron job** that automatically cancels all pending orders at the end of each day. This works on **any hosting platform** including VPS, dedicated servers, cloud platforms, and containerized environments.

**No external cron service required!** The scheduler runs in-process using `node-cron`.

## Environment Variables

Add these to your `.env` or `.env.local` file:

```bash
# Set to "true" if your store operates 24/7 (disables auto-cancel)
OPEN_IN_MIDNIGHT=false

# Optional: Set your timezone (defaults to UTC if not set)
# Examples: America/New_York, Europe/London, Asia/Tokyo, Africa/Lagos
TZ=UTC
```

## How It Works

1. **Automatic Initialization**: The cron job starts automatically when your application starts
2. **Environment Check**: Checks the `OPEN_IN_MIDNIGHT` variable
   - If `true`: Store operates 24/7, no orders are cancelled
   - If `false` or not set: Orders are cancelled at midnight
3. **Execution**: At 23:59:59 daily (in your configured timezone), all orders with status `PENDING` are changed to `CANCELLED`
4. **Logging**: The system logs the cancellation activity for audit purposes
5. **In-Process**: Runs within your Node.js application, no external services needed

## Setup Instructions

### 1. Configure Environment Variables

Create or update your `.env` file:

```bash
# For stores that close at night (enable auto-cancel)
OPEN_IN_MIDNIGHT=false

# Set your timezone (important!)
 (WAT)
```

### 2. Start Your Application

The cron job will automatically initialize when you start your application:

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

You should see console output like:

```
🚀 Initializing cron jobs...
⏰ Initializing auto-cancel pending orders cron job...
📅 Schedule: Daily at 23:59:59
✅ Auto-cancel pending orders cron job initialized
🌍 Timezone: Africa/Lagos
✅ All cron jobs initialized
```

### 3. That's It!

cron job will run automatically every day at 23:59:59 in your configured timezone.

## Common Timezone Examples

```bash
# West Africa Time (Nigeria, Ghana, etc.)
TZ=Africa/Lagos

# East Africa Time (Kenya, Tanzania, etc.)
TZ=Africa/Nairobi

# South Africa
TZ=Africa/Johannesburg

# UTC (Universal Time)
TZ=UTC

# US Eastern Time
TZ=America/New_York

# US Pacific Time
TZ=America/Los_Angeles

# UK
TZ=Europe/London

# Central European Time
TZ=Europe/Paris
```

## Testing

### Check if Cron is Running

When you start your application, check the console output. You should see:

```
✅ Auto-cancel pending orders cron job initialized
🌍 Timezone: Africa/Lagos
```

### Test Manually (Development)

You can test the cancellation logic by temporarily changing the cron schedule in `lib/cron/cancel-pending-orders.ts`:

```typescript
// Change from:
const cronSchedule = "59 59 23 * * *"; // 23:59:59 daily

// To (runs every minute for testing):
const cronSchedule = "* * * * * *"; // Every second (for testing only!)
```

**Remember to change it back after testing!**

### Monitor Execution

When the cron job runs, you'll see console output:

```
🔄 Running auto-cancel pending orders job...
📋 Found 3 pending orders to cancel
✅ Successfully cancelled 3 pending orders
📝 Activity logged successfully
```

Or if no orders:

```
🔄 Running auto-cancel pending orders job...
✅ No pending orders to cancel
```

## Disabling Auto-Cancel

To disable automatic cancellation (for 24/7 stores):

```bash
OPEN_IN_MIDNIGHT=true
```

Console output will sh

```
🏪 Store operates 24/7 - Auto-cancel pending orders is DISABLED
```

## Deployment Platforms

### VPS / Dedicated Server

Works out of the box. Just:

1. Set environment variables
2. Start your application with `pnpm start`
3. Use a process manager like PM2 to keep it running:

```bash
pm2 start npm --name "pos-system" -- start
pm2 save
pm2 startup
```

### Docker

Add environment variables to your `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - OPEN_IN_MIDNIGHT=false
	  - TZ=Africa/Lagos
```

Or in Dockerfile:

```dockerfile
ENV OPEN_IN_MIDNIGHT=false
ENV TZ=Africa/Lagos
```

### Cloud Platforms (AWS, GCP, Azure, etc.)

Set environment variables in your platform's configuration:

- AWS Elastic Beanstalk: Environment Properties
- Google Cloud Run: Environment Variables
- Azure App Service: Application Settings

### Vercel / Netlify

Works on these platforms too! The cron job runs in-process, so it works anywhere Node.js runs.

s when the server is active. For guaranteed execution, consider using the platform's native cron features or keep a server instance running.

## Monitoring

### View Activity Logs

Check the activity logs in your dashboard to see when orders were automatically cancelled. Look for entries with:

- Action: `SYSTEM_AUTO_CANCEL`
- Entity Type: `Sale`
- Entity ID: `BULK`

### Database Query

You can also query the database directly:

```sql
SELECT * FROM activity_logs
WHERE action = 'SYSTEM_AUTO_CANCEL'
dAt" DESC
LIMIT 10;
```

## Troubleshooting

### Cron job not running

1. **Check console output**: Look for initialization messages when starting the app
2. **Verify environment variables**: Ensure `OPEN_IN_MIDNIGHT` is not set to `true`
3. **Check timezone**: Verify `TZ` is set correctly
4. **Application running**: Ensure your application is running continuously

### Orders not being cancelled

1. **Verify `OPEN_IN_MIDNIGHT`**: Should be `false` or not set
   database
2. **Review console logs**: Look for error messages
3. **Check timezone**: Ensure it matches your local time

### Wrong time execution

1. **Set TZ environment variable**: The cron uses system timezone if not set
2. **Verify timezone format**: Use IANA timezone names (e.g., `Africa/Lagos`)
3. **Restart application**: After changing `TZ`, restart the app

## Advanced Configuration

### Custom Schedule

To change the execution time, edit `lib/cron/cancel-pending-orders.ts`:

```typescript
// Current: 59 daily
const cronSchedule = "59 59 23 * * *";

// Examples:
// Midnight (00:00:00): "0 0 0 * * *"
// 6 AM: "0 0 6 * * *"
// Every hour: "0 0 * * * *"
```

Cron format: `second minute hour day month weekday`

### Multiple Schedules

You can add multiple cron jobs in `lib/cron/index.ts`:

```typescript
export function initializeCronJobs() {
	initializeCancelPendingOrdersCron();
	initializeBackupCron();
	initializeReportGenerationCron();
}
```

## Security

- The cron job runs in-process, no external API calls
- No authentication needed (runs internally)
- Activity is logged for audit purposes
- Only affects orders with `PENDING` status

## Performance

ancel pending orders is DISABLED
✅ All cron jobs initialized

```
essful Execution

```

🚀 Initializing cron jobs...
⏰ Initializing auto-cancel pending orders cron job...
📅 Schedule: Daily at 23:59:59
✅ Auto-cancel pending orders cron job initialized
🌍 Timezone: Africa/Lagos
✅ All cron jobs initialized

... (at 23:59:59) ...

🔄 Running auto-cancel pending orders job...
📋 Found 5 pending orders to cancel
✅ Successfully cancelled 5 pending orders
📝 Activity logged successfully

```

### 24/7 Store (Disabled)

```

🚀 Initializing cron jobs...
🏪 Store operates 24/7 - Auto-c- Minimal resource usage

- Runs once per day
- Uses efficient database queries
- Logs activity for monitoring

## Support

If you encounter issues:

1. Check console logs for error messages
2. Verify environment variables
3. Test with a shorter schedule (e.g., every minute)
4. Check database for pending orders
5. Review activity logs

## Example Console Output

### Succ
