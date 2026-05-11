# Debugging Guide

Troubleshooting common issues in the FastFood Next.js migration.

---

## Debugging Tools

### 1. Browser DevTools (F12)

**Console Tab:**
- Shows JavaScript errors
- Shows console.log() output
- Type JavaScript to test

**Network Tab:**
- Shows HTTP requests
- Shows request/response headers
- Shows request size and timing
- Check "Preserve log" for full history

**Application Tab:**
- localStorage: See stored data
- sessionStorage: Session data
- Cookies: Auth cookies

**Sources Tab:**
- Set breakpoints in code
- Step through JavaScript
- Inspect variables

**Performance Tab:**
- Measure page load time
- See where time is spent
- Identify bottlenecks

### 2. Next.js CLI

```bash
# Start dev server with detailed logging
DEBUG=* npm run dev

# Build with verbose output
npm run build -- --debug

# Test specific route
curl http://localhost:3000/home
curl http://localhost:3000/api/proxy/stores
```

### 3. VS Code Debugger

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

Then press F5 to start debugging.

---

## Common Issues & Solutions

### Issue 1: "Page shows loading state but never loads"

**Symptoms:**
- Page displays "Loading..." or loading spinner
- Spinner spins forever
- Page never shows content

**Possible Causes:**
- Backend API is down
- Network request failed
- API endpoint returns error
- Request timeout

**How to Debug:**

1. **Check Console (F12 → Console)**
   - Look for error messages
   - Common: "TypeError: fetch failed"
   - Common: "Failed to fetch"

2. **Check Network Tab (F12 → Network)**
   - Look for red status codes (4xx, 5xx)
   - See response: Is it JSON or HTML error page?
   - Check timing: Is request hanging?

3. **Test backend directly**
   ```bash
   curl http://192.168.123.7:3000/api/stores
   ```
   - Should return JSON, not error
   - Check status code: 200 or error?

4. **Check localStorage**
   - On login pages: Do you have `user` key?
   - Missing means login failed

**Solution Steps:**
1. Verify backend is running: `npm start` in backend folder
2. Check database has data: `SELECT * FROM stores;`
3. Clear browser cache: Ctrl+Shift+Delete
4. Hard refresh: Ctrl+Shift+R
5. Try different page to isolate issue

---

### Issue 2: "Ctrl+U shows no data for SSR page"

**Symptoms:**
- Visit `/home` (should be SSR)
- Ctrl+U (View Page Source)
- Search for store name: NOT FOUND
- Should be server-rendered but isn't

**Possible Causes:**
- Page is actually CSR, not SSR
- "use client" directive incorrectly added
- Build output wrong
- Cache issue

**How to Debug:**

1. **Check page file**
   ```bash
   cat app/home/page.tsx | head -5
   ```
   - Should NOT have `"use client"` at top
   - Should have `async function` or `export default async`

2. **Check build output**
   ```bash
   npm run build
   ```
   - Look for line: `/home ○ (Static)` or `ƒ` (Dynamic)
   - `○` = Static (good, should have data)
   - `ƒ` = Dynamic (problem, data not in HTML)

3. **Test page after build**
   ```bash
   npm run build
   npm start
   ```
   - Visit `http://localhost:3000/home`
   - Ctrl+U and search
   - Should now see data

**Solution Steps:**
1. Verify page doesn't have `"use client"`
2. Run `npm run build` to rebuild
3. If still not showing, check for errors in build output
4. If `ƒ` instead of `○`, something is making it dynamic
5. Check console for warnings about dynamic features

---

### Issue 3: "Network tab shows XHR error (red status)"

**Symptoms:**
- DevTools Network tab has red entries
- Status code 400, 404, 500
- API call failed
- Page shows error message

**Possible Causes:**
- Backend route doesn't exist
- Wrong URL in fetch
- Missing authentication
- Database error

**How to Debug:**

1. **Identify the request**
   - Click on red entry in Network tab
   - Check URL: `/api/proxy/...` or something else?
   - Note the status code: 400? 404? 500?

2. **Check request details**
   - Click request
   - Go to "Request" tab
   - See what was sent: `method`, `headers`, `body`
   - Compare to what backend expects

3. **Check response**
   - Go to "Response" tab
   - See error message from backend
   - Common: "Invalid email" or "Product not found"

4. **Test API directly**
   ```bash
   curl -X POST http://192.168.123.7:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"123456"}'
   ```
   - Does backend respond correctly?
   - Check status code in response

**Solution Steps:**
1. Check error message in Response tab
2. Verify endpoint exists in backend
3. Verify authentication/headers are correct
4. Test backend directly with curl
5. Check database has the data (SELECT query)

---

### Issue 4: "Build fails with TypeScript error"

**Symptoms:**
- `npm run build` exits with code 1
- Error message about types
- Mentions `.ts` or `.tsx` file

**Possible Causes:**
- Type mismatch
- Missing types
- Function signature wrong
- Props interface incomplete

**How to Debug:**

1. **Read error message**
   ```
   ./app/product/[id]/page.tsx:37:5
   Type 'string' is not assignable to type 'number'
   ```
   - File: `app/product/[id]/page.tsx`
   - Line: 37
   - Column: 5
   - Problem: string vs number

2. **Go to that line**
   - Open file and line number
   - See the code causing error
   - Compare to function signature

3. **Check type definitions**
   - Interfaces match data?
   - Props passed correctly?
   - Returns match signature?

**Solution Steps:**
1. Read full error message carefully
2. Go to exact line/column mentioned
3. Check data types:
   - `productId` should be `number` not `string`?
   - `product` interface includes all fields?
4. Fix type, rebuild
5. If still errors, check nearby code

**Example Fix:**
```typescript
// ❌ WRONG
const productId: number = params.id; // params.id is string!

// ✅ CORRECT
const productId: number = parseInt(params.id);
// or
const productId: string = params.id;
```

---

### Issue 5: "Page works in dev but build fails"

**Symptoms:**
- `npm run dev` works fine
- `npm run build` fails
- Error only during build, not runtime

**Possible Causes:**
- Build-time only issue
- TypeScript strictness
- Node.js API differences
- Timing issue

**How to Debug:**

1. **Run build locally**
   ```bash
   npm run build 2>&1 | grep -A 5 "error"
   ```

2. **Look at build log**
   - Which page has error?
   - What line?
   - What's the error message?

3. **Test locally**
   - Reproduce the build locally
   - Make the same change as the build
   - See if you can fix it

4. **Check for build-time only code**
   - Accessing `window` at top level?
   - Using `setTimeout` at module level?
   - These fail during SSR build

**Solution Steps:**
1. Read full build error
2. Check if code uses browser APIs at module level
3. Move browser API code into client component or useEffect
4. Rebuild with `npm run build`
5. Test with `npm start` after successful build

**Example Issue:**
```typescript
// ❌ FAILS BUILD - window undefined
const windowWidth = window.innerWidth;

export default function Page() {
  return <div>{windowWidth}</div>;
}

// ✅ WORKS - only in client component
"use client";

export default function Page() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(window.innerWidth); // Only runs in browser
  }, []);
  return <div>{width}</div>;
}
```

---

### Issue 6: "Auth not working - localStorage empty"

**Symptoms:**
- Login page shows form
- Submit credentials
- No error, but not logged in
- `user` not in localStorage

**Possible Causes:**
- Fetch to login endpoint failed (silently)
- Response not JSON
- localStorage.setItem not called
- Navigation failed

**How to Debug:**

1. **Check Console (F12)**
   - Any errors logged?
   - Add `console.log` to login handler

2. **Check Network (F12)**
   - POST to `/api/proxy/users/login`
   - Is response 200 or error?
   - What's in response body?

3. **Check localStorage (F12 → Application)**
   - Is `user` key present?
   - What's the value?
   - Is it valid JSON?

4. **Test backend directly**
   ```bash
   curl -X POST http://192.168.123.7:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"123456"}'
   ```

**Solution Steps:**
1. Add console.log to see fetch response
2. Check that response is 200
3. Verify response has required fields
4. Ensure localStorage.setItem is called
5. Test backend endpoint directly

**Example Debug Code:**
```typescript
const handleLogin = async () => {
  console.log("Login clicked"); // Verify function runs
  
  const res = await fetch("/api/proxy/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  
  console.log("Response status:", res.status); // Check status
  
  const data = await res.json();
  console.log("Response data:", data); // See what we got
  
  if (data.id) {
    console.log("Setting user in localStorage");
    localStorage.setItem("user", JSON.stringify(data));
    console.log("localStorage user:", localStorage.getItem("user"));
    router.push("/dashboard");
  }
};
```

---

### Issue 7: "Map not rendering (Leaflet error)"

**Symptoms:**
- Page with map shows blank area
- Console shows: "window is not defined"
- Map component fails

**Possible Causes:**
- Leaflet being imported at top level
- Dynamic import not working
- SSR trying to render Leaflet

**How to Debug:**

1. **Check imports**
   - `import { MapContainer } from "react-leaflet"` at top level?
   - Should be in `dynamic(() => import(...))`

2. **Check for "use client"**
   - Is page marked `"use client"`?
   - If SSR, can't use Leaflet directly

3. **Check dynamic import**
   ```typescript
   const MapComponent = dynamic(() => import("./MapPicker"), {
     ssr: false // ← Must have this!
   });
   ```

**Solution Steps:**
1. Ensure map component is separate file
2. Import with dynamic: `dynamic(() => import("..."))`
3. Add `{ ssr: false }` option
4. Mark map component with `"use client"`
5. Rebuild: `npm run build`

---

### Issue 8: "CORS error - fetch blocked"

**Symptoms:**
- Browser console: "No 'Access-Control-Allow-Origin' header"
- Fetch to backend fails
- Error only in production, not dev

**Possible Causes:**
- Direct call to backend from browser
- Missing proxy route
- Backend CORS not configured

**How to Debug:**

1. **Check Network tab**
   - Is request being sent?
   - See status "Blocked" or "Failed"?
   - Check request headers

2. **Check code**
   ```typescript
   // ❌ WRONG - direct backend call
   fetch("http://192.168.123.7:3000/api/cart")
   
   // ✅ CORRECT - use proxy
   fetch("/api/proxy/cart")
   ```

3. **Verify proxy route exists**
   ```bash
   ls app/api/proxy/\[..path\]/route.ts
   ```

**Solution Steps:**
1. Change all browser fetches to use `/api/proxy/...`
2. Verify proxy route handles all methods
3. Test with curl:
   ```bash
   curl http://localhost:3000/api/proxy/stores
   ```

---

## Performance Debugging

### Slow Page Load?

1. **Use Lighthouse**
   - DevTools → Lighthouse
   - Run audit
   - See bottlenecks

2. **Check Network Tab**
   - Which requests are slowest?
   - Can they be optimized?
   - Are there waterfall delays?

3. **Check Rendering**
   - DevTools → Performance
   - Record page load
   - See where time is spent

4. **Check Backend**
   ```bash
   curl -w "@curl-format.txt" http://192.168.123.7:3000/api/stores
   ```
   - Is backend slow?
   - Is database slow?

### Large JavaScript Bundle?

```bash
npm run build
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
# Opens interactive bundle analyzer
```

---

## Debugging Checklist

### Before asking for help:

- [ ] Check browser console for errors (F12)
- [ ] Check Network tab for failed requests (F12)
- [ ] Check Network → Response for error details
- [ ] Test backend directly with curl
- [ ] Clear cache and refresh (Ctrl+Shift+R)
- [ ] Restart dev server (Ctrl+C, npm run dev)
- [ ] Check that backend is running
- [ ] Check database has test data
- [ ] Read the error message carefully

### When sharing error:

Include:
- [ ] Full error message (copy-paste)
- [ ] Screenshot of Console tab
- [ ] Screenshot of Network tab (red entry)
- [ ] What page/action triggers error
- [ ] Steps to reproduce
- [ ] Does it work in dev or only build?

---

## Debugging Example: Complete Walkthrough

**Problem:** Cart page shows loading spinner forever

**Step 1: Check Console**
```
GET /api/proxy/cart/123 - Failed to fetch
```
→ Fetch is failing

**Step 2: Check Network Tab**
- See POST to `/api/proxy/cart/123`
- Status: 500 Internal Server Error
- Response: `{"error": "Database connection failed"}`

**Step 3: Test Backend**
```bash
curl http://192.168.123.7:3000/api/cart/123
# Response: Cannot GET /api/cart/123
# Realize: backend route is POST not GET!
```

**Step 4: Check Frontend Code**
```typescript
fetch("/api/proxy/cart/123") // ← GET (default)
```

**Step 5: Fix**
```typescript
fetch("/api/proxy/cart/123", { method: "GET" })
```

**Step 6: Test**
- Clear cache, refresh
- Cart page now works

---

## Summary

When debugging:
1. **Use DevTools** - Console and Network tabs are your best friends
2. **Read error messages** - They usually tell you exactly what's wrong
3. **Test isolated** - Use curl to test backend independently
4. **Check logs** - Both browser and server logs have clues
5. **Isolate the issue** - Is it frontend or backend? CSR or SSR?
6. **Reproduce locally** - Get it failing on your machine first
7. **Add logging** - console.log(), server logs help trace flow

Most issues are solved by reading error messages carefully and testing each part independently.
