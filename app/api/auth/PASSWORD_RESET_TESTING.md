# Password Reset API Testing Guide

This guide shows how to test the password reset functionality.

## Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/request-reset`

**Request Body:**

```json
{
	"email": "user@example.com"
}
```

**Success Response (200):**

```json
{
	"message": "If an account with that email exists, a password reset link has been sent.",
	"token": "abc123..." // Only in development mode
}
```

**Validation Error (400):**

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [...]
  }
}
```

### 2. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
	"token": "abc123...",
	"password": "NewPassword123",
	"confirmPassword": "NewPassword123"
}
```

**Success Response (200):**

```json
{
	"message": "Password has been reset successfully"
}
```

**Invalid Token Error (400):**

```json
{
	"error": {
		"message": "Invalid or expired reset token",
		"code": "INVALID_TOKEN"
	}
}
```

**Validation Error (400):**

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [...]
  }
}
```

## Testing with cURL

### Step 1: Request a password reset

```bash
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

In development mode, this will return a token in the response. Copy this token for the next step.

### Step 2: Reset the password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "password": "NewPassword123",
    "confirmPassword": "NewPassword123"
  }'
```

## Password Requirements

- Minimum 8 characters
- Maximum 100 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number

## Security Features

1. **Email Enumeration Prevention**: The request-reset endpoint always returns success, even if the email doesn't exist
2. **Token Expiration**: Reset tokens expire after 1 hour
3. **Single Use Tokens**: Tokens are deleted after successful password reset
4. **Secure Token Generation**: Uses crypto.randomBytes for cryptographically secure tokens
5. **Password Hashing**: New passwords are hashed with bcrypt before storage
6. **Transaction Safety**: Password update and token deletion happen atomically

## Requirements Validated

- ✅ **Requirement 12.1**: Generate unique token with 1-hour expiration
- ✅ **Requirement 12.2**: Verify token exists and not expired
- ✅ **Requirement 12.3**: Hash new password and update user
- ✅ **Requirement 12.4**: Delete used token to prevent reuse
