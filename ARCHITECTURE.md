# Technical Architecture & Implementation

## System Architecture

### Overview Diagram

```
                        LAN Network (192.168.x.x)
        ┌──────────────────────────────────────────────────┐
        │                                                  │
    ┌───▼──────┐      ┌──────────────┐      ┌────────────┐
    │ Client 1 │      │  Client 2    │      │  Client N  │
    │ Browser  │      │  Browser     │      │  Browser   │
    └───┬──────┘      └──────┬───────┘      └─────┬──────┘
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              │ HTTP Port 80
                        ┌─────▼─────────┐
                        │    Nginx      │
                        │  Reverse      │
                        │   Proxy       │
                        └──┬──────────┬─┘
                           │          │
                 Port 80    │          │ Port 3001
                   (React)  │          │ (API)
                     ┌──────▼──┐   ┌──▼──────┐
                     │  React  │   │ Node.js │
                     │ dist/   │   │ Express │
                     │ files   │   │ Server  │
                     └─────────┘   └──┬──────┘
                                      │
                                   ┌──▼──────────┐
                                   │   SQLite    │
                                   │  Database   │
                                   │  inventory  │
                                   │    .db      │
                                   └─────────────┘
```

## Backend Architecture

### Request Flow

```
Client HTTP Request
       │
       ▼
    Nginx
  (Reverse Proxy)
       │
       ▼
Express.js Server
       │
  ┌────┴──────────────┬─────────────────┬──────────────┐
  │                   │                 │              │
  ▼                   ▼                 ▼              ▼
CORS & Security  Authentication    Audit Logging   Validation
Headers         Middleware         Middleware      (express-validator)
  │                   │                 │              │
  └───────────────────┴─────────────────┴──────────────┘
                      │
                      ▼
                 Route Handler
              (Express.js Route)
                      │
                      ▼
             Controller Function
              (Business Logic)
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
      Service                  Audit Log
    (Query/Update             (Record Action)
     Database)                    │
         │                        │
         └────────────┬───────────┘
                      │
                      ▼
                  Response JSON
                      │
                      ▼
                Client Browser
```

### Middleware Stack (in order)

1. **helmet()** - Security headers
2. **cors()** - CORS validation
3. **express.json()** - Body parsing
4. **morgan()** - HTTP logging
5. **auditMiddleware()** - Audit trail setup
6. **authenticateToken()** - JWT validation (on protected routes)
7. **requireRole()** - Role-based access (on protected routes)

### Database Connection Pool

SQLite doesn't support connection pooling like PostgreSQL, so:
- Single persistent connection maintained
- Concurrent requests queued by SQLite
- WAL mode enables better concurrency
- Each request gets transaction safety

### Request Validation

```
Input Data
    │
    ▼
express-validator
    │
┌───┴──────────────────┐
│                      │
Valid            Invalid
│                  │
│                  ▼
│           Error Response
│           (400 status)
│
▼
Sanitization
(trim, etc)
│
▼
Database Query
```

## Frontend Architecture

### React Component Hierarchy

```
App (Router Setup)
│
├── AuthProvider (Context)
│   │
│   └── LoginPage
│       └── Form
│
├── ProtectedRoute
│   │
│   └── AppLayout
│       ├── Header
│       │   └── User Info
│       ├── Sidebar
│       │   └── Navigation Links
│       └── Main Content
│           ├── DashboardPage
│           ├── ProductsPage
│           │   └── ProductForm
│           ├── StockPage
│           ├── CategoriesPage
│           ├── SuppliersPage
│           └── ReportsPage
```

### Authentication Flow

```
1. User enters credentials
   └─> LoginPage component
       └─> calls authApi.login()

2. API sends JWT & refresh token
   └─> AuthContext stores in localStorage
       └─> useAuth() hook provides to components

3. Auto-attach token to requests
   └─> axios interceptor adds Authorization header
       └─> Backend validates token in middleware

4. Token expiration handling
   └─> 401 response triggers refresh
       └─> Use refresh token to get new access token
       └─> Retry original request
       └─> If refresh fails, redirect to login

5. Logout
   └─> Clear localStorage
       └─> useAuth() returns isAuthenticated: false
       └─> Redirect to login
```

### State Management

```
Global State (AuthContext)
├── user
│   ├── id
│   ├── username
│   ├── email
│   ├── role
│   └── full_name
├── isAuthenticated
├── isLoading
└── error

Local State (Component-level)
├── formData (controlled inputs)
├── isSubmitting
├── error
└── success
```

### API Service Architecture

```
api/
├── axiosInstance.js
│   ├── Axios configuration
│   ├── Request interceptor (add token)
│   └── Response interceptor (handle 401, refresh)
│
└── services.js
    ├── authApi
    │   ├── login()
    │   ├── logout()
    │   ├── refresh()
    │   ├── getProfile()
    │   └── changePassword()
    ├── usersApi
    ├── productsApi
    ├── categoriesApi
    ├── suppliersApi
    └── stockApi
```

## Database Schema Design

### Entity Relationships

```
Users (1) ──────────────────┐
                            │
                            ├─> many Categories
                            ├─> many Suppliers
                            ├─> many Products
                            ├─> many Stock
                            ├─> many Transactions
                            ├─> many POs
                            ├─> many SOs
                            └─> many Audit Logs

Products (1) ──┬────────────┐
               │            │
               ├─> (1) Category
               ├─> (1) Supplier
               ├─> (1) Stock
               ├─> many Transactions
               ├─> many PO Items
               └─> many SO Items

Stock (1) ─────┬────────────┐
               │            │
               ├─> (1) Product
               └─> many Transactions

Purchase Orders (1) ───── many PO Items
                            │
                            └─> (1) Product

Sales Orders (1) ──────── many SO Items
                            │
                            └─> (1) Product
```

### Transaction Handling

Stock updates use transactions to prevent race conditions:

```sql
BEGIN TRANSACTION;

-- Lock the row
SELECT * FROM stock WHERE product_id = ? FOR UPDATE;

-- Record transaction
INSERT INTO stock_transactions (...) VALUES (...);

-- Update stock
UPDATE stock 
SET quantity_on_hand = quantity_on_hand + ?
WHERE product_id = ?;

COMMIT;
```

## Security Implementation

### Authentication Flow

```
1. Login Request
   └─> Hash password with bcryptjs
       └─> Compare with stored hash
       └─> Generate JWT if match

2. JWT Structure
   └─> Header: {alg: "HS256", typ: "JWT"}
   └─> Payload: {id, username, email, role, iat, exp}
   └─> Signature: HMAC-SHA256(header + payload + secret)

3. Token Validation
   └─> Extract token from Authorization header
   └─> Verify signature with JWT_SECRET
   └─> Check expiration time
   └─> Attach user data to request

4. Role-Based Access
   └─> Middleware checks req.user.role
   └─> Compare against required roles array
   └─> Return 403 if unauthorized
```

### CORS Configuration

```
Allowed Origins (from .env):
└─> http://192.168.1.100
└─> http://192.168.1.101
└─> etc.

Allowed Methods:
└─> GET, POST, PUT, DELETE, OPTIONS

Allowed Headers:
└─> Content-Type
└─> Authorization

Credentials:
└─> false (stateless JWT)
```

### Input Validation & Sanitization

```
express-validator rules:

1. Existence checks
   └─> body('field').notEmpty()

2. Type checks
   └─> body('email').isEmail()
   └─> body('quantity').isInt()

3. Length checks
   └─> body('password').isLength({min: 6})

4. Custom validators
   └─> body('sku').matches(/^[A-Z0-9-]+$/)

5. Sanitization
   └─> body('username').trim().toLowerCase()

Error Response:
└─> 400 Bad Request
└─> {error: "Validation failed", details: [...]}
```

### Audit Logging

```
Every mutation logged:

logAudit(
  userId,           // Who did it
  action,           // CREATE|UPDATE|DELETE|STOCK_IN|etc
  entityType,       // Product|User|etc
  entityId,         // ID of affected entity
  oldValues,        // Previous state (JSON)
  newValues,        // New state (JSON)
  request           // IP, user agent
)

Query example:
SELECT * FROM audit_logs
WHERE user_id = ? AND created_at > ?
ORDER BY created_at DESC
```

## Performance Optimizations

### Database Indexes

```
Key indexes for common queries:

users
├─> username (unique, fast lookup)
└─> email (unique lookup)

products
├─> category_id (filtering by category)
├─> supplier_id (filtering by supplier)
└─> sku (unique, fast lookup)

stock
└─> product_id (unique, fast lookup)

stock_transactions
├─> product_id (history by product)
└─> created_at (range queries)

audit_logs
├─> user_id (user activity)
├─> created_at (recent first)
└─> entity_type + entity_id (specific entities)
```

### Query Optimization

```
Good:
SELECT * FROM products WHERE category_id = ?  (uses index)
SELECT * FROM stock WHERE product_id IN (?, ?, ?) (indexed)

Avoid:
SELECT * FROM products WHERE LOWER(name) LIKE '%text%'  (no index)
SELECT * FROM transactions WHERE JSON_EXTRACT(data, '$.field') = ?
SELECT * FROM stock WHERE quantity_on_hand > 0 (can't use index well)
```

### Frontend Performance

1. **Code Splitting**
   - React router lazy loading
   - Dynamic imports for components
   - Separate vendor chunks

2. **Caching**
   - Static assets cached by Nginx (1 year)
   - HTML not cached (must-revalidate)
   - API responses: no caching (real-time)

3. **Lazy Loading**
   - Images lazy load
   - Components load on demand

### Scaling Considerations

For more users (100+):

1. **Database**: Consider PostgreSQL
   - Better concurrency
   - Replication support
   - Connection pooling

2. **Backend**: 
   - Run multiple instances with PM2
   - Load balance with Nginx/HAProxy
   - Cache frequently accessed data (Redis)

3. **Frontend**:
   - CDN for static files
   - Service worker for offline support
   - Reduce bundle size

## Error Handling

### Backend Error Flow

```
Try Block
├─> If validation fails
│   └─> Return 400 with details
├─> If resource not found
│   └─> Return 404
├─> If unauthorized
│   └─> Return 403
├─> If permission denied
│   └─> Return 401
└─> If server error
    └─> Return 500, log error

Response Format:
{
  "error": "Human readable message",
  "details": [...]  // validation errors
}
```

### Frontend Error Handling

```
API Call
├─> Success (2xx)
│   └─> Update UI
├─> Client Error (4xx)
│   └─> Show error message
│   └─> Keep form open for retry
├─> Server Error (5xx)
│   └─> Show generic error
│   └─> Suggest retry
└─> Network Error
    └─> Show connection error
    └─> Queue for retry
```

## Deployment Considerations

### Environment Configuration

```
Development (.env)
├─> NODE_ENV=development
├─> DEBUG=true
├─> ALLOWED_ORIGINS=localhost:*
└─> Database=./data/dev.db

Production (.env)
├─> NODE_ENV=production
├─> DEBUG=false
├─> ALLOWED_ORIGINS=192.168.1.100
└─> Database=./data/inventory.db
```

### Process Management with PM2

```
pm2 start ecosystem.config.js

Manages:
├─> Auto-restart on crash
├─> Cluster mode (2 processes)
├─> Graceful shutdown
├─> Auto-boot on system start
├─> Resource limits
├─> Log rotation
└─> Monitoring
```

### Nginx Configuration

```
Two main purposes:

1. Serve React Static Files
   └─> /  → frontend/dist/index.html
   └─> /js/* → frontend/dist/js/ (cached 1 year)
   └─> /css/* → frontend/dist/css/ (cached 1 year)

2. Reverse Proxy API
   └─> /api/* → http://127.0.0.1:3001/api/*
   └─> Adds headers
   └─> Handles compression
   └─> CORS headers
```

## Maintenance Tasks

### Daily
- Monitor logs for errors
- Check system resources
- Verify backups ran

### Weekly
- Review audit logs
- Check low stock alerts
- Database integrity check

### Monthly
- Performance analysis
- User access review
- Security updates
- Backup restoration test

### Quarterly
- Complete system backup
- Dependencies updates
- Security audit
- Capacity planning

---

This architecture is designed for production local network deployment with emphasis on reliability, security, and ease of administration.
