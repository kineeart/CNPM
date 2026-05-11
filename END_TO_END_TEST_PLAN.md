# End-to-End Integration Test Plan
**Status:** Fixes Applied - Ready for Testing

---

## Applied Fixes Summary

### ✅ Fixed Files

1. **Proxy Route** (`app/api/proxy/[...path]/route.ts`)
   - ✅ Changed default port from 3000 → 5000
   - ✅ Added `/api` prefix to path construction
   - Result: Proxy now correctly forwards to `http://localhost:5000/api/*`

2. **Login Page** (`app/page.tsx`)
   - ✅ Changed path from `/api/proxy/api/auth/login` → `/api/proxy/auth/login`
   - Result: Login now calls correct proxy endpoint

3. **Home Page** (`app/home/page.tsx`)
   - ✅ Changed BACKEND_URL from hardcoded IP to env variable
   - ✅ Updated fetch URLs to include `/api` prefix
   - Result: SSR now fetches from `http://localhost:5000/api/stores` and `/api/products`

4. **Product Detail Page** (`app/product/[id]/page.tsx`)
   - ✅ Changed BACKEND_URL to env variable
   - ✅ Updated fetch URLs to include `/api` prefix
   - Result: SSR now fetches correct endpoints

5. **Store Detail Page** (`app/store/[id]/page.tsx`)
   - ✅ Changed BACKEND_URL to env variable
   - ✅ Updated fetch URLs to include `/api` prefix
   - Result: SSR now fetches correct endpoints

6. **My Orders Page** (`app/my-orders/PopupMap.tsx`)
   - ✅ Added error handling for missing delivery progress endpoint
   - Result: Page won't crash if endpoint is unavailable

---

## Pre-Test Verification Checklist

Before running tests, verify:

- [ ] MySQL is running (`mysql -u root -p1234567 -e "SELECT 1"`)
- [ ] Database exists (`mysql -u root -p1234567 -e "USE fastfood_drone_db; SHOW TABLES;"`)
- [ ] Backend .env exists with correct settings
- [ ] Frontend .env.local exists with `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
- [ ] Node version is 18+ (`node --version`)
- [ ] npm version is 9+ (`npm --version`)

---

## Test Execution Steps

### STEP 1: Start Backend

**Terminal 1:**
```bash
cd d:\CNPM\CCNLTHD\backend
npm install  # (if first time)
npm run dev
```

**Expected Output:**
```
[nodemon] watching path(s): . ...
[nodemon] starting `node server.js`
✅ Database connected successfully!
🚀 Server chạy tại http://0.0.0.0:5000
📡 Backend URL: http://localhost:5000
```

**Verification:**
```bash
# In another terminal
curl http://localhost:5000/ping
# Expected: {"message":"🏓 Server sống!"}

curl http://localhost:5000/api/products
# Expected: JSON array of products
```

---

### STEP 2: Start Frontend

**Terminal 2:**
```bash
cd d:\CNPM\CCNLTHD\fastfood-nextjs
npm install  # (if first time)
npm run dev
```

**Expected Output:**
```
> fastfood-nextjs@0.1.0 dev
> next dev

  ▲ Next.js 16.2.6
  - Local:        http://localhost:3000

✓ Ready in 2.5s
```

---

### STEP 3: Proxy Verification Test

**In Terminal 3 (or browser console):**

```bash
# Test proxy to products endpoint
curl http://localhost:3000/api/proxy/products

# Expected: JSON array of products (same as backend)
```

---

### STEP 4: Test Login Flow (CSR)

**Steps:**
1. Open browser: `http://localhost:3000`
2. You should see login page with email/password fields
3. Enter credentials:
   - Email: `test@test.com`
   - Password: `123456`
4. Click "Đăng nhập" button

**Verification Checklist:**
- [ ] Page loads without errors
- [ ] F12 Console: No "Unexpected token '<'" error
- [ ] F12 Network tab: 
  - POST request to `/api/proxy/auth/login`
  - Response status: 200 or 401 (not 404)
  - Response type: JSON (not HTML)
- [ ] If credentials valid: Redirects to dashboard or home
- [ ] If credentials invalid: Shows error message

**Debug if failed:**
- Check Network tab response content
- If HTML response: Proxy not working correctly
- If JSON error: Backend is responding but rejecting credentials
- Check browser console for exact error

---

### STEP 5: Test Products Page (SSR)

**Steps:**
1. Open browser: `http://localhost:3000/home`
2. Wait for page to load (2-3 seconds)

**Verification Checklist:**
- [ ] Page displays products
- [ ] Page source (Ctrl+U) shows product data in HTML
- [ ] No JavaScript errors in F12 Console
- [ ] No "404" errors in F12 Network tab
- [ ] Page is responsive

**SSR Verification (most important):**
```javascript
// In F12 Console, run:
document.body.innerText.includes("FastFood")  // Should be true
// If true: SSR worked correctly
```

**Alternative check:**
```bash
# In Terminal 3:
curl http://localhost:3000/home | findstr "id="
# Should see HTML with product IDs, not just empty template
```

---

### STEP 6: Test Product Detail (SSR)

**Steps:**
1. From `/home` page, click any product
2. Wait for product detail page to load

**Verification Checklist:**
- [ ] Product detail displays
- [ ] Product name, price, description visible
- [ ] Page source (Ctrl+U) shows product data
- [ ] F12 Console: No errors
- [ ] F12 Network: Single request for `/product/[id]`

---

### STEP 7: Test Store Detail (SSR)

**Steps:**
1. Go to a store link (if home page has stores) or navigate to `/store/1`
2. Wait for page to load

**Verification Checklist:**
- [ ] Store detail displays
- [ ] Store name, address visible
- [ ] Products in store displayed
- [ ] Page source shows data (Ctrl+U)

---

### STEP 8: Test Cart Operations (CSR)

**Steps:**
1. Ensure logged in (from STEP 4)
2. Go to `/home`
3. Click "Thêm vào giỏ hàng" on any product

**Verification Checklist:**
- [ ] Notification appears
- [ ] F12 Network: POST to `/api/proxy/cart/add` → 200 status
- [ ] Response is JSON (not HTML)
- [ ] Go to `/cart`
- [ ] Cart item appears
- [ ] Quantity controls work (increase, decrease)
- [ ] Delete button works

---

### STEP 9: Test Checkout Flow

**Steps:**
1. Go to `/cart`
2. Click "Thanh toán" (or proceed to checkout)
3. Fill form with delivery address
4. Click "Đặt hàng"

**Verification Checklist:**
- [ ] Checkout page loads
- [ ] Form fields visible
- [ ] F12 Network: POST to `/api/proxy/orders` → 200 status
- [ ] Response is JSON with order details
- [ ] Order created successfully
- [ ] Redirects to order confirmation

---

### STEP 10: Test My Orders Page

**Steps:**
1. Go to `/my-orders`
2. Wait for page to load

**Verification Checklist:**
- [ ] Page displays orders list
- [ ] F12 Network: GET to `/api/proxy/orders/user/:userId` → 200 status
- [ ] Orders displayed correctly
- [ ] Map loads (even if delivery progress not available)
- [ ] No console errors

---

## Critical Path Verification

The system is working correctly if ALL of these pass:

| Flow | Endpoint | Status Code | Response Type |
|------|----------|-------------|---------------|
| Login | POST `/api/proxy/auth/login` | 200/401 | JSON |
| Register | POST `/api/proxy/auth/register` | 200/400 | JSON |
| List Stores | GET `/api/proxy/stores` | 200 | JSON |
| List Products | GET `/api/proxy/products` | 200 | JSON |
| Product Detail (SSR) | GET `/product/:id` | 200 | HTML+JSON |
| Store Detail (SSR) | GET `/store/:id` | 200 | HTML+JSON |
| Add to Cart | POST `/api/proxy/cart/add` | 200 | JSON |
| Get Cart | GET `/api/proxy/cart/:userId` | 200 | JSON |
| Create Order | POST `/api/proxy/orders` | 200 | JSON |
| Get Orders | GET `/api/proxy/orders/user/:userId` | 200 | JSON |

---

## Network Tab Inspection Guide

### What to look for in F12 Network tab:

**Good Signs:**
- ✅ Requests to `/api/proxy/*` show 200 status
- ✅ Responses are JSON (Content-Type: application/json)
- ✅ No requests return HTML pages
- ✅ No "Mixed Content" warnings
- ✅ No CORS errors

**Bad Signs:**
- ❌ Requests return 404 with HTML page
- ❌ Requests return "Unexpected token '<'"
- ❌ Responses show HTML instead of JSON
- ❌ CORS errors in console
- ❌ Requests to localhost:3000/api/* (backend should be 5000)

---

## Console Error Interpretation

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Unexpected token '<'` | HTML 404 returned instead of JSON | Check proxy forwarding and backend endpoint |
| `404 Not Found` | Endpoint doesn't exist | Verify endpoint in backend routes |
| `Failed to fetch` | Network error or CORS | Check if backend is running, check proxy settings |
| `Hydration mismatch` | SSR data inconsistent | Clear browser cache, restart frontend |
| `Cannot read property 'id'` | Missing data in response | Check backend response format |

---

## Database Validation

While testing, verify database is working:

```bash
# Login to MySQL
mysql -u root -p1234567 fastfood_drone_db

# Check tables
SHOW TABLES;

# Check if data exists
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM orders;

# Check recent order
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 1;

# Check cart
SELECT * FROM carts WHERE userId = 1;
```

---

## Quick Test Sequence (5 minutes)

If you want a quick sanity check:

```bash
# Terminal 1: Check backend
curl http://localhost:5000/ping
curl http://localhost:5000/api/products | head -50

# Terminal 2: Check proxy
curl http://localhost:3000/api/proxy/products | head -50

# Browser: Quick login test
1. Navigate to http://localhost:3000
2. Enter credentials
3. Check F12 Network → should see /api/proxy/auth/login
4. If successful: System is working!
```

---

## Success Indicators

After all tests, you should see:

### Backend Terminal 1
```
✅ Database connected successfully!
🚀 Server chạy tại http://0.0.0.0:5000
GET /api/auth/login 200 - 150ms
POST /api/products 200 - 50ms
...
```

### Frontend Terminal 2
```
✓ Ready in 2.5s
compiled client and server successfully
...
GET /api/proxy/auth/login (successful)
```

### Browser Network Tab
```
Method  Resource                        Type      Status  Size
GET     /                               document  200     15.2K
GET     /api/proxy/products             fetch     200     8.5K
POST    /api/proxy/auth/login           fetch     200     2.1K
```

### Database
```
Query: SELECT COUNT(*) FROM orders;
Result: 1+ (orders table has data)
```

---

## Troubleshooting Matrix

| Problem | Check | Solution |
|---------|-------|----------|
| 404 HTML responses | Backend running? | Start backend with `npm run dev` |
| Port already in use | `netstat -ano \| findstr :5000` | Kill process: `taskkill /PID xxxxx /F` |
| Database error | MySQL running? | `mysql -u root -p1234567 -e "SELECT 1"` |
| SSR page blank | Environment var? | Check `.env.local` has BACKEND_URL |
| Login fails silently | Network tab | Check response is JSON, not HTML |
| Proxy not forwarding | Proxy code | Check `/api/` is prepended to path |

---

## Next Steps After Successful Tests

1. ✅ All flows passing → Proceed to presentation
2. ❌ Some flows failing → Debug using checklist above
3. ❌ Multiple issues → Review INTEGRATION_STATUS.md

---

**Ready to test? Start with STEP 1: Start Backend**

Good luck! 🚀
