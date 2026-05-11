# API Route Map - FastFood Backend

**Backend Location:** `D:\CNPM\CCNLTHD\backend`  
**Backend Port:** 5000  
**Next.js Proxy:** http://localhost:3000/api/proxy/[route]  
**Direct Backend:** http://localhost:5000/api/[route]

---

## Overview

The backend has these route prefixes mounted on the Express app:

```
/api/users        (user management)
/api/auth         (authentication)
/api/cart         (shopping cart)
/api/orders       (order management)
/api/products     (product catalog)
/api/stores       (store management)
/api/payments     (payment processing)
/api/statistics   (analytics)
/api/dashboard    (store dashboard)
/api/zalopay      (Zalopay payment)
/api/address      (address management)
/api/geocode      (geocoding)
/api/drone-delivery (drone tracking)
/api/menu         (menu items)
```

---

## Complete Route Reference

### Authentication Routes

**File:** `src/routes/auth.route.js`  
**Mounted at:** `/api/auth`

| Endpoint | Method | Purpose | Frontend Page | Used? |
|----------|--------|---------|---------------|-------|
| `/api/auth/register` | POST | User registration | Login page | ✅ Yes |
| `/api/auth/login` | POST | User login | Login page | ✅ Yes |

**Request Example:**
```javascript
POST /api/proxy/auth/login
{
  "email": "test@test.com",
  "password": "123456"
}
```

---

### User Routes

**File:** `src/routes/user.route.js`  
**Mounted at:** `/api/users`

| Endpoint | Method | Purpose | Frontend Page | Note |
|----------|--------|---------|---------------|------|
| `/api/users` | GET | List all users | Admin page | ❌ Not used in frontend |
| `/api/users/login` | POST | User login | (alternative endpoint) | ⚠️ Duplicate of /api/auth/login |
| `/api/users` | POST | Register user | Register page | ⚠️ Also at /api/auth/register |
| `/api/users/admin` | POST | Admin create user | Admin dashboard | ❌ Not used |
| `/api/users/:id` | PUT | Update user | Profile page | ✅ For profile updates |
| `/api/users/:id` | DELETE | Delete user | Admin page | ❌ Not used |

**Request Examples:**
```javascript
// Login (via /api/users - alternative)
POST /api/proxy/users/login
{ "email": "test@test.com", "password": "123456" }

// Update user
PUT /api/proxy/users/5
{ "phone": "0123456789", "address": "123 Main St" }
```

---

### Cart Routes

**File:** `src/routes/cart.route.js`  
**Mounted at:** `/api/cart`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/cart/:userId` | GET | Get cart by cart ID | Cart page | ⚠️ Confusing endpoint |
| `/api/cart/user/:userId` | GET | Get cart by user ID | Cart page | ✅ Correct one to use |
| `/api/cart/add` | POST | Add item to cart | Cart, Products | ✅ Yes |
| `/api/cart/update/:id` | PUT | Update cart item qty | Cart page | ✅ Yes |
| `/api/cart/remove/:id` | DELETE | Remove item from cart | Cart page | ✅ Yes |

**Request Examples:**
```javascript
// Get user's cart
GET /api/proxy/cart/user/5

// Add to cart
POST /api/proxy/cart/add
{
  "userId": 5,
  "productId": 10,
  "quantity": 2
}

// Update quantity
PUT /api/proxy/cart/update/23
{ "quantity": 3 }

// Remove from cart
DELETE /api/proxy/cart/remove/23
```

---

### Product Routes

**File:** `src/routes/product.route.js`  
**Mounted at:** `/api/products`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/products` | GET | List all products | Home page (SSR) | ✅ Yes |
| `/api/products/:id` | GET | Get product detail | Product detail (SSR) | ✅ Yes |
| `/api/products/store/:storeId` | GET | Get store's products (private) | Dashboard | ✅ Yes |
| `/api/products/store/:storeId/public` | GET | Get store's products (public) | Store detail (SSR) | ✅ Yes |
| `/api/products` | POST | Create product | Dashboard | ⚠️ Admin only |
| `/api/products/:id` | PUT | Update product | Dashboard | ⚠️ Admin only |
| `/api/products/:id` | DELETE | Delete product | Dashboard | ⚠️ Admin only |

**Request Examples:**
```javascript
// Get all products
GET /api/proxy/products

// Get product detail
GET /api/proxy/products/10

// Get products for store (by storeId)
GET /api/proxy/products/store/3/public

// Get dashboard products (for store owner)
GET /api/proxy/products/store/3
```

---

### Store Routes

**File:** `src/routes/store.route.js`  
**Mounted at:** `/api/stores`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/stores` | GET | List all stores | Home page (SSR) | ✅ Yes |
| `/api/stores/:id` | GET | Get store detail | Store detail (SSR) | ✅ Yes |
| `/api/stores` | POST | Create store | (Admin) | ⚠️ Not in frontend |
| `/api/stores/:id` | PUT | Update store | Dashboard | ⚠️ Admin only |
| `/api/stores/:id` | DELETE | Delete store | (Admin) | ❌ Not in frontend |

**Request Examples:**
```javascript
// Get all stores
GET /api/proxy/stores

// Get store detail
GET /api/proxy/stores/3
```

---

### Order Routes

**File:** `src/routes/order.routes.js`  
**Mounted at:** `/api/orders`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/orders` | POST | Create new order | Checkout page | ✅ Yes |
| `/api/orders` | GET | List all orders | (Admin) | ❌ Not used |
| `/api/orders/user/:id` | GET | Get user's orders | My Orders page | ✅ Yes |
| `/api/orders/:id` | GET | (Implied) Get order detail | Order tracking | ⚠️ Check controller |
| `/api/orders/:id/detail` | GET | Get order detail | Order tracking | ✅ Yes |
| `/api/orders/:id` | PUT | Update order status | (Admin/System) | ⚠️ For status updates |

**Request Examples:**
```javascript
// Create order
POST /api/proxy/orders
{
  "userId": 5,
  "items": [{ "productId": 10, "quantity": 2 }],
  "deliveryAddress": "123 Main St",
  "totalPrice": 150000
}

// Get user's orders
GET /api/proxy/orders/user/5

// Get order detail
GET /api/proxy/orders/123/detail

// Update order status
PUT /api/proxy/orders/123
{ "status": "completed" }
```

---

### Payment Routes

**File:** `src/routes/payment.routes.js`  
**Mounted at:** `/api/payments`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/payments` | POST | Create payment | Checkout page | ✅ Yes |
| `/api/payments` | GET | List payments | (Admin) | ❌ Not used |
| `/api/payments/:id` | GET | Get payment detail | (Admin) | ⚠️ Not used |
| `/api/payments/:id` | PUT | Update payment | (System) | ⚠️ For updates |

**Request Examples:**
```javascript
// Create payment
POST /api/proxy/payments
{
  "orderId": 123,
  "userId": 5,
  "amount": 150000,
  "paymentMethod": "credit_card"
}
```

---

### Zalopay Routes

**File:** `src/routes/zalopay.route.js`  
**Mounted at:** `/api/zalopay`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| (Check zalopay.route.js) | ? | Zalopay integration | Payment test page | ✅ Used |

---

### Address Routes

**File:** `src/routes/address.routes.js`  
**Mounted at:** `/api/address`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/address` | GET | Get user addresses | Checkout page | ✅ Yes |
| `/api/address/:userId` | GET | Get user's addresses | Checkout page | ✅ Yes |
| `/api/address` | POST | Create new address | Checkout page | ✅ Yes |
| `/api/address/:id` | PUT | Update address | Checkout page | ✅ Yes |
| `/api/address/:id` | DELETE | Delete address | Checkout page | ✅ Yes |

**Request Examples:**
```javascript
// Get user addresses
GET /api/proxy/address

// Create address
POST /api/proxy/address
{
  "userId": 5,
  "street": "123 Main St",
  "city": "Hanoi",
  "lat": 21.0285,
  "lng": 105.8542
}

// Update address
PUT /api/proxy/address/7
{ "street": "456 New St" }

// Delete address
DELETE /api/proxy/address/7
```

---

### Drone Delivery Routes

**File:** `src/routes/droneDeliveryRoutes.js`  
**Mounted at:** `/api/drone-delivery` and `/api`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| (Check droneDeliveryRoutes.js) | ? | Drone tracking | My Orders page | ✅ Used |

---

### Dashboard Routes

**File:** `src/routes/dashboard.route.js`  
**Mounted at:** `/api/dashboard`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| `/api/dashboard` | GET | Get dashboard data | Dashboard page | ✅ Yes |
| (Check file for more) | ? | Store analytics | Dashboard page | ✅ Used |

**Request Examples:**
```javascript
// Get dashboard
GET /api/proxy/dashboard
```

---

### Statistics Routes

**File:** `src/routes/statistics.routes.js`  
**Mounted at:** `/api/statistics`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| (Check statistics.routes.js) | ? | Analytics data | Dashboard | ✅ Used |

---

### Geocode Routes

**File:** `src/routes/geocode.js`  
**Mounted at:** `/api/geocode`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| (Check geocode.js) | ? | Location mapping | Checkout (map) | ✅ Used |

---

### Menu Routes

**File:** `src/routes/menu.route.js`  
**Mounted at:** `/api`

| Endpoint | Method | Purpose | Frontend Page | Status |
|----------|--------|---------|---------------|--------|
| (Check menu.route.js) | ? | Menu items | (Unknown) | ⚠️ Check usage |

---

## Proxy Routing

### How Requests Flow

When the Next.js frontend makes a request to `/api/proxy/products/10`:

```
Browser                          Next.js Proxy              Express Backend
─────────────────────────────────────────────────────────────────────────
GET /api/proxy/products/10
                                 ↓
                          Extract path: products/10
                                 ↓
                          Construct backend URL:
                          http://localhost:5000/products/10
                                 ↓
                          Forward request
                                 ↓ (receives data)
                                 ↓
                          Return to browser
```

### Environment Configuration

**Next.js (.env.local):**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

**Express Backend (.env):**
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234567
DB_NAME=fastfood_drone_db
```

---

## Frontend Fetch Patterns

### CSR Pages (Browser Fetch)

```javascript
// In browser, use the proxy
fetch("/api/proxy/products")  // Goes through proxy
fetch("/api/proxy/orders/user/5")

// Do NOT call backend directly
// ❌ fetch("http://localhost:5000/api/products")
```

### SSR Pages (Server-Side)

```typescript
// On server, can call backend directly OR through proxy
const res = await fetch("http://localhost:5000/api/products", {
  next: { revalidate: 60 }
});
```

---

## Quick Reference by Frontend Page

| Frontend Page | Route Used | Backend Endpoint | Method |
|---------------|-----------|------------------|--------|
| `/` (Login) | /api/proxy/auth/login | POST /api/auth/login | CSR |
| `/register` | /api/proxy/auth/register | POST /api/auth/register | CSR |
| `/home` | Direct (SSR) | GET /api/products, GET /api/stores | SSR |
| `/product/[id]` | Direct (SSR) | GET /api/products/:id, GET /api/products/store/:storeId/public | SSR |
| `/store/[id]` | Direct (SSR) | GET /api/stores/:id, GET /api/products/store/:storeId/public | SSR |
| `/cart` | /api/proxy/cart/user/:userId | GET, POST, PUT, DELETE /api/cart/* | CSR |
| `/checkout` | /api/proxy/* | POST /api/orders, POST /api/payments, /api/address/* | CSR |
| `/my-orders` | /api/proxy/orders/user/:userId | GET /api/orders/user/:userId | CSR |
| `/dashboard` | /api/proxy/dashboard | GET /api/dashboard | CSR |
| `/zalopay-test` | /api/proxy/zalopay/* | (See zalopay routes) | CSR |

---

## Notes

1. **Route Duplication**: Auth has two endpoints:
   - `/api/auth/register` and `/api/auth/login` (use these)
   - `/api/users/register` and `/api/users/login` (duplicate, avoid)

2. **Confusing Cart Routes**:
   - `/api/cart/:userId` (confusing - takes cart ID not user ID)
   - `/api/cart/user/:userId` (correct - takes user ID)
   - Use the second one!

3. **Port Configuration**:
   - Backend: port 5000 (configured in .env)
   - Next.js frontend: port 3000 (default)
   - Do NOT run both on port 3000 or they'll conflict!

4. **CORS**: Already enabled in backend, no CORS issues

5. **API Proxy Benefits**:
   - Single origin (no CORS issues)
   - Can add authentication middleware
   - Can cache responses
   - Can add rate limiting
   - Can add request logging
   - Can transform requests/responses

---

## Testing Routes

### Using curl

```bash
# Get all products
curl http://localhost:5000/api/products

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get stores
curl http://localhost:5000/api/stores

# Get user's cart (assuming userId=5)
curl http://localhost:5000/api/cart/user/5
```

### Using Postman

Import these endpoints into Postman for testing:
- POST http://localhost:5000/api/auth/login
- GET http://localhost:5000/api/products
- GET http://localhost:5000/api/stores
- GET http://localhost:5000/api/cart/user/5
- (etc.)

---

**Last Updated:** May 10, 2026  
**Backend Version:** Express.js with Sequelize ORM  
**Database:** MySQL (fastfood_drone_db)
