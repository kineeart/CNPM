# CSR to SSR Conversion Guide

## Overview

This guide explains how to convert a client-side rendered (CSR) page to server-side rendered (SSR) in Next.js, using the FastFood app migration as examples.

---

## Before & After: Visual Comparison

### Original React CSR (Home/Products Page)

```jsx
// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // Data fetched AFTER page loads
    const fetchStores = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/stores`);
        setStores(res.data);
        // ~1-2 second delay before data appears
      } catch (err) {
        console.error(err);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="homepage-container">
      <h2 className="section-title">Danh sách cửa hàng</h2>
      {stores.length === 0 ? (
        <p className="loading-text">Đang tải hoặc chưa có cửa hàng...</p>
        // User sees this while data loads
      ) : (
        <div className="store-list">
          {/* stores rendered here after fetch completes */}
        </div>
      )}
    </div>
  );
};
```

**Data Flow:**
```
Browser loads page
  ↓
Shows "Loading..." message
  ↓ (useEffect runs)
Browser makes HTTP request
  ↓
Backend responds
  ↓
Data renders in browser
Total: ~1-2 seconds before user sees data
```

---

### Migrated Next.js SSR (Home/Products Page)

```typescript
// app/home/page.tsx
import React from "react";

const BACKEND_URL = "http://192.168.123.7:3000/api";

interface Store {
  id: number;
  name: string;
  address: string;
  avatar: string;
}

// Fetch function (runs on SERVER, not browser)
async function fetchStores(): Promise<Store[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/stores`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (!res.ok) throw new Error("Failed to fetch stores");
    return await res.json();
  } catch (error) {
    console.error("Error fetching stores:", error);
    return [];
  }
}

// Component is async (Server Component)
export default async function Home() {
  // Data fetched on SERVER before rendering
  const stores = await fetchStores();

  return (
    <div className="homepage-container">
      <h2 className="section-title">Danh sách cửa hàng</h2>
      {stores.length === 0 ? (
        <p className="loading-text">Chưa có cửa hàng...</p>
      ) : (
        <div className="store-list">
          {stores.map((store) => (
            // Data already available - no loading state needed!
            <div key={store.id} className="store-card">
              {/* ... store card content ... */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Data Flow:**
```
Browser requests /home
  ↓ (server-side)
Next.js Server runs fetchStores()
  ↓
Backend responds
  ↓
HTML generated with data
  ↓
Browser receives complete HTML
Total: ~1 second (network latency only, no React rendering)
```

---

## Step-by-Step Conversion

### Step 1: Convert to Async Server Component

**Before (CSR):**
```jsx
function Page() {
  const [data, setData] = useState(null);
  useEffect(() => { /* fetch */ }, []);
  return <div>{/* render */}</div>;
}
```

**After (SSR):**
```typescript
export default async function Page() {
  // No "use client" directive
  // No useState, useEffect, useContext
  // Just async/await
  const data = await fetchData();
  return <div>{/* render */}</div>;
}
```

---

### Step 2: Move Fetch Logic Outside Component

**Before (CSR):**
```jsx
function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch inside useEffect
    fetch("/api/data").then(r => r.json()).then(setData);
  }, []);
}
```

**After (SSR):**
```typescript
// Helper function runs on SERVER
async function fetchData() {
  const res = await fetch("http://backend/api/data", {
    next: { revalidate: 60 } // ISR config
  });
  return res.json();
}

export default async function Page() {
  // Call async function directly
  const data = await fetchData();
}
```

---

### Step 3: Remove Client-Specific Hooks

**Cannot use in Server Components:**
- `useState` - Use `ServerAction` or pass props instead
- `useEffect` - Use `async/await` during render
- `useContext` - Use `React.cache()` or fetch in parent
- `useRouter` - Use `<Link>` or `ServerAction`
- `useSearchParams` - Use `searchParams` prop

**What to do:**
- Move state management to client sub-component
- Use `dynamic(..., { ssr: false })` if needed
- Wrap client-interactive parts in `"use client"` child components

---

### Step 4: Handle Interactivity with Client Components

For ProductDetail page (interactive add-to-cart button):

**Server Component (page.tsx):**
```typescript
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetail({ params }) {
  // Fetch on server - fully static
  const product = await fetch(`.../products/${params.id}`).then(r => r.json());

  return (
    <>
      <h2>{product.name}</h2>
      <img src={product.imageUrl} />
      <p>${product.price}</p>
      
      {/* Client component for interactivity */}
      <AddToCartButton productId={product.id} />
    </>
  );
}
```

**Client Component (AddToCartButton.tsx):**
```typescript
"use client";  // This runs in browser

import { useState } from "react";

export default function AddToCartButton({ productId }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = async () => {
    // Client-side logic (auth, fetch, etc.)
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) {
      alert("Please log in!");
      return;
    }

    await fetch("/api/proxy/cart/add", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, productId, quantity: 1 })
    });

    setShowPopup(true);
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

---

## CSS: No Changes Needed

✅ **CSS files stay exactly the same**

Before:
```jsx
import "../css/HomePage.css";
```

After:
```typescript
import "@/app/styles/HomePage.css";
```

Only the import path changes. The CSS itself is **identical**.

---

## Metadata: Add for SEO

**CSR (no metadata in page source):**
```jsx
// frontend/src/pages/ProductDetail.jsx - metadata can't be in page source
```

**SSR (metadata in HTML):**
```typescript
export async function generateMetadata({ params }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  
  return {
    title: `${product.name} - FastFood`,
    description: product.description,
    openGraph: {
      images: [{ url: product.imageUrl }]
    }
  };
}
```

Now when shared on social media, preview includes product image and description.

---

## Caching & ISR: Control Revalidation

**Force cache (Static):**
```typescript
const res = await fetch(url, { cache: "force-cache" });
```
→ Page generated once, served from cache forever

**Incremental Static Regeneration (ISR):**
```typescript
const res = await fetch(url, { next: { revalidate: 60 } });
```
→ Page generated at build time, revalidated every 60 seconds

**On-demand:**
```typescript
const res = await fetch(url, { cache: "no-store" });
```
→ Fresh fetch for every request (not recommended for performance)

---

## Performance Impact

### Before (CSR) - Original React App

```
Network Request: /          100ms
JavaScript Download:        150ms
JavaScript Parse/Exec:      200ms
useEffect runs:              50ms
API Request (useEffect):    300ms
React Re-render:            100ms
Display Complete:           ≈ 800ms
```

### After (SSR) - Next.js

```
Network Request: /          100ms (includes data)
Server-side fetch:          250ms
HTML render on server:       50ms
Display Complete:           ≈ 400ms
```

**Benefits:**
- **50% faster** (400ms vs 800ms)
- **Better SEO** (data in HTML)
- **Better mobile** (less JS)
- **Better accessibility** (data without JS)

---

## Migration Checklist

- [ ] Create `async` page component (no `"use client"`)
- [ ] Move fetch out of `useEffect` into top-level function
- [ ] Remove `useState` for data (use fetched data directly)
- [ ] Remove `useEffect` (replaced by `async/await`)
- [ ] Import client-interactive parts as sub-components
- [ ] Mark sub-components with `"use client"` if needed
- [ ] Keep CSS files and styling exactly the same
- [ ] Add `generateMetadata()` for SEO
- [ ] Configure `next: { revalidate }` for ISR
- [ ] Test with `npm run dev` at `/route`
- [ ] Verify `Ctrl+U` shows data in HTML
- [ ] Check Network tab: no XHR for data
- [ ] Compare visual appearance to original

---

## Common Pitfalls

### ❌ Mistake 1: Using `"use client"` by default
```typescript
// WRONG - makes it CSR again
"use client";
export default async function Page() { }
// async doesn't work with "use client"
```

**Fix:** Remove `"use client"` unless component needs browser APIs.

---

### ❌ Mistake 2: Fetching in useEffect
```typescript
// WRONG - defeats purpose of SSR
export default async function Page() {
  return <Component />;
}

function Component() {
  useEffect(() => {
    fetch("/api/data"); // Still client-side!
  }, []);
}
```

**Fix:** Fetch in server component, pass data down as props.

---

### ❌ Mistake 3: Forgetting dynamic: false for DOM libs
```typescript
// WRONG - Leaflet tries to access window at build time
import { MapContainer } from "react-leaflet";
export default async function Page() {
  return <MapContainer />;
}
```

**Fix:** Use dynamic import with `{ ssr: false }`.

---

### ❌ Mistake 4: Not updating imports for data proxy
```typescript
// WRONG - hard-coded backend URL won't work in browser
const res = await fetch("http://192.168.123.7:3000/api/stores");
```

**Fix:** In server components, direct backend URL works. In CSR pages, use `/api/proxy/...`.

---

## When to Use CSR vs SSR

### Use **SSR** when:
- ✅ Page content is SEO-important
- ✅ Data doesn't change frequently (or use ISR)
- ✅ No user-specific data (auth state)
- ✅ Want better Core Web Vitals
- ✅ Want no loading spinner

### Use **CSR** when:
- ✅ Highly interactive (live updates, form with instant feedback)
- ✅ User-specific content (after login)
- ✅ Requires client browser APIs (localStorage, navigator)
- ✅ Frequently changing data (live chat, notifications)

### Use **Hybrid** when:
- ✅ Static content rendered on server (SEO)
- ✅ Interactive parts (buttons, forms) in client components
- ✅ Example: Product page (SSR) + Add-to-cart button (CSR)

---

## Example: Complete Hybrid Page

**Server Component (page.tsx):**
```typescript
import AddToCartButton from "./AddToCartButton";

export default async function ProductPage({ params }) {
  // All of this runs on server before sending HTML
  const product = await fetch(`.../products/${params.id}`).then(r => r.json());

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} />
      <p>Price: ${product.price}</p>
      <p>{product.description}</p>
      
      {/* Client component - only this is interactive */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```

**Client Component (AddToCartButton.tsx):**
```typescript
"use client";

import { useState } from "react";

export default function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await fetch("/api/proxy/cart/add", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, productId, quantity: 1 })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleAddToCart} disabled={loading}>
        {loading ? "Adding..." : "Add to Cart"}
      </button>
      {success && <p>Added to cart!</p>}
    </>
  );
}
```

---

## Verification Checklist

After migrating, verify:

1. **Visual Appearance** (Ctrl+Shift+I)
   - CSS loads correctly
   - Layout identical to original
   - All colors and spacing match

2. **Page Source** (Ctrl+U)
   - Shows actual product/store data
   - Not loading skeletons
   - Not empty templates

3. **Network Tab** (F12 → Network)
   - No XHR request for product data
   - HTML file includes the data
   - No client-side fetch for SSR content

4. **Performance** (Lighthouse)
   - Faster FCP (First Contentful Paint)
   - Faster LCP (Largest Contentful Paint)
   - Better CLS (Cumulative Layout Shift)

---

## Summary

| Aspect | CSR | SSR | Hybrid |
|--------|-----|-----|--------|
| **Rendering** | Browser | Server | Both |
| **Initial HTML** | Empty | Complete | Mixed |
| **SEO** | Limited | Excellent | Excellent |
| **Performance** | Slower | Faster | Faster |
| **Interactivity** | Full | None | Where needed |
| **Use Case** | Complex UIs | Static content | Most real apps |

The FastFood migration uses **all three patterns** to demonstrate different rendering strategies while preserving the original application's visual identity.
