# Backend API Contract

This document outlines the API contract for the Antick Async Microservices.

## Gateway (Port 80)
All requests from the frontend should be routed through the Nginx Gateway.

- **`/auth/*`** → Routes to Auth Service (strips `/auth` prefix before forwarding).
- **`/items/*`** → Routes to Item Service.

---

## 1. Auth Service

### 1.1 POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@student.itk.ac.id",
  "name": "Aidil Saputra",
  "password": "StrongPassword123!"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "user@student.itk.ac.id",
    "name": "Aidil Saputra",
    "role": "employee",
    "status": "pending",
    "is_active": true
  },
  "message": "Registrasi berhasil. Akun Anda menunggu persetujuan admin."
}
```

### 1.2 POST `/auth/login`
Authenticate user and obtain JWT token.

**Request Body (Form Data):**
- `username`: email
- `password`: password

**Response (200 OK):**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": { ... },
  "detail": "Login berhasil."
}
```

---

## 2. Item Service

### 2.1 POST `/items`
Create a new item. Requires Authorization Header (`Bearer <token>`).

**Request Body:**
```json
{
  "name": "Monitor Dell 24 inch",
  "description": "Monitor untuk keperluan IT",
  "price": 3000000.0,
  "quantity": 5
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Monitor Dell 24 inch",
  "description": "Monitor untuk keperluan IT",
  "price": 3000000.0,
  "quantity": 5,
  "owner_id": 1,
  "created_at": "2026-06-11T00:00:00Z"
}
```

### 2.2 GET `/items`
List all items owned by the authenticated user.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Monitor Dell 24 inch",
    "price": 3000000.0,
    "quantity": 5
  }
]
```

### HTTP Status Codes
- `200 OK`: Request successful.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or business rule violation.
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: User lacks permission to access the resource.
- `404 Not Found`: Resource does not exist.
- `422 Unprocessable Entity`: Schema validation failed.
- `429 Too Many Requests`: Rate limit exceeded (Handled by Nginx).
