# CSR vs SSR vs SSG: Detailed Comparison

Quick reference for understanding rendering strategies in the FastFood migration.

---

## Quick Definition

| Term | Full Name | Meaning | When |
|------|-----------|---------|------|
| **CSR** | Client-Side Rendering | Browser renders HTML from JavaScript | User interaction, user-specific |
| **SSR** | Server-Side Rendering | Server renders HTML before sending | Initial page load, SEO-critical |
| **SSG** | Static Site Generation | Server pre-renders at build time | Public content, no frequent updates |
| **ISR** | Incremental Static Regeneration | Static pages with periodic refresh | Balance of static speed + fresh data |

---

## CSR: Client-Side Rendering

### What It Is

HTML sent to browser is empty or minimal. JavaScript runs in browser and:
1. Fetches data from API
2. Processes data
3. Renders HTML dynamically
4. Updates DOM

### Timeline

```
Time  Event
0ms   Browser requests /login
100ms HTML downloaded (minimal, no data)
150ms CSS loaded
200ms JavaScript bundle loaded
250ms JavaScript parses and executes
300ms useEffect hook runs
400ms Browser makes API call: GET /api/users/me
700ms API responds with user data
800ms React re-renders with user data
850ms Page is interactive
```

### Code Example

```jsx
import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This runs AFTER component renders
    fetch("/api/users/me")
      .then(r => r.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  return <h1>Welcome {user.name}</h1>;
}
```

### Page Source (Ctrl+U)

```html
<div id="root">
  <!-- Empty container -->
</div>
<script src="/app.js"></script>
```

- No user data in HTML
- Username comes from JavaScript

### Network Tab

```
GET /                    (HTML - empty)
GET /app.js             (JavaScript)
GET /api/users/me       (API call - happens AFTER page loads)
```

### When to Use CSR

✅ **User-specific data**
- "Your cart" - different for each user
- "Your profile" - personalized
- Dashboard with private info

✅ **Highly interactive**
- Forms with validation
- Real-time search
- Drag-and-drop interfaces

✅ **Requires browser APIs**
- localStorage, sessionStorage
- navigator, geolocation
- camera, microphone access

✅ **Frequently changing**
- Live chat
- Stock prices
- Notifications
- Real-time multiplayer

### FastFood Pages Using CSR

- `/` (Login)
- `/register` (Register form)
- `/dashboard` (User's store dashboard)
- `/cart` (User's shopping cart)
- `/checkout` (Address form + map picker)
- `/my-orders` (User's order history)

### Pros ✅

- **Highly interactive** - Instant response to user input
- **User-specific** - Different content per user
- **Real-time** - Live updates via WebSocket
- **Works offline** - Service worker friendly

### Cons ❌

- **Slow first paint** - Loading spinner shown
- **Bad SEO** - Search engines don't see data
- **More JavaScript** - Larger bundle sent to browser
- **Works only with JS** - Fails without JavaScript

---

## SSR: Server-Side Rendering

### What It Is

Server renders HTML **before** sending to browser:
1. Server receives request
2. Server fetches data from database/API
3. Server renders React component to HTML
4. Server sends complete HTML to browser
5. Browser displays immediately

### Timeline

```
Time  Event
0ms   Browser requests /home
50ms  Server receives request
100ms Server fetches stores from database
150ms Server renders React → HTML string
200ms HTML sent to browser
250ms Browser receives complete HTML
300ms User sees page immediately
350ms JavaScript hydration (makes interactive)
```

### Code Example

```typescript
// This runs on SERVER, not browser

async function fetchStores() {
  const res = await fetch("http://api/stores");
  return res.json();
}

export default async function HomePage() {
  const stores = await fetchStores(); // Await on server
  
  return (
    <div>
      <h1>Stores</h1>
      <ul>
        {stores.map(store => (
          <li key={store.id}>{store.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Page Source (Ctrl+U)

```html
<div>
  <h1>Stores</h1>
  <ul>
    <li>Burger King</li>
    <li>McDonald's</li>
    <li>Subway</li>
  </ul>
</div>
```

- Store list is in HTML
- Not loaded by JavaScript

### Network Tab

```
GET /home          (HTML - already includes stores list)
GET /styles.css    (CSS)
GET /app.js        (JavaScript - for hydration)
```

- Single request for page + data
- No separate API call for data

### When to Use SSR

✅ **SEO critical**
- Product pages (should appear in Google)
- Blog posts
- Product descriptions

✅ **Public content**
- Store listings
- Product catalog
- About page

✅ **Need fresh data**
- Current availability
- Stock levels
- Recent prices

✅ **Better performance**
- No loading state needed
- Faster Time to Content Paint

### FastFood Pages Using SSR

- `/home` (Products list) - **Static SSR**
- `/product/[id]` (Product detail) - **Dynamic SSR**
- `/store/[id]` (Store detail) - **Dynamic SSR**

### Pros ✅

- **Faster** - No loading state, data in HTML
- **Better SEO** - Search engines see complete page
- **Better mobile** - Less JavaScript to parse
- **Works without JS** - Falls back gracefully

### Cons ❌

- **Server load** - Server does rendering work
- **Not interactive immediately** - Needs hydration
- **User-specific hard** - Each user gets cached page
- **Dynamic routes slower** - Must render on request

---

## SSG: Static Site Generation

### What It Is

Server pre-renders HTML at **build time** (before app runs):
1. Build command runs
2. Server renders pages to HTML files
3. HTML files stored as static files
4. Deployed to CDN/server
5. Browser requests already-built HTML

### Timeline

```
BUILD TIME:
0s    npm run build command
1s    Next.js processes pages
2s    Server fetches data from database
3s    Renders React → HTML files
4s    HTML files saved to disk
5s    Deployed to server

RUNTIME (User visits page):
0ms   Browser requests /about
10ms  Server serves pre-built HTML file (instant!)
50ms  Browser displays page
```

### Code Example

```typescript
// This runs at BUILD TIME only

async function fetchTeam() {
  const res = await fetch("http://api/team");
  return res.json();
}

export default async function TeamPage() {
  const team = await fetchTeam(); // Runs once at build
  
  return (
    <div>
      <h1>Our Team</h1>
      {team.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  );
}
```

### Page Source (Ctrl+U)

```html
<div>
  <h1>Our Team</h1>
  <div>Alice Johnson</div>
  <div>Bob Smith</div>
  <div>Charlie Brown</div>
</div>
```

- Static HTML, saved at build time
- Same for all users
- Generated once

### Network Tab

```
GET /team          (Static HTML file - served from disk)
GET /styles.css    (CSS)
```

- Single request
- Serves from file, not rendered

### When to Use SSG

✅ **Completely static**
- About page
- Contact page
- Privacy policy

✅ **Performance critical**
- Homepage
- Landing page
- Any must-be-fast page

✅ **No personalization**
- Same content for everyone
- No user-specific data

✅ **Can rebuild periodically**
- Documentation sites
- Blog archives
- News archives

### FastFood Pages Using SSG

- None (all are dynamic or interactive)

### Pros ✅

- **Fastest** - Pure static file serving
- **CDN friendly** - Cache everywhere
- **Cheapest** - No server processing
- **Best SEO** - Static HTML for Google

### Cons ❌

- **No dynamic data** - Can't personalize
- **Stale content** - Must rebuild to update
- **Build time** - Takes time to pre-render many pages
- **User-specific impossible** - Same HTML for all

---

## ISR: Incremental Static Regeneration

### What It Is

Hybrid of SSG + SSR:
1. Page pre-rendered at build time (like SSG)
2. Cached and served instantly (like SSG)
3. After N seconds, page marked "stale"
4. Next request triggers re-render in background
5. New HTML replaces old

### Timeline

```
BUILD TIME:
Store list fetched from database
HTML pre-rendered and cached

RUNTIME - First User:
Request /home → Serve cached HTML → Instant

RUNTIME - After 60 seconds of caching:
Another request /home → Check: Is cache stale? YES
Trigger background re-render (don't block)
Meanwhile, serve OLD HTML to user (still fast)

Background:
Fetch fresh store list from database
Render to new HTML
Replace cache

Next request (after regeneration):
Serve NEW HTML from cache

If store data changes:
Max 60 seconds until users see update
```

### Code Example

```typescript
async function fetchStores() {
  const res = await fetch("http://api/stores", {
    next: { revalidate: 60 } // ← ISR: revalidate every 60 seconds
  });
  return res.json();
}

export default async function Home() {
  const stores = await fetchStores();
  
  return (
    <div>
      {stores.map(store => (
        <div key={store.id}>{store.name}</div>
      ))}
    </div>
  );
}
```

### When to Use ISR

✅ **Public content**
- Product listings (same for all users)
- Store listings
- Category pages

✅ **Need freshness + speed**
- Can tolerate 60-second staleness
- Want instant serve from cache
- Prefer re-render in background

✅ **High traffic**
- Don't want to render on every request
- Want CDN caching benefits
- Need to scale cheaply

### FastFood Pages Using ISR

- `/home` - Revalidates every 60 seconds

### Pros ✅

- **Fast** - Serves from cache instantly
- **Fresh** - Background regeneration keeps data current
- **Scalable** - Thousands of requests without server load
- **SEO** - Google sees complete HTML

### Cons ❌

- **Complex** - Requires understanding revalidation
- **Stale initially** - First user might see old data
- **Monitoring needed** - Need to track regeneration
- **Not real-time** - Can be 60 seconds out of date

---

## Side-by-Side Comparison

| Feature | CSR | SSR | SSG | ISR |
|---------|-----|-----|-----|-----|
| **Rendered** | Browser | Server | Build time | Build time + refresh |
| **When** | On interaction | Per request | Once | Every N seconds |
| **Data fresh** | Instant | Per request | Stale | N-second delay |
| **Performance** | Slower | Fast | Fastest | Fast |
| **SEO** | ⭐ Poor | ⭐⭐⭐⭐⭐ Great | ⭐⭐⭐⭐⭐ Great | ⭐⭐⭐⭐⭐ Great |
| **User-specific** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Interactive** | ✅ Yes | ⚠️ Partial | ❌ No | ❌ No |
| **Build time** | None | None | Long (scales with pages) | Long (scales with pages) |
| **Server load** | Medium | High | Low | Very low |
| **CDN friendly** | ❌ No | ⚠️ Maybe | ✅ Yes | ✅ Yes |
| **Streaming** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |

---

## Decision Flowchart

```
Is this page user-specific?
├─ YES → Use CSR
│        (Different for each logged-in user)
│
└─ NO → Is SEO critical?
         ├─ YES → Is content always fresh?
         │        ├─ YES → Use SSR Dynamic
         │        │        (Re-render on each request)
         │        │
         │        └─ NO → Use ISR or SSG
         │                (Pre-render, refresh periodically)
         │
         └─ NO → Is performance critical?
                  ├─ YES → Use SSG or ISR
                  │        (Fastest possible)
                  │
                  └─ NO → Use CSR
                          (Simplest to implement)
```

---

## FastFood Example Decision Tree

**Login page (`/`)**
- User-specific? YES
- Result: **CSR** ✅
- "Each user logs in differently"

**Products home (`/home`)**
- User-specific? NO
- SEO critical? YES
- Content always fresh? NO (OK to be 60s stale)
- Result: **ISR** ✅
- "Show to everyone, refresh every 60s"

**Product detail (`/product/[id]`)**
- User-specific? NO
- SEO critical? YES
- Content always fresh? YES (prices change)
- Result: **SSR Dynamic** ✅
- "Re-render on each request for latest price"

**Dashboard (`/dashboard`)**
- User-specific? YES
- Result: **CSR** ✅
- "Show user's store data"

---

## Performance Metrics

### Hypothetical Page (100KB of store data)

**CSR:**
```
FCP (First Contentful Paint): 1200ms
LCP (Largest Contentful Paint): 1500ms
TTI (Time to Interactive): 1800ms
Lighthouse: 65/100
```

**SSR:**
```
FCP: 400ms (45% improvement)
LCP: 600ms (40% improvement)
TTI: 1000ms (33% improvement)
Lighthouse: 90/100
```

**ISR/SSG:**
```
FCP: 150ms (87% improvement)
LCP: 200ms (87% improvement)
TTI: 400ms (77% improvement)
Lighthouse: 95/100
```

---

## Hydration

### What Is Hydration?

After server renders HTML and sends to browser:
1. Browser receives HTML (static content)
2. Browser downloads JavaScript
3. Browser runs JavaScript on that HTML
4. JavaScript attaches event listeners
5. Page becomes interactive

**Before hydration:** Static HTML, no events
**After hydration:** Interactive React component

### Example

```typescript
// Server renders this...
export default async function Button() {
  const count = await getCount(); // Rendered on server
  return <button>Count: {count}</button>;
}

// Browser receives this HTML...
<button>Count: 42</button>

// Browser hydrates with this JS...
function Button() {
  const [count, setCount] = useState(42);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}

// Result: Button now clickable!
```

---

## When Strategies Overlap

### Hybrid: SSR + CSR

Some pages use BOTH:

**Server part:**
- Renders product name, image, price
- Fetches data from backend
- Generates HTML

**Client part:**
- "Add to Cart" button (needs auth check)
- Quantity selector (needs interactivity)
- Success notification (needs state)

**Result:** Best of both worlds

### Streaming

Server sends HTML in chunks (advanced):
1. First chunk: Critical content (visible immediately)
2. Second chunk: Images
3. Third chunk: Interactive elements

Makes page FEEL faster than SSR alone.

---

## Migration Path

### From CSR (React) to Next.js

1. **Start:** All CSR (current state)
2. **Identify:** Which pages should be SSR?
   - Public pages? → SSR
   - SEO important? → SSR
   - User-specific? → Keep CSR
3. **Convert:** One page at a time
   - Remove useEffect
   - Use async/await
   - Remove "use client" (for SSR pages)
4. **Test:** Verify SEO, performance
5. **Monitor:** Track Core Web Vitals

### FastFood Migration Path

```
Week 1:
  [CSR] All pages using React + useEffect

Week 2:
  [CSR] Copy to Next.js
        Add "use client" to all pages
        Use /api/proxy/... routes

Week 3:
  [CSR → ISR] Convert /home to SSR
              Revalidate every 60s

Week 4:
  [CSR → SSR] Convert /product/[id] to SSR
              Fetch per request

Result:
  [Hybrid] Mix of CSR (user pages) + SSR (public pages)
```

---

## Summary

Choose your rendering strategy:

1. **User logged in?** → **CSR**
2. **Public product?** → **SSR** or **ISR**
3. **FAQ/About page?** → **SSG** (if static)
4. **High traffic listing?** → **ISR** (cache + refresh)
5. **Default for unsure?** → **Hybrid** (safe choice)

FastFood demonstrates all strategies in one real application.
