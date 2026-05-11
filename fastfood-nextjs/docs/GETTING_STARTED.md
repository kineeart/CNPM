# Getting Started - FastFood Full Stack Migration

Complete step-by-step guide to run the entire application (Next.js frontend + Express backend).

---

## Prerequisites

### System Requirements

- **Node.js:** v18 or higher
- **npm:** v9 or higher
- **MySQL:** 5.7 or higher (or MariaDB equivalent)

### Check Prerequisites

```bash
node --version     # Should show v18+
npm --version      # Should show v9+
mysql --version    # Should show version
```

### Installed Packages

Frontend will install:
- next@16.2.6
- react@19.2.4
- typescript@5.x

Backend will install:
- express@4.x
- sequelize@6.x
- mysql2@3.x
- nodemon@3.x

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Your Computer (Development)         │
├─────────────────────────────────────────────┤
│                                             │
│  Terminal 1: npm run dev (Frontend)        │
│  ├─ Next.js on http://localhost:3000       │
│  └─ Serves SSR + CSR pages                  │
│                                             │
│  Terminal 2: npm run dev (Backend)         │
│  ├─ Express on http://localhost:5000       │
│  └─ Serves /api/* routes                    │
│                                             │
│  Terminal 3: (Optional) MySQL Workbench   │
│  ├─ View database                          │
│  └─ Run queries if needed                   │
│                                             │
│  MySQL (Local)                              │
│  ├─ Database: fastfood_drone_db             │
│  └─ User: root / Password: 1234567          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Step-by-Step Setup

### Step 1: Verify MySQL is Running

**On Windows:**

```bash
# Option A: Using Command Prompt
mysql -u root -p

# When prompted for password, enter: 1234567

# Should show:
# Welcome to the MySQL monitor. Type 'help' or '\h' for help.
# Type '\c' to clear the current input statement.
# mysql>

# Exit by typing:
exit
```

**Or use MySQL Workbench:**
- Open MySQL Workbench
- Connect to localhost
- Should connect successfully

**Troubleshooting:**
- If "mysql: command not found", MySQL might not be in your PATH
- Try: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql -u root -p`
- Or restart MySQL service: `services.msc` → find MySQL → Start

### Step 2: Verify Backend Environment

**Navigate to backend folder:**

```bash
cd D:\CNPM\CCNLTHD\backend
```

**Verify .env file:**

```bash
# Check if .env exists
type .env

# Should show:
# DB_NAME=fastfood_drone_db
# DB_USER=root
# DB_PASSWORD=1234567
# DB_HOST=localhost
# PORT=5000
```

**If .env is missing or wrong, create/fix it:**

```bash
# Create .env file with correct content
echo DB_NAME=fastfood_drone_db > .env
echo DB_USER=root >> .env
echo DB_PASSWORD=1234567 >> .env
echo DB_HOST=localhost >> .env
echo PORT=5000 >> .env
```

### Step 3: Install Backend Dependencies

```bash
cd D:\CNPM\CCNLTHD\backend
npm install
```

**Expected output:**
```
added 250 packages in 12s
```

**Verify installation:**
```bash
npm list | head -20
```

Should see:
- express@4.x
- sequelize@6.x
- mysql2@3.x
- nodemon@3.x

### Step 4: Verify Frontend Environment

**Navigate to frontend folder:**

```bash
cd D:\CNPM\CCNLTHD\fastfood-nextjs
```

**Verify .env.local file:**

```bash
# Check if .env.local exists
type .env.local

# Should show:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

**If missing or wrong, create/fix it:**

```bash
echo NEXT_PUBLIC_BACKEND_URL=http://localhost:5000 > .env.local
```

### Step 5: Install Frontend Dependencies

```bash
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm install
```

**Expected output:**
```
added 280 packages in 15s
```

### Step 6: Start Backend

**Open Terminal 1:**

```bash
cd D:\CNPM\CCNLTHD\backend
npm run dev
```

**Expected output:**
```
[nodemon] watching path(s): . ...
[nodemon] starting `node server.js`
✅ Database connected successfully!
🚀 Server chạy tại http://0.0.0.0:5000
📡 Backend URL: http://localhost:5000
```

**Verify backend is running:**

In a different terminal (not the one running backend):
```bash
curl http://localhost:5000/ping
# Response: {"message":"🏓 Server sống!"}

curl http://localhost:5000/
# Response: 🚀 Backend FastFood Drone Delivery đang chạy!
```

### Step 7: Start Frontend

**Open Terminal 2:**

```bash
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm run dev
```

**Expected output:**
```
> fastfood-nextjs@0.1.0 dev
> next dev

  ▲ Next.js 16.2.6
  - Local:        http://localhost:3000

✓ Ready in 2.5s
```

### Step 8: Open in Browser

**Terminal 1:** Backend running on 5000 ✅  
**Terminal 2:** Frontend running on 3000 ✅

**Open browser:**
```
http://localhost:3000
```

**Expected:** FastFood login page with all styling

---

## First-Time Verification

### Verify Backend Routes

```bash
# In a new terminal (Terminal 3)

# Test /ping endpoint
curl http://localhost:5000/ping
# Response: {"message":"🏓 Server sống!"}

# Test /api/products
curl http://localhost:5000/api/products
# Response: Array of products (or empty if no data)

# Test /api/stores
curl http://localhost:5000/api/stores
# Response: Array of stores (or empty if no data)
```

### Verify Frontend Proxy

**In browser console (F12):**

```javascript
// Test proxy to backend
fetch("/api/proxy/products")
  .then(r => r.json())
  .then(data => console.log("Products:", data));
```

**Should see:**
- Network tab: Request to `/api/proxy/products` shows `200 OK`
- Console: Products data displayed

### Test Login Flow

1. **Open browser:** http://localhost:3000
2. **See login page** ✅
3. **Enter test credentials:**
   - Email: test@test.com
   - Password: 123456
4. **Click login**
5. **Should redirect to dashboard** ✅
6. **Check Network tab (F12):**
   - Request to `/api/proxy/auth/login` should show 200 OK
7. **Check Application tab (F12):**
   - Should see `user` key in localStorage ✅

### Test Products Page

1. **Open browser:** http://localhost:3000/home
2. **Should see product list** ✅
3. **Check page source (Ctrl+U):**
   - Should see product data in HTML (SSR) ✅
4. **Check Network:**
   - Should see single request for `/home`, not `/api/proxy/products`

### Test Add to Cart

1. **Login first**
2. **Go to /home**
3. **Click "Add to Cart" on a product**
4. **Should see notification**
5. **Check Network tab:**
   - POST to `/api/proxy/cart/add` should show 200 OK ✅
6. **Go to /cart**
7. **Should see item in cart** ✅

---

## Common Issues & Fixes

### Issue: "Port 3000 already in use"

**Symptom:**
```
Error: listen EADDRINUSE :::3000
```

**Fix:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual)
taskkill /PID 12345 /F

# Or run frontend on different port
npm run dev -- -p 3001
```

### Issue: "Port 5000 already in use"

**Same as above, replace 3000 with 5000**

### Issue: "Cannot connect to database"

**Symptom:**
```
❌ Database connection failed: Access denied for user 'root'@'localhost'
```

**Fix:**
```bash
# Verify MySQL is running
mysql -u root -p1234567 -e "SELECT 1"
# Should return: 1

# If password wrong, check .env file
type D:\CNPM\CCNLTHD\backend\.env

# Update password if needed
# DB_PASSWORD=1234567
```

### Issue: "Database does not exist"

**Symptom:**
```
Error: Unknown database 'fastfood_drone_db'
```

**Fix:**
```bash
# Create database
mysql -u root -p1234567 -e "CREATE DATABASE fastfood_drone_db"

# Restart backend
# Press Ctrl+C in Terminal 1
# Run npm run dev again
```

### Issue: "Frontend can't reach backend"

**Symptom:** Console shows "fetch failed" or "Network error"

**Fix:**
```bash
# 1. Verify backend is running
curl http://localhost:5000/ping

# 2. Verify .env.local
type D:\CNPM\CCNLTHD\fastfood-nextjs\.env.local
# Should show: NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# 3. Restart frontend
# Press Ctrl+C in Terminal 2
# Run npm run dev again
```

### Issue: "npm install fails"

**Symptom:**
```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/...
```

**Fix:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or specify registry
npm config set registry https://registry.npmjs.org/
npm install
```

### Issue: "Cannot find module 'sequelize'"

**Symptom:**
```
Error: Cannot find module 'sequelize'
```

**Fix:**
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

---

## Development Workflow

### Normal Workflow

**Terminal 1: Backend (leave running)**
```bash
cd D:\CNPM\CCNLTHD\backend
npm run dev

# Automatically restarts on file changes
# Modify any controller/route → saved → auto-restart
```

**Terminal 2: Frontend (leave running)**
```bash
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm run dev

# Automatically hot-reloads on file changes
# Modify any component/page → saved → refresh browser
```

**Terminal 3: Testing (as needed)**
```bash
# Test endpoints
curl http://localhost:5000/api/products

# Test proxy
curl http://localhost:3000/api/proxy/products
```

### Making Changes

**Backend change:**
1. Edit file in `backend/src/...`
2. Save
3. Nodemon automatically restarts (see Terminal 1)
4. Test in browser → should work with new code

**Frontend change:**
1. Edit file in `fastfood-nextjs/app/...`
2. Save
3. Next.js hot-reloads (see Terminal 2)
4. Browser refreshes automatically
5. Should see new code

---

## Running Tests

### Test Backend Endpoints

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get all products
curl http://localhost:5000/api/products

# Get all stores
curl http://localhost:5000/api/stores

# Get user addresses (assuming userId=1)
curl http://localhost:5000/api/address

# Create order (POST with JSON body)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[],"totalPrice":0}'
```

### Test Frontend Proxy

**In browser console (F12 → Console):**

```javascript
// Test proxy endpoints
fetch("/api/proxy/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "test@test.com",
    password: "123456"
  })
})
.then(r => r.json())
.then(data => console.log("Login response:", data));

// Test GET through proxy
fetch("/api/proxy/products")
  .then(r => r.json())
  .then(data => console.log("Products:", data));
```

---

## Production Build

### Build Frontend

```bash
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm run build
```

**Expected output:**
```
✓ Creating an optimized production build
✓ Compiled successfully

Route (app)                                        Revalidate   Expire
┌ ○ /
├ ○ /home                                             1m       1y
├ ○ /product/[id]
├ ○ /store/[id]
...

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Run Production Frontend

```bash
npm start
```

**Expected output:**
```
> fastfood-nextjs@0.1.0 start
> next start

  ▲ Next.js 16.2.6
  - Local: http://localhost:3000

```

### Run Production Backend

```bash
cd D:\CNPM\CCNLTHD\backend
npm start
```

---

## Monitoring

### Check Running Processes

```bash
# See what's using ports 3000 and 5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

### View Logs

**Backend logs** (Terminal 1):
- Shows database connection status
- Shows requests being made
- Shows errors if any

**Frontend logs** (Terminal 2):
- Shows build output
- Shows hot-reload events
- Shows errors if any

### Enable SQL Logging (Backend)

Edit `backend/src/config/database.js`:

```javascript
export const sequelize = new Sequelize(
  process.env.DB_NAME || "fastfood_drone_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "1234567",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: console.log  // ← Change from false to console.log
  }
);
```

Restart backend to see all SQL queries.

---

## Stopping Services

### Stop Frontend

```bash
# In Terminal 2
Ctrl+C
# Terminal returns to prompt
```

### Stop Backend

```bash
# In Terminal 1
Ctrl+C
# Terminal returns to prompt
```

### Stop MySQL (if you want)

**Windows:**
```bash
# Option 1: Services
services.msc
# Find "MySQL80" or "MySQL Server" → Stop

# Option 2: Command line
net stop MySQL80
# Or
net stop "MySQL80"
```

---

## File Structure Reference

```
D:\CNPM\CCNLTHD\
├── backend/
│   ├── .env                 ← Configuration (DB, PORT)
│   ├── server.js            ← Entry point
│   ├── package.json         ← Dependencies
│   ├── src/
│   │   ├── routes/          ← API routes
│   │   ├── controllers/     ← Business logic
│   │   ├── models/          ← Database models
│   │   ├── config/          ← Configuration
│   │   └── middleware/      ← Auth, validation, etc.
│   └── node_modules/        ← Installed packages
│
└── fastfood-nextjs/
    ├── .env.local           ← Frontend env (BACKEND_URL)
    ├── package.json         ← Dependencies
    ├── app/
    │   ├── page.tsx         ← Pages
    │   ├── api/proxy/       ← API proxy routes
    │   ├── styles/          ← CSS files
    │   └── components/      ← React components
    ├── docs/                ← Documentation
    └── node_modules/        ← Installed packages
```

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [BACKEND_SETUP.md](BACKEND_SETUP.md) | Detailed backend setup |
| [API_ROUTE_MAP.md](API_ROUTE_MAP.md) | Complete API endpoint reference |
| [PROXY_ARCHITECTURE.md](PROXY_ARCHITECTURE.md) | How the proxy works |
| [INCREMENTAL_MIGRATION.md](INCREMENTAL_MIGRATION.md) | Why this architecture |
| [guides/DEBUGGING_GUIDE.md](guides/DEBUGGING_GUIDE.md) | Troubleshooting |

---

## Quick Commands Reference

```bash
# Backend
cd D:\CNPM\CCNLTHD\backend
npm install                 # Install once
npm run dev                 # Development (with auto-restart)
npm start                   # Production

# Frontend  
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm install                 # Install once
npm run dev                 # Development (with hot-reload)
npm run build               # Build for production
npm start                   # Run production build

# Testing
curl http://localhost:5000/ping              # Test backend
curl http://localhost:3000/                  # Test frontend
curl http://localhost:3000/api/proxy/products # Test proxy
```

---

## Success Checklist

- [ ] MySQL is running
- [ ] Backend .env is correct
- [ ] Frontend .env.local is correct
- [ ] `npm install` completed in both folders
- [ ] Backend `npm run dev` shows "Database connected"
- [ ] Frontend `npm run dev` shows "Ready in X.Xs"
- [ ] Browser shows login page at http://localhost:3000
- [ ] Backend shows requests in logs
- [ ] F12 Console has no errors
- [ ] Can login with test@test.com / 123456
- [ ] Redirects to dashboard after login
- [ ] Can see products on /home
- [ ] Can add items to cart
- [ ] Full flow works end-to-end ✅

---

## Getting Help

1. **Check relevant documentation:**
   - Backend issue? → [BACKEND_SETUP.md](BACKEND_SETUP.md)
   - API endpoint question? → [API_ROUTE_MAP.md](API_ROUTE_MAP.md)
   - How proxy works? → [PROXY_ARCHITECTURE.md](PROXY_ARCHITECTURE.md)
   - Something broken? → [guides/DEBUGGING_GUIDE.md](guides/DEBUGGING_GUIDE.md)

2. **Check logs:**
   - Backend logs (Terminal 1): Database connection, requests
   - Frontend logs (Terminal 2): Build output, hot-reload
   - Browser console (F12): JavaScript errors

3. **Test isolated:**
   - Backend: `curl http://localhost:5000/ping`
   - Frontend: `http://localhost:3000`
   - Proxy: `curl http://localhost:3000/api/proxy/products`

---

**Last Updated:** May 10, 2026  
**Status:** Complete and tested  
**Ready for:** Development and Production

Next step: Choose a feature to develop or deploy! 🚀
