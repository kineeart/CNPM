# Backend Setup Guide - FastFood Express.js

Complete instructions for setting up and running the Express backend.

---

## Quick Start (TL;DR)

```bash
# Terminal 1: Start the backend
cd D:\CNPM\CCNLTHD\backend
npm install
npm run dev

# Terminal 2: Start the frontend
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm run dev

# Visit: http://localhost:3000
```

Backend will run on: `http://localhost:5000`

---

## Detailed Setup

### Step 1: Verify Prerequisites

**Check Node.js version:**
```bash
node --version   # Should be v18+ or v20+
npm --version    # Should be v9+
```

**Check MySQL:**
```bash
mysql --version
```
Or use MySQL Workbench to verify connection.

### Step 2: Backend Installation

**Navigate to backend:**
```bash
cd D:\CNPM\CCNLTHD\backend
```

**Install dependencies:**
```bash
npm install
```

This installs:
- express: Web framework
- sequelize: ORM for MySQL
- mysql2: MySQL driver
- cors: CORS middleware
- bcryptjs: Password hashing
- jsonwebtoken: JWT auth
- dotenv: Environment variables
- nodemon: Development auto-reload

**Verify installation:**
```bash
npm list
```

### Step 3: Database Configuration

**File:** `D:\CNPM\CCNLTHD\backend\.env`

Current configuration:
```
DB_NAME=fastfood_drone_db
DB_USER=root
DB_PASSWORD=1234567
DB_HOST=localhost
PORT=5000
```

**Change if needed:**
- `DB_HOST=localhost` → your MySQL host (or 127.0.0.1)
- `DB_USER=root` → your MySQL user
- `DB_PASSWORD=1234567` → your MySQL password
- `PORT=5000` → change backend port (if needed)

**Note:** Port 5000 is chosen to avoid conflict with Next.js (port 3000)

### Step 4: Create/Verify MySQL Database

**Option A: Using MySQL CLI**

```bash
mysql -u root -p
# Enter password: 1234567

# Check if database exists
SHOW DATABASES;

# If not exists, create it:
CREATE DATABASE fastfood_drone_db;

# Exit
EXIT;
```

**Option B: Using MySQL Workbench**

1. Connect to MySQL server
2. Right-click "Databases" → "Create Database"
3. Name: `fastfood_drone_db`
4. Click "Apply"

**Option C: Check if tables exist**

```bash
mysql -u root -p1234567 fastfood_drone_db -e "SHOW TABLES;"
```

If tables are empty, Sequelize will create them on first run.

### Step 5: Start Backend

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Expected output:**
```
🚀 Server chạy tại http://0.0.0.0:5000
🧠 Connected DB: fastfood_drone_db
✅ Database connected successfully!
```

**If something goes wrong:**
- Check port 5000 is not already in use: `netstat -ano | findstr :5000`
- Check MySQL is running and accessible
- Check .env file has correct credentials

### Step 6: Verify Backend is Running

**Method 1: Browser**
```
http://localhost:5000/
→ Shows: "🚀 Backend FastFood Drone Delivery đang chạy!"

http://localhost:5000/ping
→ Shows: {"message":"🏓 Server sống!"}
```

**Method 2: curl**
```bash
curl http://localhost:5000/ping
# Response: {"message":"🏓 Server sống!"}

curl http://localhost:5000/
# Response: 🚀 Backend FastFood Drone Delivery đang chạy!
```

**Method 3: Check all routes**
```bash
# Login endpoint exists
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Products endpoint exists
curl http://localhost:5000/api/products

# Stores endpoint exists
curl http://localhost:5000/api/stores
```

---

## Environment Configuration

### Backend (.env)

Location: `D:\CNPM\CCNLTHD\backend\.env`

```env
# Database
DB_NAME=fastfood_drone_db
DB_USER=root
DB_PASSWORD=1234567
DB_HOST=localhost

# Server
PORT=5000

# Optional: JWT secret (if used)
# JWT_SECRET=your-secret-key-here

# Optional: Node environment
# NODE_ENV=development
```

### Frontend (.env.local)

Location: `D:\CNPM\CCNLTHD\fastfood-nextjs\.env.local`

```env
# Points to backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

**When frontend starts, it will:**
1. Read `NEXT_PUBLIC_BACKEND_URL`
2. Use it in API proxy route
3. Forward requests to backend

---

## Troubleshooting

### Issue 1: "Port 5000 already in use"

**Symptom:** Port 5000 is already in use by another process

**Solution:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual)
taskkill /PID 12345 /F

# Or change backend port in .env:
# PORT=5001
```

### Issue 2: "Cannot connect to database"

**Symptom:** Error "Access denied for user 'root'@'localhost'"

**Solution:**
1. Verify MySQL is running
2. Verify credentials in .env are correct
3. Test connection:
   ```bash
   mysql -u root -p1234567 -h localhost -e "SELECT 1"
   # Should return: 1
   ```

### Issue 3: "Database does not exist"

**Symptom:** Error "Unknown database 'fastfood_drone_db'"

**Solution:**
```bash
# Create the database
mysql -u root -p1234567 -e "CREATE DATABASE fastfood_drone_db"

# Restart backend (it will create tables)
npm run dev
```

### Issue 4: "Module not found"

**Symptom:** Error "Cannot find module 'express'"

**Solution:**
```bash
# Reinstall node_modules
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Issue 5: Backend runs but frontend can't connect

**Symptom:** Network errors in frontend console

**Solution:**
1. Verify backend is running: `curl http://localhost:5000/ping`
2. Check .env.local has correct URL:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```
3. Restart frontend: `npm run dev` in fastfood-nextjs folder
4. Check Network tab in browser DevTools

---

## Database Structure

### Tables Created by Sequelize

The backend will automatically create these tables:
- `users` - User accounts
- `stores` - Store information
- `products` - Product catalog
- `categories` - Product categories
- `carts` - Shopping carts
- `cartItems` - Items in carts
- `orders` - Orders
- `orderItems` - Items in orders
- `payments` - Payment records
- `paymentMethods` - Payment methods
- `addresses` - Delivery addresses
- `droneDeliveries` - Drone tracking

### Sample Data

After backend starts, you can test with:
```bash
# Login with default test user (check backend seeds if exists)
Email: test@test.com
Password: 123456

# Or check if there's a seeds folder
# npm run seed (if available)
```

---

## Development Workflow

### Terminal Setup (Recommended)

**Terminal 1: Backend**
```bash
cd D:\CNPM\CCNLTHD\backend
npm run dev
```

**Terminal 2: Frontend**
```bash
cd D:\CNPM\CCNLTHD\fastfood-nextjs
npm run dev
```

**Terminal 3: Database/Monitoring (Optional)**
```bash
# Monitor MySQL
mysql -u root -p1234567 -e "SHOW PROCESSLIST;"

# Or open MySQL Workbench
# Or open DBeaver
```

### Making Backend Changes

With `npm run dev` running:
1. Edit backend file (e.g., controller, route)
2. Save file
3. Nodemon automatically restarts server
4. Test in frontend (no restart needed)

### API Testing During Development

**Option 1: Browser**
```
http://localhost:5000/api/products
http://localhost:5000/api/stores
http://localhost:5000/api/cart/user/5
```

**Option 2: curl**
```bash
curl http://localhost:5000/api/products | jq
curl http://localhost:5000/api/stores | jq
```

**Option 3: Postman/Insomnia**
- Import these endpoints
- Test GET, POST, PUT, DELETE
- Verify responses

**Option 4: Frontend Console**
```javascript
// In browser F12 console
fetch("/api/proxy/products").then(r => r.json()).then(console.log)
```

---

## Production Deployment

### Build for Production

```bash
npm run build
```

### Run Production

```bash
npm start
```

### Environment Variables for Production

Create `.env.production` or set system environment variables:

```env
# Production database (might be remote)
DB_HOST=your-production-db-host
DB_USER=prod_user
DB_PASSWORD=your-secure-password
DB_NAME=fastfood_drone_db

# Production port
PORT=5000

# Production settings
NODE_ENV=production
```

### Deployment Options

**Option 1: Virtual Server (DigitalOcean, AWS, etc.)**
```bash
# On server
git clone <repo>
cd backend
npm install
npm start
# Run with PM2 for process management
npm install -g pm2
pm2 start server.js --name "fastfood-backend"
```

**Option 2: Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Option 3: Heroku/Railway**
```bash
git push heroku main
# Should deploy automatically
```

---

## Monitoring & Logging

### Check Process

```bash
# See if backend is running
netstat -ano | findstr :5000

# If PID 12345, see details
tasklist | findstr 12345
```

### View Logs

With `npm run dev`, logs appear in terminal:
```
🚀 Server chạy tại http://0.0.0.0:5000
🧠 Connected DB: fastfood_drone_db
✅ Database connected successfully!
```

### Enable SQL Logging

Edit `D:\CNPM\CCNLTHD\backend\src\config\database.js`:

Change:
```javascript
logging: false  // ← disable logging
```

To:
```javascript
logging: console.log  // ← enable logging
```

Restart backend to see all SQL queries.

---

## Security Checklist

Before production:

- [ ] Change default MySQL password
- [ ] Don't commit .env files to git (use .gitignore)
- [ ] Use environment-specific config
- [ ] Enable JWT authentication
- [ ] Validate all inputs on backend
- [ ] Use HTTPS (not just HTTP)
- [ ] Set CORS to specific domain (not "*")
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Add error handling

---

## Common Commands Reference

```bash
# Start development server
npm run dev

# Start production server
npm start

# Install dependencies
npm install

# List installed packages
npm list

# Check Node version
node --version

# Check npm version
npm --version

# Update packages
npm update

# Test MySQL connection
mysql -u root -p1234567 -h localhost -e "SELECT VERSION();"

# View MySQL databases
mysql -u root -p1234567 -e "SHOW DATABASES;"

# View MySQL tables
mysql -u root -p1234567 fastfood_drone_db -e "SHOW TABLES;"
```

---

## Next Steps

1. **Backend is ready?**
   - Run `npm run dev`
   - Verify port 5000 shows homepage

2. **Connect frontend:**
   - Verify `.env.local` has `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
   - Run `npm run dev` in frontend folder

3. **Test full flow:**
   - Open http://localhost:3000
   - Try logging in
   - Check Network tab to see proxy requests

4. **Debug if needed:**
   - See [docs/guides/DEBUGGING_GUIDE.md](../../guides/DEBUGGING_GUIDE.md)
   - Check [docs/API_ROUTE_MAP.md](../API_ROUTE_MAP.md)

---

**Location:** D:\CNPM\CCNLTHD\backend  
**Database:** MySQL (fastfood_drone_db)  
**ORM:** Sequelize  
**Port:** 5000 (development)  
**Last Updated:** May 10, 2026
