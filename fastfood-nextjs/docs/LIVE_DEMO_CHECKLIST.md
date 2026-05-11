# Live Demo Checklist

**Purpose:** Verify that the FastFood Next.js migration is ready for a live presentation/demo.

---

## Pre-Demo Setup (30 minutes before)

### Environment Check

- [ ] Backend running
  - [ ] Verify: `curl http://192.168.123.7:3000/api/stores`
  - [ ] Response: `[{ "id": 1, "name": "...", ... }]`
  - [ ] Status: 200 OK

- [ ] Database populated
  - [ ] At least 3 stores in database
  - [ ] At least 10 products across stores
  - [ ] Test user created (email: test@test.com)

- [ ] Next.js dev server running
  - [ ] Terminal: `cd fastfood-nextjs && npm run dev`
  - [ ] Wait for: "✓ Ready in 3.2s"
  - [ ] Verify: `http://localhost:3000` loads

### Browser Setup

- [ ] Chrome/Edge with DevTools
- [ ] Zoom: 100% (or scale for screen size)
- [ ] DevTools: F12 (ready to open)
- [ ] Network tab: Clear (Ctrl+Shift+Del)
- [ ] Cache: "Preserve log" enabled
- [ ] Multiple tabs: Keep one for demo, one for docs

### Demo Machine

- [ ] Resolution: 1920x1080 or larger
- [ ] Browser maximized
- [ ] No notifications (mute Slack, Discord, etc.)
- [ ] Battery: Plugged in
- [ ] No screen lock timeout
- [ ] Presenter notes open (separate screen if possible)

### Data Verification

- [ ] Login test account active
  ```
  Email: test@test.com
  Password: 123456
  ```

- [ ] Test product in store
  ```
  Store: "Burger King" (or similar)
  Product: "Whopper Combo"
  Price: 5.99
  ```

- [ ] Sample order exists
  ```
  User: Test account
  Order: Recent order to reference
  ```

---

## Demo Flow: CSR Page (5 minutes)

### 1. Navigate to Login

- [ ] URL bar: Type `localhost:3000`
- [ ] Show login form
- [ ] Point out: "This is CSR - Client-Side Rendered"

### 2. Open DevTools Network Tab

- [ ] Press F12
- [ ] Switch to Network tab
- [ ] Click "Preserve log"
- [ ] Filter: "XHR" (to see API calls)

### 3. Demonstrate CSR Behavior

- [ ] Refresh page (Ctrl+R)
- [ ] Point out: HTML downloads first, no data in it
- [ ] Enter credentials (test@test.com / 123456)
- [ ] Click Login button
- [ ] Watch Network tab: POST request to `/api/proxy/users/login`
- [ ] Show response: JSON with user data
- [ ] Explain: "Browser made the request, not server"

### 4. View Page Source

- [ ] Right-click → "View page source" (or Ctrl+U)
- [ ] Show: HTML contains form, no user data
- [ ] Search for username in HTML: Not found
- [ ] Explain: "User data loaded by JavaScript"

### 5. Verify localStorage

- [ ] Open DevTools → Application tab
- [ ] Navigate to localStorage
- [ ] Show: `user` key with JSON value
- [ ] Explain: "Auth state stored in browser"

---

## Demo Flow: SSR Static Page (5 minutes)

### 1. Navigate to Products Home

- [ ] Click navigation or type `/home`
- [ ] Show store list immediately (no loading state)
- [ ] Point out: "This is SSR - Server-Side Rendered"

### 2. View Page Source (Ctrl+U)

- [ ] Right-click → "View page source"
- [ ] Scroll down (or Ctrl+F to search)
- [ ] Search for store name (e.g., "Burger King")
- [ ] **FOUND** in HTML source
- [ ] Explain: "Store data is in the HTML itself"
- [ ] Close source view

### 3. Check Network Tab

- [ ] Refresh page (Ctrl+R)
- [ ] Network tab should show:
  - [ ] Initial HTML request (large, ~50KB)
  - [ ] CSS files
  - [ ] JavaScript bundle
  - [ ] **NO XHR requests** for store data
- [ ] Explain: "Server included the data in HTML"

### 4. Demonstrate ISR

- [ ] Point out badge: "Revalidates every 60 seconds"
- [ ] Explain ISR: "Page was pre-rendered at build time, fresh every 60s"
- [ ] Build output shows: `/home ○ (Static)`

---

## Demo Flow: SSR Dynamic Page (5 minutes)

### 1. Click on a Product Card

- [ ] From `/home` page, click on a product
- [ ] URL becomes `/product/1` or `/product/2`
- [ ] Product details appear instantly
- [ ] Point out: "This is SSR Dynamic - unique data per product"

### 2. Navigate to Different Products

- [ ] Manually type `/product/2` in URL
- [ ] Different product appears instantly
- [ ] No loading state
- [ ] Type `/product/3`
- [ ] Another different product
- [ ] Explain: "Each product page is rendered with its own data"

### 3. View Page Source for Different Products

- [ ] On `/product/1`: Ctrl+U → Search for "Whopper" (or product 1)
- [ ] **FOUND**
- [ ] Navigate to `/product/2`
- [ ] Ctrl+U → Search for product 2 name
- [ ] **FOUND** (but different product)
- [ ] Explain: "Each page has unique data in HTML"

### 4. Hybrid Rendering Demo

- [ ] Still on `/product/[id]`
- [ ] Scroll down to "Add to Cart" button
- [ ] Click button
- [ ] Success popup appears
- [ ] Explain: "Product rendered on server, button interaction on client"

---

## Demo Flow: API Proxy (3 minutes)

### 1. Add Item to Cart

- [ ] From product detail, click "Add to Cart"
- [ ] Watch Network tab
- [ ] See POST request to `/api/proxy/cart/add`
- [ ] Show request body: `{ userId, productId, quantity }`
- [ ] Show response: `200 OK`
- [ ] Explain: "Browser sends fetch to `/api/proxy/...`"

### 2. Explain Proxy Flow

- [ ] Show diagram or explain verbally:
  ```
  Browser → /api/proxy/cart/add
         → Next.js intercepts
         → Forwards to backend /api/cart/add
         → Backend responds
         → Response returned to browser
  ```
- [ ] Point out: "Single origin, no CORS issues"

### 3. View Cart

- [ ] Navigate to `/cart`
- [ ] Wait for items to load
- [ ] Network tab shows GET `/api/proxy/cart/[userId]`
- [ ] Show response: JSON with cart items
- [ ] Explain: "Same proxy pattern for all CSR pages"

---

## Demo Flow: Rendering Comparison (3 minutes)

### Show Side-by-Side

**Setup:**
- [ ] Open two browser tabs
- [ ] Tab 1: DevTools open, on Network tab
- [ ] Tab 2: DevTools open, on Network tab

**Tab 1 - CSR Page:**
- [ ] Navigate to `/login`
- [ ] Network shows: HTML, CSS, JS
- [ ] No data loading shown
- [ ] Explain: "CSR - data loads in browser on interaction"

**Tab 2 - SSR Page:**
- [ ] Navigate to `/home`
- [ ] Network shows: Single large HTML (includes data)
- [ ] No separate data request
- [ ] Explain: "SSR - all data in HTML"

**Comparison Table:**
- [ ] Show or reference comparison:
  ```
  | Feature   | CSR | SSR |
  |-----------|-----|-----|
  | HTML size | 10KB | 50KB |
  | Load time | 800ms | 150ms |
  | Rendering| Browser | Server |
  | SEO | No | Yes |
  ```

---

## Demo Flow: Build Output (2 minutes)

### Show Route Configuration

- [ ] Terminal: Run `npm run build`
- [ ] Wait for build to complete
- [ ] Show output:
  ```
  Route (app)               Revalidate
  ├ ○ /
  ├ ○ /home              1m
  ├ ○ /register
  ├ ƒ /product/[id]
  ├ ƒ /store/[id]
  └ ○ /cart
  ```

- [ ] Explain:
  - [ ] `○` = Static (pre-rendered)
  - [ ] `ƒ` = Dynamic (on-demand)
  - [ ] `1m` = ISR revalidation time

### Show Route Types

- [ ] Point out:
  - [ ] `/home`: Static with ISR
  - [ ] `/product/[id]`: Dynamic SSR
  - [ ] `/cart`: Static (but with CSR logic)

---

## Verification Checkpoints

### ✅ Performance

- [ ] `/home` loads in < 300ms
- [ ] No loading spinner
- [ ] Smooth transitions between routes
- [ ] No console errors (F12 → Console)

### ✅ Functionality

- [ ] Login works (test@test.com / 123456)
- [ ] Add to cart works and shows popup
- [ ] Cart displays items
- [ ] Checkout form loads
- [ ] Navigation between pages smooth

### ✅ Data Rendering

- [ ] Ctrl+U on SSR pages shows data
- [ ] Ctrl+U on CSR pages shows minimal HTML
- [ ] Network tab shows correct request patterns
- [ ] Browser API proxy requests work

### ✅ UI Preservation

- [ ] All CSS loaded correctly
- [ ] Layouts match original
- [ ] Colors correct
- [ ] Hover effects work
- [ ] Responsive on different widths
- [ ] Mobile menu works (if applicable)

### ✅ No Errors

- [ ] DevTools Console: No red errors
- [ ] DevTools Network: No 404s or 500s
- [ ] Backend: Logs show successful requests
- [ ] Database: Query logs show activity

---

## Troubleshooting During Demo

### Problem: "Backend not responding"

**Solution:**
1. Check backend: `curl http://192.168.123.7:3000/api/stores`
2. If fails, restart backend: `npm start` in backend folder
3. Wait 3 seconds
4. Retry demo

### Problem: "Page shows loading state"

**Solution:**
1. Might be real loading (SSR pages shouldn't load)
2. Check Network tab for pending requests
3. If backend is slow, acknowledge: "Backend is responding slowly"
4. Have a pre-rendered page screenshot as backup

### Problem: "Add to Cart button doesn't work"

**Solution:**
1. Check localStorage: Open DevTools → Application → localStorage
2. Verify `user` key exists
3. If missing, login first
4. Try again

### Problem: "Network tab shows errors (red)"

**Solution:**
1. Check backend is running
2. Verify proxy route exists: `/api/proxy/[...path]/route.ts`
3. Show error message and explain
4. Have a backup demo video ready

### Problem: "Page source not showing data (for SSR)"

**Solution:**
1. Refresh page (Ctrl+R)
2. Try again
3. If still empty, might be client-side rendering
4. Check build output: `npm run build`
5. Verify page is marked as `○` not `ƒ`

---

## Backup Plans

### If Live Demo Fails

1. **Use recording:**
   - [ ] Have a recorded walkthrough
   - [ ] Show on screen, narrate

2. **Show screenshots:**
   - [ ] Have browser screenshots ready
   - [ ] Annotate to show key points

3. **Show code instead:**
   - [ ] Open VS Code
   - [ ] Explain architecture with code
   - [ ] Show file structure

4. **Demo on different machine:**
   - [ ] Have laptop as backup
   - [ ] Different browser if needed

---

## Post-Demo Actions

- [ ] Ask for feedback
- [ ] Note any questions not fully answered
- [ ] Share repository link
- [ ] Provide setup instructions
- [ ] Collect contact info from interested attendees
- [ ] Send follow-up materials

---

## Demo Time Allocation

| Section | Time | Notes |
|---------|------|-------|
| Setup | 5 min | Have everything ready |
| CSR Demo | 5 min | Show login + network |
| SSR Static Demo | 5 min | Show home + page source |
| SSR Dynamic Demo | 5 min | Show product variations |
| API Proxy Demo | 3 min | Show network flow |
| Comparison | 3 min | Side-by-side analysis |
| Build Output | 2 min | Show route config |
| Q&A | 10 min | Audience questions |
| **Total** | **38 min** | With buffer for delays |

---

## Presenter Notes

- **Slow down:** Point out one thing at a time
- **Narrate:** Explain what viewers are seeing
- **Ask questions:** "Does this show the difference clearly?"
- **Use analogies:** "Like cooking in open kitchen vs prepared plate"
- **Engage:** Ask for questions throughout
- **Stay confident:** You know this migration inside-out

---

## Success Criteria

Demo is successful if audience understands:

- [ ] This is a real production app (not a demo app)
- [ ] UI is preserved exactly
- [ ] Three rendering strategies demonstrated
- [ ] Browser vs server fetching clearly shown
- [ ] Performance improvements visible
- [ ] Migration is incremental and practical

🎯 **Goal:** "They leave wanting to migrate their React app"

