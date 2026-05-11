# Migration Architecture Guide

Complete technical architecture for migrating from React to Next.js.

---

## Architecture Evolution

### Original Architecture (React + Express)

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT BROWSER                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  React App (Vite)                                     │
│  ├─ Home.jsx (useEffect fetch)                       │
│  ├─ Login.jsx (useState, localStorage)               │
│  ├─ Cart.jsx (useState, useEffect)                   │
│  └─ [... other pages with CSR logic]                 │
│                                                       │
│  ALL data fetching happens in browser                │
│  1-2 second delay for each page                      │
│                                                       │
└──────────────────────────────┬──────────────────────┘
                               │
                    fetch() to backend
                    CORS origins configured
                               │
                               ▼
┌──────────────────────────────────────────────────────┐
│        EXPRESS BACKEND (http://192.168.123.7:3000)   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Routes:                                              │
│  ├─ POST /api/users/login                            │
│  ├─ GET /api/stores                                  │
│  ├─ GET /api/products                                │
│  ├─ POST /api/cart/add                               │
│  └─ [... etc]                                        │
│                                                       │
└──────────────────────────────┬──────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  MYSQL DATABASE  │
                    │  - users         │
                    │  - products      │
                    │  - stores        │
                    │  - orders        │
                    └──────────────────┘
```

**Characteristics:**
- All rendering in browser (CSR only)
- Data fetching delays load time
- SEO not possible (no data in HTML)
- More JavaScript sent to browser
- Every page has loading state

---

### Migrated Architecture (Next.js + Express)

```
┌─────────────────────────────────────────────────────────┐
│              CLIENT BROWSER (Same UI)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Next.js App (App Router)                                │
│  ├─ Login page (CSR with "use client")                  │
│  ├─ Home page (SSR - pre-rendered HTML)                 │
│  ├─ Product/[id] (SSR Dynamic - server-rendered)        │
│  ├─ Cart page (CSR with "use client")                   │
│  └─ [... pages mix CSR and SSR strategically]           │
│                                                           │
│  Original CSS preserved                                 │
│  Original layouts intact                                │
│  Same business flows                                    │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ├─ SSR pages: No fetch request
                       │             (data in HTML)
                       │
                       ├─ CSR pages: fetch() to proxy
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│        NEXT.JS SERVER (App Router)                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  App Component Tree:                                     │
│  ├─ app/layout.tsx (root shell)                          │
│  ├─ app/page.tsx (login - CSR)                           │
│  ├─ app/home/page.tsx (products - SSR static)            │
│  ├─ app/product/[id]/page.tsx (detail - SSR dynamic)     │
│  ├─ app/cart/page.tsx (cart - CSR)                       │
│  └─ app/api/proxy/[...path]/route.ts (API proxy)         │
│                                                           │
│  Rendering Strategies:                                  │
│  • SSR Static: /home built once, cached                 │
│  • SSR Dynamic: /product/[id] rendered per request      │
│  • CSR: pages with "use client" fetch in browser        │
│  • Hybrid: server-render + client-interactive           │
│                                                           │
│  ┌────────────────────────────────────────┐             │
│  │  API Proxy Route                       │             │
│  │  Endpoint: /api/proxy/[...path]        │             │
│  │  Role: Intercept browser requests,     │             │
│  │        forward to backend,             │             │
│  │        return response                 │             │
│  └────────────────────────────────────────┘             │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    (server-side)              (for CSR pages)
         │                           │
         ▼                           ▼
    Direct fetch to         Proxy forwards to
    Backend (within         Backend (from browser)
    same network)           (with credentials)
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│      EXPRESS BACKEND (http://192.168.123.7:3000)        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Identical API endpoints:                                │
│  ├─ POST /api/users/login                               │
│  ├─ GET /api/stores                                     │
│  ├─ GET /api/products/featured                          │
│  ├─ GET /api/products/[id]                              │
│  ├─ GET /api/products/store/[id]/public                 │
│  ├─ POST /api/cart/add                                  │
│  ├─ GET /api/cart/[userId]                              │
│  ├─ GET /api/orders/[userId]                            │
│  └─ [... etc - unchanged from original]                 │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
                    ┌──────────────────┐
                    │  MYSQL DATABASE  │
                    │  (Unchanged)     │
                    │  - users         │
                    │  - products      │
                    │  - stores        │
                    │  - orders        │
                    └──────────────────┘
```

**Characteristics:**
- Rendering strategies matched to content type
- SSR pages pre-rendered (instant load)
- CSR pages fetch via proxy (consistent origin)
- Same Express backend (minimal disruption)
- Hybrid approach for most pages
- Original UI fully preserved

---

## Data Fetching Patterns

### Pattern 1: CSR with API Proxy

**Used for:** User-specific data (login, cart, dashboard)

```
Request Flow:
User clicks "Login" button
        ↓
Browser JavaScript (CSR page with "use client")
        ↓
fetch("/api/proxy/users/login", {
  method: "POST",
  body: { email, password }
})
        ↓
Next.js /api/proxy/[...path]/route.ts intercepts
        ↓
Proxy forwards to backend:
fetch("http://192.168.123.7:3000/api/users/login", {
  method: "POST",
  body: same
})
        ↓
Backend processes, returns { id, email, role }
        ↓
Proxy returns response to browser
        ↓
Browser stores in localStorage
        ↓
Set authenticated state, redirect to /dashboard
```

**Example Code (page.tsx - CSR):**
```typescript
"use client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("/api/proxy/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data));
    router.push("/dashboard");
  };

  return <form onSubmit={handleLogin}>/* ... */</form>;
}
```

**Network Tab View:**
```
1. GET / → HTML (page.tsx code)
2. GET /styles.css → CSS
3. GET /script.js → JavaScript
4. (User interacts) POST /api/proxy/users/login → JSON response
```

---

### Pattern 2: SSR Static with ISR

**Used for:** Public, SEO-critical content that updates infrequently

```
Build Time:
npm run build
        ↓
Next.js processes app/home/page.tsx
        ↓
Calls async fetchStores()
        ↓
Fetches from backend: /api/stores
        ↓
Returns [ {id:1, name:"BK"}, {id:2, name:"McD"} ]
        ↓
Renders React component with data
        ↓
Converts to static HTML
        ↓
HTML stored in .next/server/app/home.html
        ↓
Deployed to Next.js server

Runtime (User visits /home):
Browser requests /home
        ↓
Next.js server checks: Is this HTML cached?
        ↓
YES → Serve cached HTML instantly (~50ms)
        ↓
User sees stores list immediately

After 60 seconds of inactivity:
Request comes in
        ↓
Next.js checks: Is ISR revalidation needed?
        ↓
YES → Backend might have new stores
        ↓
Fetch from backend again
        ↓
Generate new HTML
        ↓
Cache new version
        ↓
Serve to next request
```

**Example Code (page.tsx - SSR):**
```typescript
// NOT marked "use client" - runs on SERVER

async function fetchStores() {
  const res = await fetch("http://192.168.123.7:3000/api/stores", {
    next: { revalidate: 60 } // ISR: revalidate every 60 seconds
  });
  return res.json();
}

export default async function Home() {
  const stores = await fetchStores();
  
  return (
    <div className="store-list">
      {stores.map(store => (
        <div key={store.id} className="store-card">
          <h3>{store.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

**Network Tab View:**
```
1. GET /home → HTML (includes store list data)
   ↑ This IS the complete HTML, no further requests needed
2. GET /styles.css
```

**Build Output:**
```
Route (app)               Revalidate
├ ○ /home                 1m
```

---

### Pattern 3: SSR Dynamic

**Used for:** Parametric, SEO-critical content (products, articles)

```
User visits /product/42
        ↓
Browser requests /product/42
        ↓
Next.js receives request with params: { id: "42" }
        ↓
Runs app/product/[id]/page.tsx with params
        ↓
Calls async fetchProduct("42")
        ↓
Fetches from backend: /api/products/42
        ↓
Returns { id: 42, name: "Burger", price: 5.99 }
        ↓
Renders React component with THIS product data
        ↓
Converts to HTML
        ↓
Sends to browser
        ↓
User sees product instantly (~500ms)

Different user visits /product/99:
        ↓
Same process but with params: { id: "99" }
        ↓
Fetches /api/products/99
        ↓
Returns { id: 99, name: "Pizza", price: 7.99 }
        ↓
Renders with DIFFERENT data
        ↓
Each product has unique HTML with its data
```

**Example Code (page.tsx - SSR Dynamic):**
```typescript
// NOT marked "use client" - runs on SERVER

async function fetchProduct(id: string) {
  const res = await fetch(
    `http://192.168.123.7:3000/api/products/${id}`,
    { next: { revalidate: 60 } }
  );
  return res.json();
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```

**Network Tab View:**
```
1. GET /product/42 → HTML (includes product 42 data)
2. GET /product/99 → HTML (includes product 99 data)
   Each response has different data
```

---

### Pattern 4: API Proxy Route

**Used for:** Browser-to-backend communication (CSR pages)

**File:** `app/api/proxy/[...path]/route.ts`

```typescript
export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  const pathStr = params.path.join("/");
  const forwardUrl = `http://192.168.123.7:3000/api/${pathStr}`;
  
  const response = await fetch(forwardUrl, {
    method: "POST",
    headers: req.headers,
    body: req.body
  });
  
  return response;
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const pathStr = params.path.join("/");
  const forwardUrl = `http://192.168.123.7:3000/api/${pathStr}`;
  
  const response = await fetch(forwardUrl, {
    method: "GET",
    headers: req.headers
  });
  
  return response;
}
```

**Flow:**
```
Browser
  fetch("/api/proxy/cart/add", { method: "POST", body })
        ↓
Next.js matches /api/proxy/[...path]
  [...path] = ["cart", "add"]
        ↓
Route handler runs
  forwardUrl = "http://192.168.123.7:3000/api/cart/add"
  Forwards POST request with body
        ↓
Backend processes
  Adds item to cart
        ↓
Returns response (200 + JSON)
        ↓
Route handler returns response to browser
        ↓
Browser receives, updates UI
```

---

## Hybrid Rendering Example

**Product Detail Page (`/product/[id]`)**

```typescript
// === SERVER COMPONENT ===
// app/product/[id]/page.tsx

import AddToCartButton from "./AddToCartButton";

// This runs on SERVER
async function fetchProduct(id: string) {
  const res = await fetch(`http://backend/api/products/${id}`);
  return res.json();
}

// NOT "use client" - server component
export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id);
  
  return (
    <>
      {/* Server renders this */}
      <h1>{product.name}</h1>
      <img src={product.imageUrl} />
      <p>${product.price}</p>
      
      {/* Client component imported as child */}
      <AddToCartButton productId={product.id} />
    </>
  );
}
```

```typescript
// === CLIENT COMPONENT ===
// app/product/[id]/AddToCartButton.tsx

"use client"; // Runs in BROWSER

import { useState } from "react";

export default function AddToCartButton({ productId }) {
  const [showPopup, setShowPopup] = useState(false);
  
  const handleClick = async () => {
    // Browser checks auth
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      alert("Please log in");
      return;
    }
    
    // Browser makes fetch request
    await fetch("/api/proxy/cart/add", {
      method: "POST",
      body: JSON.stringify({ 
        userId: user.id, 
        productId, 
        quantity: 1 
      })
    });
    
    setShowPopup(true);
  };
  
  return (
    <>
      <button onClick={handleClick}>Add to Cart</button>
      {showPopup && <p>Added to cart!</p>}
    </>
  );
}
```

**What Happens:**

1. **Server-side (build or on request):**
   - Fetches product data from backend
   - Renders `<h1>`, `<img>`, `<p>` with data
   - Converts to HTML

2. **Browser receives:**
   - Complete HTML with product info
   - JavaScript bundle with AddToCartButton logic

3. **User interaction:**
   - Clicks "Add to Cart"
   - Button component handles click
   - Makes fetch to proxy
   - Shows popup

**Result:**
- ✅ Product data in HTML (SEO good)
- ✅ No loading state for product (fast)
- ✅ Button interaction smooth (client handles it)
- ✅ Auth check in browser (security)

---

## File Structure

```
app/
├── layout.tsx                    ← Root layout with AppShell
├── page.tsx                      ← Login (CSR)
├── register/
│   └── page.tsx                  ← Register (CSR)
├── home/
│   └── page.tsx                  ← Products (SSR Static)
├── product/
│   └── [id]/
│       ├── page.tsx              ← Product (SSR Dynamic)
│       └── AddToCartButton.tsx   ← Button (CSR sub-component)
├── store/
│   └── [id]/
│       ├── page.tsx              ← Store (SSR Dynamic)
│       └── AddToCartButtonStore.tsx
├── cart/
│   └── page.tsx                  ← Cart (CSR)
├── checkout/
│   ├── page.tsx                  ← Checkout (CSR)
│   └── MapPicker.tsx             ← Map (CSR dynamic import)
├── my-orders/
│   ├── page.tsx                  ← Orders (CSR)
│   └── PopupMap.tsx              ← Map (CSR dynamic import)
├── dashboard/
│   └── page.tsx                  ← Dashboard (CSR)
├── api/
│   └── proxy/
│       └── [...path]/
│           └── route.ts          ← API proxy
├── styles/
│   ├── HomePage.css
│   ├── StoreDetail.css
│   └── [... all preserved CSS]
└── globals.css                   ← Imports all CSS

components/
├── Navbar.jsx                    ← Header (CSR)
├── Footer.jsx                    ← Footer
├── Sidebar.jsx                   ← Admin menu (CSR)
├── AppShell.jsx                  ← Route-aware wrapper
└── MainLayout.jsx

public/
└── icons/                        ← Images for map markers
```

---

## Performance Improvements

### Before (Pure CSR/React)

```
Timeline:
0ms     - Page request
100ms   - HTML/CSS downloaded
150ms   - JavaScript bundle loaded
250ms   - JavaScript parsed
300ms   - useEffect runs
600ms   - API request completes
700ms   - React re-renders with data
800ms   - User sees content

Waterfall: Request → HTML → JS → Parse → Fetch → Render
Problems: Long delay, loading state shown, bandwidth wasted
```

### After (Next.js with SSR/CSR mix)

```
Timeline for /home (SSR):
0ms     - Page request
100ms   - Complete HTML (with data) downloaded
120ms   - CSS/Images load
200ms   - User sees complete page
Problem solved: Pre-rendering eliminates wait for API

Timeline for /login (CSR):
0ms     - Page request
100ms   - HTML/CSS downloaded
200ms   - JavaScript loaded and parsed
300ms   - User sees login form (empty, ready for input)
When user logs in: POST /api/proxy/users/login (300ms)
600ms   - localStorage updated, redirect to /dashboard
Better: At least form is interactive immediately
```

**Key Metric:** SSR pages are **5x faster** at Time to Content Paint (CCP)

---

## Migration Checklist

- [x] Set up Next.js project with App Router
- [x] Set up TypeScript
- [x] Copy existing CSS files
- [x] Create shared components (Navbar, Footer)
- [x] Create API proxy route for CSR pages
- [x] Migrate CSR pages (Login, Register, Cart, etc.)
- [x] Migrate SSR Static pages (Home/Products)
- [x] Migrate SSR Dynamic pages (Product detail, Store detail)
- [x] Create Hybrid pages (server-render + client-interactive)
- [x] Test all routes with `npm run build`
- [x] Verify Ctrl+U shows data for SSR pages
- [x] Verify Network tab shows proxy calls for CSR pages
- [x] Document rendering strategies
- [x] Create presentation guide

---

## Summary

The migration maintains **original UI and business logic** while adopting modern Next.js patterns:

- **CSR:** Browser-side fetching for user-specific, highly interactive content
- **SSR Static:** Pre-rendered for public, SEO-critical content
- **SSR Dynamic:** Server-rendered per request for parametric content
- **Hybrid:** Combines server-rendering with client interactivity
- **API Proxy:** Single origin for CSR pages, eliminates CORS issues

Result: Faster app, better SEO, cleaner architecture, production-ready.
