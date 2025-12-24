# Railway Deployment Fix - Root Directory Configuration

## Issue
Railway is analyzing the root directory and can't find the Node.js backend because it's in the `backend/` subdirectory.

## Solution: Configure Root Directory in Railway

### Method 1: Railway Dashboard (RECOMMENDED)

1. Go to your Railway project dashboard
2. Click on your service (backend)
3. Go to **Settings** tab
4. Scroll down to **Service Settings**
5. Find **Root Directory**
6. Set it to: `backend`
7. Click **Update**
8. Railway will automatically redeploy

**Screenshot of where to find this:**
```
Railway Dashboard
└── Your Project
    └── Your Service
        └── Settings
            └── Service Settings
                └── Root Directory: [backend]
```

### Method 2: Use Railway CLI (Alternative)

If you prefer using the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set root directory
railway up --root backend
```

### Method 3: Nixpacks Configuration (Already Done)

I've created configuration files that should help Railway detect the backend:
- ✅ [nixpacks.toml](nixpacks.toml) - Tells Nixpacks to use backend directory
- ✅ [railway.toml](railway.toml) - Railway configuration with backend paths

However, **Method 1 (Dashboard)** is the most reliable approach.

---

## Verification

After setting the root directory, Railway should:

1. **Detect:** Node.js project in `backend/package.json`
2. **Install:** Run `npm install` in backend directory
3. **Build:** Run `npm run build` (TypeScript compilation)
4. **Start:** Run `npm start` to launch server
5. **Health Check:** Verify `/health` endpoint responds

---

## Expected Build Output

Once configured correctly, you should see:

```
✓ Detected Node.js project
✓ Installing dependencies (npm install)
✓ Building TypeScript (npm run build)
✓ Starting server (npm start)
✓ Health check passed (GET /health)
✓ Deployment successful
```

---

## If Build Still Fails

### Check These Settings:

1. **Root Directory:** Should be `backend` (not `backend/` or `/backend`)
2. **Build Command:** Should auto-detect from `package.json` scripts
3. **Start Command:** Should use `npm start`
4. **Environment Variables:** All required vars must be set (see below)

### Required Environment Variables:

Make sure all these are set in **Railway → Variables**:

```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMBEDDING_API_URL=https://api.openai.com/v1/embeddings
EMBEDDING_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ALLOWED_ORIGINS=https://your-frontend.com
```

---

## Alternative: Deploy Backend Only

If you want to deploy only the backend (not the entire monorepo):

### Option A: Create Separate Backend Repo

```bash
# Create new repo for backend only
cd backend
git init
git add .
git commit -m "Initial backend commit"

# Push to new GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/backend-only.git
git push -u origin main
```

Then deploy this repo to Railway (no root directory needed).

### Option B: Use Railway's GitHub Integration

1. Deploy from GitHub as usual
2. Set **Root Directory** to `backend` in Railway settings
3. Railway will only deploy that subdirectory

**Option B is recommended** - it's simpler and keeps your monorepo structure.

---

## Quick Fix Steps (RIGHT NOW)

1. **Go to Railway Dashboard** → Your Project → Your Service
2. **Click Settings** tab
3. **Scroll to "Root Directory"**
4. **Enter:** `backend`
5. **Click Update**
6. **Wait** for automatic redeployment (2-4 minutes)
7. **Check Logs** to verify build success

---

## Monitoring the Build

While Railway rebuilds:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. **View Logs** to see build progress
4. Look for:
   - ✓ `npm install` completes
   - ✓ `npm run build` compiles TypeScript
   - ✓ `npm start` launches server
   - ✓ Health check passes

---

## Success Indicators

You'll know it worked when:
- ✅ Build completes without errors
- ✅ Health check endpoint responds
- ✅ `curl https://your-app.railway.app/health` returns `{"status":"ok"}`
- ✅ Service shows as "Active" in Railway

---

## Common Mistakes to Avoid

❌ **DON'T** set root directory to `backend/` (with trailing slash)
✅ **DO** set root directory to `backend` (no slashes)

❌ **DON'T** set root directory to `/backend` (with leading slash)
✅ **DO** set root directory to `backend` (no slashes)

❌ **DON'T** forget to set environment variables
✅ **DO** copy all variables from `.env.railway` template

---

## Need More Help?

If the build still fails after setting root directory:

1. **Check Railway Logs** - Look for specific error messages
2. **Verify Environment Variables** - Ensure all required vars are set
3. **Test Build Locally** - Run `cd backend && npm run build` to verify
4. **Check MongoDB Atlas** - Ensure network access allows 0.0.0.0/0
5. **Railway Discord** - Get help at https://discord.gg/railway

---

**Status:** Root directory configuration needed
**Action Required:** Set "Root Directory" to `backend` in Railway Settings
**Estimated Time:** 1 minute to configure, 3 minutes for rebuild
