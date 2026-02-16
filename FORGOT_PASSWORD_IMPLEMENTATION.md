# Forgot Password Implementation

This document describes the comprehensive forgot password functionality implemented in the POS system with support for both reset link and OTP verification methods.

## Features

- **Dual Reset Methods**: Users can choose between email link or OTP code
- **Email Integration**: Automated emails with branded templates
- **Security**: Token expiration, email enumeration protection, secure password requirements
- **User Experience**: Clear UI with password strength indicators and real-time validation

## Architecture

### Database Schema

Added to `PasswordResetToken` model:

- `otp`: Optional 6-digit OTP code
- `type`: Enum (`LINK` or `OTP`) to distinguish reset method
- Indexed `otp` field for fast lookups

### API Endpoints

#### 1. Request Password Reset

**Endpoint**: `POST /api/auth/request-reset`

**Request Body**:

```json
{
  "email": "user@example.com",
  "type": "LINK" | "OTP"  // defaults to "LINK"
}
```

**Response**:

```json
{
	"message": "If an account with that email exists, a password reset has been sent.",
	"token": "...", // Only in development
	"otp": "123456" // Only in development for OTP type
}
```

**Features**:

- Prevents email enumeration (always returns success)
- Generates secure token (32-byte hex)
- Generates 6-digit OTP for OTP type
- Sends branded email with reset link or OTP
- Deletes any existing reset tokens for the user
- Token expires in 60 minutes (LINK) or 10 minutes (OTP)

#### 2. Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`

**Request Body**:

```json
{
	"email": "user@example.com",
	"otp": "123456"
}
```

**Response**:

```json
{
	"message": "OTP verified successfully",
	"token": "..." // Token to use for password reset
}
```

**Features**:

- Validates OTP against email
- Checks expiration
- Returns token for password reset

#### 3. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:

```json
{
	"token": "...",
	"password": "NewPassword123",
	"confirmPassword": "NewPassword123"
}
```

**Response**:

```json
{
	"message": "Password has been reset successfully"
}
```

**Features**:

- Validates token and expiration
- Enforces password requirements
- Updates password and deletes used token in transaction
- Prevents token reuse

## User Flow

### Reset Link Flow

1. User clicks "Forgot Password?" on login page
2. User enters email and selects "Email Link" tab
3. System sends email with reset link
4. User clicks link in email
5. User is redirected to reset password page with token
6. User enters new password with real-time validation
7. Password is reset and user is redirected to login

### OTP Flow

1. User clicks "Forgot Password?" on login page
2. User enters email and selects "OTP Code" tab
3. System sends email with 6-digit OTP
4. User enters OTP in the form
5. System verifies OTP and returns token
6. User is redirected to reset password page
7. User enters new password with real-time validation
8. Password is reset and user is redirected to login

## Pages & Components

### Pages

1. **`/forgot-password`**: Main forgot password page
   - Tabbed interface for Link/OTP selection
   - Email input form
   - OTP verification form (shown after OTP is sent)

2. **`/reset-password`**: Password reset page
   - Accepts token as query parameter
   - New password input with strength indicator
   - Confirm password input
   - Success state with auto-redirect

### Components

1. **`ForgotPasswordForm`** (`components/auth/forgot-password-form.tsx`)
   - Tabbed interface (Link/OTP)
   - Email input and validation
   - OTP input (6-digit, numeric only)
   - Loading states and error handling
   - Success messages

2. **`ResetPasswordForm`** (`components/auth/reset-password-form.tsx`)
   - Password strength indicator
   - Real-time validation feedback
   - Show/hide password toggles
   - Success state with redirect
   - Token validation

3. **Updated `LoginForm`**
   - Added "Forgot Password?" link

## Email Templates

### Password Reset Email (`lib/email/templates/password-reset.ts`)

**Features**:

- Branded design matching store theme
- Different layouts for Link vs OTP
- Clear expiration notices
- Security warnings
- Store contact information
- Both HTML and plain text versions

**Link Email Includes**:

- Prominent reset button
- Fallback link for copy/paste
- 60-minute expiration notice

**OTP Email Includes**:

- Large, centered OTP code
- Monospace font for readability
- 10-minute expiration notice

## Security Features

1. **Email Enumeration Protection**: Always returns success message regardless of email existence
2. **Token Expiration**:
   - Reset links expire in 60 minutes
   - OTPs expire in 10 minutes
3. **Single Use Tokens**: Tokens are deleted after successful password reset
4. **Old Token Cleanup**: New reset requests delete existing tokens
5. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
6. **Secure Token Generation**: Uses crypto.randomBytes for token generation
7. **Password Hashing**: Uses bcrypt with 10 salt rounds

## Password Requirements

The system enforces the following password requirements:

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

Real-time validation feedback shows users which requirements are met.

## Configuration

### Environment Variables

Add to `.env`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Used for reset link generation
```

### Email Configuration

The system uses the existing email infrastructure. Ensure email provider is configured in `.env`:

```env
EMAIL_PROVIDER=NODEMAILER  # or SENDGRID, RESEND, AMAZON_SES
EMAIL_FROM=noreply@yourstore.com

# Provider-specific credentials
# See EMAIL_SETUP_GUIDE.md for details
```

## Testing

### Development Mode

In development, the API returns tokens and OTPs in the response for testing:

```json
{
	"message": "...",
	"token": "abc123...",
	"otp": "123456"
}
```

### Test Flow

1. Navigate to `/forgot-password`
2. Enter a valid user email
3. Choose Link or OTP method
4. Check console/response for token/OTP (dev mode)
5. For Link: Navigate to `/reset-password?token=<token>`
6. For OTP: Enter the OTP code
7. Set new password
8. Verify login with new password

## Database Migration

The feature includes a database migration:

```bash
npx prisma migrate deploy
npx prisma generate
```

Migration adds:

- `otp` column to `password_reset_tokens` table
- `type` column with enum type
- Index on `otp` column
- `ResetType` enum

## Error Handling

The implementation includes comprehensive error handling:

1. **Invalid Email**: Validation error with user-friendly message
2. **Invalid OTP**: Clear error message without exposing security details
3. **Expired Token/OTP**: Automatic cleanup and clear error message
4. **Password Mismatch**: Real-time validation feedback
5. **Weak Password**: Real-time strength indicator
6. **Email Send Failure**: Logged but doesn't expose to user (security)
7. **Network Errors**: User-friendly error messages with toast notifications

## UI/UX Features

1. **Tabbed Interface**: Easy switching between Link and OTP methods
2. **Loading States**: Spinners during API calls
3. **Disabled States**: Buttons disabled during processing
4. **Success Messages**: Clear feedback for each step
5. **Error Messages**: Contextual error alerts
6. **Password Visibility Toggle**: Show/hide password buttons
7. **Real-time Validation**: Immediate feedback on password requirements
8. **Auto-redirect**: Automatic redirect to login after successful reset
9. **Back Navigation**: Easy navigation back to login or previous step
10. **Responsive Design**: Works on all screen sizes

## Future Enhancements

Potential improvements for future versions:

1. **Rate Limiting**: Limit reset requests per email/IP
2. **SMS OTP**: Alternative OTP delivery via SMS
3. **2FA Integration**: Require 2FA for password reset
4. **Password History**: Prevent reuse of recent passwords
5. **Account Lockout**: Lock account after multiple failed attempts
6. **Audit Logging**: Log all password reset attempts
7. **Custom Expiration**: Allow admins to configure expiration times
8. **Multi-language Support**: Internationalized emails and UI

## Troubleshooting

### Emails Not Sending

1. Check email provider configuration in `.env`
2. Verify email credentials are correct
3. Check email provider logs
4. Ensure `EMAIL_FROM` is a verified sender

### Token/OTP Not Working

1. Check token hasn't expired
2. Verify database migration was applied
3. Check for clock skew between server and database
4. Ensure Prisma client was regenerated

### UI Issues

1. Verify all components are imported correctly
2. Check for TypeScript errors
3. Ensure Tailwind classes are available
4. Check browser console for errors

## Related Files

- `prisma/schema.prisma` - Database schema
- `lib/auth/password.ts` - Password utilities
- `lib/validations/password-reset.schema.ts` - Validation schemas
- `lib/email/templates/password-reset.ts` - Email template
- `lib/email/types.ts` - Email type definitions
- `lib/email/index.ts` - Email service
- `app/api/auth/request-reset/route.ts` - Request reset API
- `app/api/auth/verify-otp/route.ts` - Verify OTP API
- `app/api/auth/reset-password/route.ts` - Reset password API
- `app/forgot-password/page.tsx` - Forgot password page
- `app/reset-password/page.tsx` - Reset password page
- `components/auth/forgot-password-form.tsx` - Forgot password form
- `components/auth/reset-password-form.tsx` - Reset password form
- `components/auth/login-form.tsx` - Updated login form
