# Authentication API

All endpoints are under `/api/auth/`. JWT tokens are stored in the HTTP-only cookie `auth-token` (24-hour expiry).

## Endpoints

### `POST /api/auth/login`
Authenticate and start a session.

```json
// Request
{ "email": "user@example.com", "password": "password123" }

// 200 Response
{ "user": { "id": "...", "email": "...", "username": "...", "name": "...", "roles": ["CASHIER"], "shift": "MORNING", "status": "ACTIVE", "createdAt": "...", "updatedAt": "..." } }
```
Errors: `400` invalid input · `401` invalid credentials · `403` user blocked

---

### `POST /api/auth/logout`
Invalidate session and clear cookie. Requires auth cookie.

```json
// 200 Response
{ "message": "Logout successful" }
```

---

### `GET /api/auth/me`
Return the current user. Requires auth cookie.

```json
// 200 Response
{ "user": { /* same shape as login response */ } }
```
Errors: `401` not authenticated · `404` user not found

---

### `POST /api/auth/request-reset`
Request a password reset. Public — always returns success to prevent email enumeration.

```json
// Request
{ "email": "user@example.com", "type": "LINK" }  // type: "LINK" | "OTP", defaults to "LINK"

// 200 Response
{ "message": "If an account with that email exists, a reset has been sent." }
// Development only: also returns { "token": "...", "otp": "..." }
```

- **LINK** tokens expire in 60 minutes
- **OTP** codes expire in 10 minutes
- Sending a new request deletes any existing token for that user

---

### `POST /api/auth/verify-otp`
Verify an OTP code and exchange it for a reset token.

```json
// Request
{ "email": "user@example.com", "otp": "123456" }

// 200 Response
{ "message": "OTP verified", "token": "..." }
```
Errors: `400` invalid/expired OTP

---

### `POST /api/auth/reset-password`
Set a new password using a valid reset token.

```json
// Request
{ "token": "...", "password": "NewPass123", "confirmPassword": "NewPass123" }

// 200 Response
{ "message": "Password has been reset successfully" }
```
Errors: `400` validation failed · `400` invalid/expired token

**Password requirements:** min 8 chars · 1 uppercase · 1 lowercase · 1 number

---

### `POST /api/auth/change-password`
Change password while authenticated (requires current password). Requires auth cookie.

---

## Security Notes

- Tokens stored in HTTP-only, `SameSite=Strict` cookies → resistant to XSS and CSRF
- Every request validates both the JWT signature and a live DB session record
- Passwords hashed with bcrypt (10 rounds)
- Reset tokens are single-use and deleted on consumption
- BLOCKED users are rejected at `requireAuth` middleware before any route logic runs

## cURL Examples

```bash
# Login and save cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@pos.com","password":"password123"}' \
  -c cookies.txt

# Use saved cookie
curl http://localhost:3000/api/auth/me -b cookies.txt

# Request OTP reset
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","type":"OTP"}'
```
