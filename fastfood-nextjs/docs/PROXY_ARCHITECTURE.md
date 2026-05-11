# Proxy Architecture - NextJS Frontend to Express Backend

Understanding the API gateway pattern and incremental migration architecture.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                         User Browser                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  GET http://localhost:3000                                    │
│  ↓                                                              │
│  Next.js Frontend (SSR + CSR)                                 │
│  ├─ Server renders SSR pages (/home, /product/[id], etc)     │
│  ├─ Client components make API calls                         │
│  └─ All calls go through /api/proxy/* gateway               │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  API Proxy Gateway (Next.js)                                  │
│  File: app/api/proxy/[...path]/route.ts                       │
│                                                                │
│  Request:  GET /api/proxy/products/10                         │
│  ↓                                                              │
│  Extract:  path = "products/10"                               │
│  ↓                                                              │
│  Build:    BACKEND_URL + path = http://localhost:5000/api/products/10 │
│  ↓                                                              │
│  Forward:  GET http://localhost:5000/api/products/10          │
│                                                                │
│  Response: ← Return from backend                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Express Backend (API Server)                                  │
│  Port: 5000                                                    │
│  Database: MySQL (fastfood_drone_db)                           │
│                                                                │
│  Routes:                                                       │
│  /api/products          (product catalog)                      │
│  /api/stores            (store info)                           │
│  /api/orders            (order management)                     │
│  /api/cart              (shopping cart)                        │
│  /api/auth              (authentication)                       │
│  /api/users             (user management)                      │
│  (+ more routes)                                               │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  MySQL Database                                               │
│  Database: fastfood_drone_db                                   │
│  Tables: users, products, orders, carts, etc.                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Why Use an API Proxy?

### Problem Without Proxy

```
Browser                        Express Backend
────────────────────────────────────────────────
GET http://localhost:5000/api/products
                    ↑
         Direct CORS request
         
Problem 1: CORS headers might not be configured
Problem 2: Reveals backend location/port to client
Problem 3: Can't add middleware between frontend and backend
Problem 4: Harder to migrate incrementally
```

### Solution With Proxy

```
Browser                    Next.js Proxy      Express Backend
──────────────────────────────────────────────────────────────
GET /api/proxy/products
                    ↓
           Forward to backend
                    ↓
            Transform/validate
                    ↓
         GET http://localhost:5000/api/products
                           ↓
                      Process request
                           ↓
                  Return response ←
                    ↓
        Add headers, transform if needed
                    ↓
              Return to browser

Benefits:
✅ No CORS issues (same origin)
✅ Backend URL hidden from frontend
✅ Can add authentication middleware
✅ Can add logging/monitoring
✅ Can add caching
✅ Can add rate limiting
✅ Easier incremental migration
✅ Better security
```

---

## Request Flow Examples

### Example 1: Login Flow

**CSR Page: /app/page.tsx**

```typescript
"use client";

async function handleLogin() {
  // Browser makes request to proxy
  const response = await fetch("/api/proxy/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "test@test.com",
      password: "123456"
    })
  });
  
  const user = await response.json();
  localStorage.setItem("user", JSON.stringify(user));
}
```

**Request Path:**

```
Browser
  ↓
  fetch("/api/proxy/auth/login")
  ↓
Next.js Route Handler (app/api/proxy/[...path]/route.ts)
  ├─ Extract path: ["auth", "login"]
  ├─ Join path: "auth/login"
  ├─ Build URL: http://localhost:5000/api/auth/login
  ├─ Forward POST request
  └─ Receive response
  ↓
Browser
  ↓
  Parse JSON
  ↓
  Store in localStorage
```

### Example 2: Product List (SSR)

**SSR Page: /app/home/page.tsx**

```typescript
// Server component (no "use client")

async function fetchProducts() {
  // Server makes request directly to backend
  const response = await fetch(
    "http://localhost:5000/api/products",
    { next: { revalidate: 60 } }
  );
  return response.json();
}

export default async function HomePage() {
  const products = await fetchProducts();
  return (
    <div>
      {products.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

**Request Path:**

```
Server (Build Time + every 60s)
  ↓
  fetch("http://localhost:5000/api/products")
  ↓
Express Backend
  ↓
Query Database
  ↓
Return products list
  ↓
Server renders HTML
  ↓
HTML sent to browser with data already included
```

**Note:** SSR pages can call backend directly because:
- Server has direct access
- No CORS issues (server-to-server)
- Data is pre-rendered into HTML
- Browser receives complete HTML

### Example 3: Shopping Cart (CSR)

**CSR Page: /app/cart/page.tsx**

```typescript
"use client";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    // Browser makes request through proxy
    const userId = getUserIdFromStorage();
    fetch(`/api/proxy/cart/user/${userId}`)
      .then(r => r.json())
      .then(data => setCart(data));
  }, []);

  return cart ? <div>{cart.items.length} items</div> : <p>Loading...</p>;
}
```

**Request Path:**

```
Browser (useEffect on page load)
  ↓
  fetch("/api/proxy/cart/user/5")
  ↓
Next.js Proxy Route
  ├─ Method: GET
  ├─ Path: ["cart", "user", "5"]
  ├─ Build URL: http://localhost:5000/api/cart/user/5
  ├─ Forward with same method/headers
  └─ Return response
  ↓
JavaScript processes data
  ↓
React re-renders component
  ↓
Cart items displayed
```

---

## Proxy Implementation

### Location

File: `D:\CNPM\CCNLTHD\fastfood-nextjs\app\api\proxy\[...path]\route.ts`

### How It Works

```typescript
// 1. Read environment configuration
const BACKEND_BASE_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

// 2. Define handler function
async function forward(request, params) {
  // 3. Extract path from URL
  const path = params.path?.join("/") ?? "";
  // "/api/proxy/products/10" → path = "products/10"
  
  // 4. Get query string
  const search = request.nextUrl.search;
  // "?limit=10" → search = "?limit=10"
  
  // 5. Build target URL
  const targetUrl = `${BACKEND_BASE_URL}/${path}${search}`;
  // http://localhost:5000/products/10?limit=10
  
  // 6. Forward request
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  
  // 7. Return response to browser
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}

// 8. Export handlers for each HTTP method
export async function GET(request, context) {
  return forward(request, await context.params);
}

export async function POST(request, context) {
  return forward(request, await context.params);
}

export async function PUT(request, context) {
  return forward(request, await context.params);
}

export async function DELETE(request, context) {
  return forward(request, await context.params);
}
```

### Configuration

**File: .env.local**

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

The proxy looks for this environment variable in order:
1. `process.env.BACKEND_URL`
2. `process.env.NEXT_PUBLIC_BACKEND_URL`
3. `process.env.VITE_BACKEND_URL`
4. Falls back to `http://localhost:5000`

---

## Incremental Migration Strategy

### Why This Architecture?

The proxy pattern enables **incremental migration** from React (CSR-only) to Next.js (hybrid):

```
Phase 1: React (Original)
├─ Browser: React app
├─ Requests: CSR only
├─ Server: Express backend

Phase 2: Next.js with CSR (Current)
├─ Browser: Next.js frontend with "use client"
├─ Requests: Browser → Proxy → Backend
├─ Server: Express backend + Next.js server
├─ Benefit: Can add SSR gradually

Phase 3: Next.js with Hybrid (Goal)
├─ Browser: Next.js frontend (SSR + CSR)
├─ SSR Pages: Server renders directly to backend
├─ CSR Pages: Browser requests through proxy
├─ Server: Express backend + Next.js server
├─ Benefit: Better SEO + performance
```

### Migration Path

```
Step 1: Run React + Express
    React Frontend (SPA)
         ↓
    Express Backend
         ↓
    MySQL Database

Step 2: Run Next.js CSR + Express
    Next.js (all "use client")
         ↓
    Next.js Proxy
         ↓
    Express Backend
         ↓
    MySQL Database

Step 3: Run Next.js SSR + Express
    Next.js (SSR + CSR)
         ├─ SSR pages → direct to backend
         └─ CSR pages → through proxy
         ↓
    Express Backend
         ↓
    MySQL Database

Step 4: Move backend into Next.js (optional)
    Next.js
         ├─ app/pages (SSR)
         ├─ app/api/db/* (direct DB queries)
         └─ app/api/proxy/* (deprecated)
         ↓
    Next.js Direct DB
         ↓
    MySQL Database
```

### Current Status

We are at **Step 2→3**: Running Next.js with both CSR and SSR pages, with Express backend.

**CSR Pages** (use proxy):
- /app/page.tsx (Login)
- /app/register (Register)
- /app/cart (Shopping Cart)
- /app/checkout (Checkout)
- /app/my-orders (Orders)
- /app/dashboard (Dashboard)

**SSR Pages** (direct to backend):
- /app/home/page.tsx (ISR - Products)
- /app/product/[id]/page.tsx (Dynamic - Product Detail)
- /app/store/[id]/page.tsx (Dynamic - Store Detail)

**Proxy** (shared):
- /app/api/proxy/[...path]/route.ts (All requests go through)

---

## Benefits of Proxy

### 1. No CORS Issues

**Without proxy:**
```javascript
// Browser CORS request
fetch("http://localhost:5000/api/products")
// ❌ CORS error if backend doesn't allow
```

**With proxy:**
```javascript
// Same-origin request (no CORS)
fetch("/api/proxy/products")
// ✅ Works, proxy forwards to backend
```

### 2. Hidden Backend URL

**Without proxy:**
Frontend code shows backend URL:
```javascript
fetch("http://192.168.123.7:5000/api/products")
// Backend IP exposed to client
```

**With proxy:**
Frontend doesn't know backend location:
```javascript
fetch("/api/proxy/products")
// Backend hidden, only proxy URL visible
```

### 3. Centralized Gateway

Add middleware/logic to proxy:

```typescript
// app/api/proxy/[...path]/route.ts

async function forward(request, params) {
  // Log all requests
  console.log(request.method, request.url);
  
  // Add authentication header
  headers.set("Authorization", `Bearer ${token}`);
  
  // Rate limiting
  if (tooManyRequests()) return new Response("Too many requests", { status: 429 });
  
  // Transform request
  const body = await transformBody(request.body);
  
  // Forward to backend
  const response = await fetch(targetUrl, { body });
  
  // Transform response
  return transformResponse(response);
}
```

### 4. Easier Incremental Migration

**SSR pages can call backend directly:**
```typescript
// Server-side: No CORS issues
const data = await fetch("http://localhost:5000/api/products");

// Browser-side: Use proxy
fetch("/api/proxy/cart");
```

Both work because:
- Server → Server (direct)
- Browser → Proxy → Server (indirect)

### 5. Caching Support

Proxy can implement caching:

```typescript
// Cache GET /api/proxy/products for 60 seconds
if (request.method === "GET" && path === "products") {
  const cached = await cache.get(path);
  if (cached) return new Response(cached, { status: 200 });
}
```

### 6. Security

- Backend doesn't expose real IP/port
- Can add rate limiting
- Can validate requests
- Can audit access
- Can require authentication
- Can log requests

---

## Port Configuration

### Why Two Ports?

```
Port 3000: Next.js Frontend
  ├─ Development: npm run dev
  ├─ Browser: http://localhost:3000
  └─ Handles: SSR rendering, proxy routes, CSR pages

Port 5000: Express Backend
  ├─ Development: npm run dev
  ├─ API: http://localhost:5000/api/...
  └─ Handles: Data, database queries, business logic
```

### Why Not Port 3000 for Both?

If both tried to run on port 3000:
```
npm run dev (Next.js)     Port 3000 ✅ (started first)
npm run dev (Backend)     Port 3000 ❌ (port already in use)
→ Error: Port 3000 is already in use
```

**Solution:** Backend uses port 5000

### How Proxy Bridges Them

From browser perspective:
```
Browser sends: GET http://localhost:3000/api/proxy/products
               ↓
        Next.js port 3000 receives
               ↓
        Proxy extracts path: products
               ↓
        Proxy knows backend is at: http://localhost:5000
               ↓
        Proxy forwards to: http://localhost:5000/api/products
               ↓
        Response returned to browser on port 3000
```

Browser never knows port 5000 exists!

---

## Troubleshooting Proxy

### Issue 1: "Cannot connect to proxy"

**Symptom:** Browser error "fetch failed"

**Debug:**
1. Check backend is running: `curl http://localhost:5000/ping`
2. Check proxy route exists: `ls app/api/proxy/\[...path\]/route.ts`
3. Check environment: `cat .env.local | grep BACKEND_URL`

### Issue 2: "Proxy returns 404"

**Symptom:** Network tab shows proxy request fails with 404

**Debug:**
1. Check backend has the route: `curl http://localhost:5000/api/products`
2. Check route prefix matches: `/api/proxy/products` should forward to `/api/products`
3. Proxy might be stripping `/api/proxy/` correctly but backend expects different prefix

### Issue 3: "CORS error even with proxy"

**Symptom:** Browser shows CORS error

**Debug:**
1. Proxy should prevent CORS errors
2. If still happening, backend might be returning error headers
3. Check Response headers in Network tab

### Issue 4: "Proxy works for GET not POST"

**Symptom:** GET requests work, POST fails

**Debug:**
1. Check POST handler exists in route.ts
2. Verify body is forwarded: `body: hasBody ? await request.text() : undefined`
3. Test with curl: `curl -X POST http://localhost:5000/api/auth/login`

---

## Monitoring Proxy

### View Proxy Requests

**Browser DevTools (F12 → Network):**
- Look for requests to `/api/proxy/...`
- Check status code, response
- Verify response data

**Terminal Logging:**
Add to proxy route:

```typescript
async function forward(request, params) {
  const path = params.path?.join("/") ?? "";
  console.log(`[PROXY] ${request.method} /api/proxy/${path}`);
  
  // ... rest of code
  
  console.log(`[PROXY] Response: ${response.status}`);
}
```

### Verify Proxy is Forwarding

```bash
# Terminal 1: Watch backend logs
npm run dev

# Terminal 2: Make request through proxy
curl http://localhost:3000/api/proxy/products

# Should see in Terminal 1:
# GET /api/products 200 ← backend received it
```

---

## Production Deployment

### Frontend Deployment (Next.js on Vercel)

```bash
# Vercel automatically handles NEXT_PUBLIC_BACKEND_URL
# Set production backend URL in Vercel dashboard
NEXT_PUBLIC_BACKEND_URL=https://api.production.com
```

### Backend Deployment (Express on Server)

```bash
# Server location: production.api.com
# Port: 5000 or 3000

# Update frontend to point to production backend
NEXT_PUBLIC_BACKEND_URL=https://api.production.com
```

### No Changes Needed to Proxy Code!

The proxy code works the same in development and production. Only environment variable changes.

---

## Quick Reference

| Component | Location | Port | Purpose |
|-----------|----------|------|---------|
| **Next.js Frontend** | http://localhost:3000 | 3000 | Renders pages (SSR + CSR) |
| **API Proxy** | /api/proxy/* | 3000 | Forwards requests to backend |
| **Express Backend** | http://localhost:5000 | 5000 | Handles API requests |
| **MySQL Database** | localhost | 3306 | Stores data |

---

**Last Updated:** May 10, 2026  
**Pattern:** API Gateway (Proxy)  
**Architecture:** Incremental Migration (Phase 2→3)  
**Status:** Production Ready
