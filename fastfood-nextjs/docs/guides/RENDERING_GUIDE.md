# Rendering Strategies: Complete Guide

## Overview

The FastFood app demonstrates three rendering strategies on the same application. This guide explains when and why to use each.

---

## 1. CSR (Client-Side Rendering)

### What Happens

```
Browser requests /login
         ↓
Server sends empty HTML + JavaScript
         ↓
Browser loads JavaScript
         ↓
JavaScript runs useEffect
         ↓
Browser makes API request
         ↓
Backend responds with data
         ↓
JavaScript updates state
         ↓
React re-renders with data
         ↓
User sees content (~1-2 seconds)
```

### Visual Indicators

- **HTML Source (Ctrl+U):** Minimal, no data
- **Network Tab:** XHR requests AFTER page load
- **Page Load:** Shows empty state, then data appears
- **Badge:** "CSR - Client-Side Rendered"

### When to Use CSR

✅ **User-specific content**
- Login page (different for each user)
- User dashboard (personalized data)
- Shopping cart (user's items)

✅ **Highly interactive**
- Forms with instant validation
- Real-time search
- Live notifications

✅ **Requires browser APIs**
- localStorage access
- geolocation
- camera/microphone

✅ **Frequently changing**
- Live chat
- Notifications
- Stock prices

### CSR in FastFood

**Pages using CSR:**
- `/` (Login) - User-specific auth
- `/register` - Form interactivity
- `/dashboard` - User's store data
- `/cart` - User's items
- `/checkout` - Address & form state
- `/my-orders` - User's order history

**Example: Login Page**
```typescript
"use client"; // Browser will run this

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Browser makes fetch request
    const res = await fetch("/api/proxy/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form inputs */}
    </form>
  );
}
```

### Verification: CSR

1. **Open Network tab (F12)**
   - Refresh page
   - See HTML download first
   - Watch for XHR requests appear as you interact

2. **View Page Source (Ctrl+U)**
   - Search for username or email
   - Should be empty
   - Your data isn't in the HTML

3. **Look for loading states**
   - "Loading..." text appears while fetching
   - Data appears after API response
   - Shows CSR in action

---

## 2. SSR (Server-Side Rendering) - Static

### What Happens

```
Build time (before app runs):
  ↓
Next.js fetches data from backend
  ↓
Next.js renders page to HTML
  ↓
HTML file saved and cached
  ↓
Deployed to server

User requests /home:
  ↓
Server immediately serves pre-rendered HTML
  ↓
Browser displays data instantly (~0.5 seconds)
  ↓
ISR: After 60 seconds, server will re-generate if needed
```

### Visual Indicators

- **HTML Source (Ctrl+U):** Complete, includes all data
- **Network Tab:** No XHR requests for data
- **Page Load:** Instant (no loading state)
- **Badge:** "SSG/ISR - Pre-rendered at build time, revalidates every 60s"

### When to Use SSR Static

✅ **Public content**
- Product listings
- Blog posts
- Store information

✅ **SEO critical**
- Product pages should show data in Google crawl
- Store listings appear in search results
- Meta tags include real data

✅ **Can tolerate slight staleness**
- OK if data is 60+ seconds old
- ISR revalidates periodically

✅ **Better performance needed**
- No loading state
- Data in initial HTML
- Faster First Contentful Paint

### SSR in FastFood

**Pages using SSR Static:**
- `/home` - Store list (public, SEO important)

**Example: Products Home Page**
```typescript
// This runs on SERVER, not browser

async function fetchStores() {
  const res = await fetch("http://backend/api/stores", {
    next: { revalidate: 60 } // ISR: revalidate every 60 seconds
  });
  return res.json();
}

// NOT marked "use client" - this is server component
export default async function Home() {
  const stores = await fetchStores(); // Runs on server
  
  return (
    <div className="store-list">
      {stores.map(store => (
        <div key={store.id} className="store-card">
          <h3>{store.name}</h3>
          {/* Data already available - rendered on server */}
        </div>
      ))}
    </div>
  );
}
```

### Verification: SSR Static

1. **Ctrl+U (View Page Source)**
   - Search for store name (e.g., "Burger King")
   - WILL be found in HTML
   - Proves server rendered it

2. **Network Tab (F12)**
   - Refresh page
   - Single HTML request
   - No XHR requests for store data
   - Proves data came from server, not browser

3. **Build Output**
   - `npm run build` shows: `/home ○ (Static)`
   - Proves page is pre-rendered

4. **ISR Revalidation**
   - Change store name in database
   - Wait 61 seconds
   - Visit `/home` again
   - See new data (proved ISR revalidated)

---

## 3. SSR (Server-Side Rendering) - Dynamic

### What Happens

```
User requests /product/42
         ↓
Server receives request
         ↓
Server fetches data for product 42
         ↓
Server renders page to HTML with data
         ↓
HTML sent to browser
         ↓
User sees content (~0.7 seconds)

Different request for /product/99:
         ↓
Server fetches data for product 99
         ↓
Server renders page to HTML with DIFFERENT data
         ↓
Each page has its own data
```

### Visual Indicators

- **HTML Source (Ctrl+U):** Complete, includes product data
- **Network Tab:** No XHR requests for product data
- **Page Load:** Fast (data in HTML)
- **URL changes:** Data in HTML changes per product ID
- **Badge:** "SSR Dynamic - Server-rendered on request"

### When to Use SSR Dynamic

✅ **Parametric content**
- Product pages (product ID changes)
- User profiles (username changes)
- Blog articles (article ID changes)

✅ **SEO critical with dynamic content**
- Google crawls `/product/1`, `/product/2`, etc.
- Each has own meta tags and data
- Better rankings

✅ **Real-time or frequently updated**
- Product price can update
- Stock levels change
- Comments accumulate

✅ **Want fresh data per request**
- Not acceptable to show 60-second-old data
- User expects current information

### SSR in FastFood

**Pages using SSR Dynamic:**
- `/product/[id]` - Individual product
- `/store/[id]` - Individual store

**Example: Product Detail Page**
```typescript
// Server component - runs on server for EACH request

export async function generateMetadata({ params }) {
  // Fetch data for metadata
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  return {
    title: `${product.name} - FastFood`,
    description: product.description
  };
}

async function fetchProduct(id) {
  const res = await fetch(`http://backend/api/products/${id}`, {
    next: { revalidate: 60 } // Can still cache, but per-route
  });
  return res.json();
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id); // Fetches for THIS product
  
  return (
    <>
      <h1>{product.name}</h1>
      <img src={product.imageUrl} />
      <p>{product.price}</p>
      <AddToCartButton productId={product.id} /> {/* Client component */}
    </>
  );
}
```

### Verification: SSR Dynamic

1. **Ctrl+U on Different Products**
   - Visit `/product/1` → Ctrl+U → Search for "Burger"
   - Visit `/product/2` → Ctrl+U → Search for "Pizza"
   - Each shows DIFFERENT data
   - Proves server rendered each separately

2. **Network Tab**
   - No XHR requests
   - Only HTML download
   - Data already in HTML

3. **Change URL in Address Bar**
   - `/product/1` → page 1 data
   - `/product/2` → page 2 data
   - Navigation happens instantly (no loading state)

---

## 4. Hybrid Rendering

### Concept

Some pages combine **server-side rendering** (static data) with **client-side interactivity** (buttons, forms).

```
Server renders:
  - Product information
  - Store details
  - Product images
  → All in HTML, instant display

Client enhances:
  - "Add to Cart" button
  - Success notification
  - Form validation
  → Interactive features
```

### When to Use Hybrid

✅ Most real-world applications
- Content is static (render on server)
- Interactions are dynamic (handle in browser)

✅ SEO + Interactivity
- Product page indexed by Google
- Button clicks not indexed
- Both needs met

### Hybrid in FastFood

**Product Detail Page (`/product/[id]`)**

**Server Part (page.tsx):**
```typescript
// Server component - renders product data
export default async function ProductPage({ params }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  
  return (
    <>
      <h1>{product.name}</h1>
      <img src={product.imageUrl} />
      <AddToCartButton productId={product.id} />
    </>
  );
}
```

**Client Part (AddToCartButton.tsx):**
```typescript
"use client"; // Runs in browser

export default function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    // Browser-side interactivity
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please log in");
      return;
    }
    
    setLoading(true);
    await fetch("/api/proxy/cart/add", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, productId, quantity: 1 })
    });
    setLoading(false);
    // Show success notification
  };
  
  return <button onClick={handleClick}>Add to Cart</button>;
}
```

### Verification: Hybrid

1. **Ctrl+U (View Page Source)**
   - Search for product name
   - FOUND - proves server rendered it
   - Search for "Add to Cart"
   - Might be found or might not (depends on how it's rendered)

2. **Click Add to Cart**
   - Popup appears (client-side)
   - No page reload
   - Watch Network tab for POST request

3. **Why Both?**
   - Product data in HTML (SEO, performance)
   - Button interaction in JavaScript (real-time, auth check)
   - Best of both worlds

---

## Comparison Matrix

| Aspect | CSR | SSR Static | SSR Dynamic | Hybrid |
|--------|-----|-----------|------------|--------|
| **Rendered** | Browser | Build time | On request | Both |
| **Data in HTML** | ❌ | ✅ | ✅ | ✅ (partial) |
| **SEO** | ⭐ Poor | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| **Speed** | Medium | Fast | Fast | Fast |
| **Freshness** | Instant | Every 60s | Per request | Per request |
| **User-specific** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Interactive** | ✅ Yes | ❌ No | ⚠️ Partial | ✅ Yes |
| **Example** | Login | Home | Product | Product detail |

---

## Choosing the Right Strategy

### Decision Tree

**Is the content user-specific?**
- YES → Use **CSR** (Login, Cart, Dashboard)
- NO → Continue...

**Is SEO critical?**
- YES → Use **SSR** (Products, Articles)
- NO → Consider **CSR** for simpler architecture

**Does content change frequently?**
- YES → Use **SSR Dynamic** or **CSR**
- NO → Use **SSR Static** with ISR

**Need instant updates?**
- YES → Use **CSR** or **SSR Dynamic**
- NO → Use **SSR Static** with ISR

**Is this a public product page?**
- YES → Use **Hybrid** (server data + client button)
- NO → Continue...

**Default for unknown:**
→ Use **Hybrid**: server renders content, client handles interaction

---

## Performance Impact

### Initial Load Time

**CSR (Login page):**
- HTML download: 100ms
- JavaScript load: 150ms
- Parse/compile: 100ms
- API fetch: 300ms
- React render: 100ms
- **Total: ~750ms**

**SSR Static (Home page):**
- HTML download (with data): 100ms
- Parse HTML: 50ms
- **Total: ~150ms**
→ **5x faster** than CSR

**SSR Dynamic (Product page):**
- Server fetch data: 200ms
- HTML render: 50ms
- HTML download: 100ms
- **Total: ~350ms**
→ **2x faster** than CSR

**Key insight:** "Pre-rendering on server saves multiple round-trips"

---

## SEO Impact

### Google Crawling

**CSR Page (React with useEffect):**
```html
<!-- What Google sees -->
<div id="root"></div>
<script>/* JavaScript that loads content */</script>
```
→ Google might not wait for data
→ Page ranks poorly for product keywords

**SSR Page:**
```html
<!-- What Google sees -->
<div class="product-list">
  <div class="product-card">
    <h2>Delicious Burger</h2>
    <p>Price: $5.99</p>
    <img src="burger.jpg" alt="Delicious Burger" />
  </div>
</div>
```
→ Google sees complete data
→ Page ranks well for "burger", "price", etc.

### Meta Tags

**CSR:**
```html
<title>FastFood</title>
<meta name="description" content="FastFood App" />
```

**SSR:**
```html
<title>Delicious Burger - FastFood</title>
<meta name="description" content="Fresh burger made with premium beef. Price: $5.99" />
<meta property="og:image" content="burger.jpg" />
```

→ Better social media sharing
→ Better Google snippets
→ Better click-through rates

---

## Summary

Choose your rendering strategy based on:
- **Is it user-specific?** → CSR
- **Is it public and SEO-important?** → SSR
- **Is it interactive?** → Hybrid
- **Uncertain?** → Hybrid (safe default)

FastFood demonstrates all four patterns in one real application.

