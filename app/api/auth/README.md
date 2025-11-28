# Authentication API Endpoints

This directory contains the authentication API routes for the POS system.

## Endpoints

### POST /api/auth/login

Authenticate a user and create a session.

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

**Success Response (200):**

```json
{
	"user": {
		"id": "user-id",
		"email": "user@example.com",
		"username": "username",
		"name": "User Name",
		"roles": ["CASHIER"],
		"shift": "MORNING",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	},
	"message": "Login successful"
}
```

**Error Responses:**

- 400: Invalid input data
- 401: Invalid credentials

**Side Effects:**

- Creates a session in the database
- Sets an HTTP-only cookie named `auth-token`

---

### POST /api/auth/logout

Logout the current user and invalidate their session.

**Request:**

- Requires `auth-token` cookie

**Success Response (200):**

```json
{
	"message": "Logout successful"
}
```

**Error Responses:**

- 400: No active session found

**Side Effects:**

- Deletes the session from the database
- Clears the `auth-token` cookie

---

### GET /api/auth/me

Get the current authenticated user's information.

**Request:**

- Requires `auth-token` cookie

**Success Response (200):**

```json
{
	"user": {
		"id": "user-id",
		"email": "user@example.com",
		"username": "username",
		"name": "User Name",
		"roles": ["CASHIER"],
		"shift": "MORNING",
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

**Error Responses:**

- 401: Authentication required / Invalid or expired token / Session not found
- 404: User not found

---

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt
```

### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Security Features

- **HTTP-only cookies**: Tokens are stored in HTTP-only cookies to prevent XSS attacks
- **Secure flag**: Cookies are marked as secure in production (HTTPS only)
- **SameSite=Strict**: Prevents CSRF attacks
- **Password hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **Session validation**: Every request validates both JWT and database session
- **Token expiration**: Tokens expire after 24 hours

## Implementation Details

- Uses JWT for token generation and verification
- Stores sessions in PostgreSQL database
- Validates user credentials using bcrypt
- Excludes password hashes from all responses
- Implements proper error handling with consistent error format
