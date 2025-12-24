# Railway Deployment Troubleshooting Guide

## Error: "Railpack could not determine how to build the app"

### Symptom
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

Railway is analyzing the root directory and can't find the Node.js backend.

### Root Cause
Your backend is in the `backend/` subdirectory, but Railway is looking in the root directory.

### Solution ✅

**Set the Root Directory in Railway Settings:**

1. Go to **Railway Dashboard**
2. Click on your **Service** (backend)
3. Navigate to **Settings** tab
4. Scroll down to **Service Settings** section
5. Find **Root Directory** field
6. Enter: `backend` (no slashes, just the word "backend")
7. Click **Update** or **Save**
8. Railway will automatically trigger a new deployment

**Wait 2-4 minutes** for Railway to rebuild with the correct directory.

---

## Error: TypeScript Build Fails

### Symptom
```
error TS6133: 'variable' is declared but its value is never read.
error TS2769: No overload matches this call.
```

### Solution ✅
All TypeScript errors have been fixed. If you see build errors:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Verify build works locally:
   ```bash
   cd backend
   npm install
   npm run build
   ```

3. If successful, push to trigger Railway rebuild:
   ```bash
   git push origin main
   ```

---

## Error: Database Connection Failed

### Symptom
```
MongoServerError: Authentication failed
MongooseError: Could not connect to MongoDB
```

### Solutions ✅

**1. Check Connection String Format:**
```bash
# Correct format:
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE?retryWrites=true&w=majority

# Common mistakes:
# ❌ Missing database name
# ❌ Special characters not URL-encoded in password
# ❌ Wrong cluster URL
```

**2. URL-Encode Special Characters:**
If your password has special characters like `@`, `!`, `#`, `$`, encode them:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`

**3. Verify MongoDB Atlas Settings:**
- Network Access → Allow `0.0.0.0/0` (all IPs)
- Database Access → User has read/write permissions
- Connection string is correct

**4. Test Connection String:**
```bash
# In Railway logs, check if MongoDB connection succeeds
# Look for: "✅ MongoDB connected successfully"
```

---

## Error: Health Check Timeout

### Symptom
```
Health check timeout
Service failed to start
```

### Solutions ✅

**1. Verify Health Endpoint Exists:**
The `/health` endpoint is already configured in [backend/src/app.ts:53](backend/src/app.ts#L53)

**2. Check Server Starts:**
View Railway logs for:
```
✓ Server running on port 5000
✓ MongoDB connected successfully
```

**3. Increase Timeout:**
Already configured to 100s in [backend/railway.json](backend/railway.json)

**4. Check Port Configuration:**
Ensure `PORT` environment variable is set to `5000`

---

## Error: CORS Policy Blocked

### Symptom
```
Access to fetch at 'https://your-api.railway.app/api/v1/...' from origin 'https://your-frontend.com' has been blocked by CORS policy
```

### Solution ✅

**Update ALLOWED_ORIGINS in Railway:**

1. Go to Railway → **Variables** tab
2. Find `ALLOWED_ORIGINS`
3. Add your frontend URL:
   ```bash
   ALLOWED_ORIGINS=https://your-admin.vercel.app,https://your-mobile.expo.dev,http://localhost:3000
   ```
4. Multiple origins: Comma-separated, **NO SPACES**
5. No trailing slashes: `https://app.com` ✅ not `https://app.com/` ❌

---

## Error: Environment Variable Not Found

### Symptom
```
Error: Environment variable MONGODB_URI is required
Missing required environment variable: JWT_ACCESS_SECRET
```

### Solution ✅

**Verify All Required Variables Are Set:**

Go to Railway → **Variables** → **Raw Editor** and ensure these exist:

```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
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

**Generate JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Error: OpenAI API Rate Limit / Authentication

### Symptom
```
OpenAI API Error: 401 Unauthorized
OpenAI API Error: 429 Too Many Requests
```

### Solutions ✅

**For 401 Unauthorized:**
- Verify `EMBEDDING_API_KEY` is correct
- Check if API key has been revoked
- Generate new key at https://platform.openai.com/api-keys

**For 429 Rate Limit:**
- Check OpenAI billing and quota
- Reduce search requests temporarily
- Upgrade OpenAI plan if needed

---

## Error: Cloudinary Upload Failed

### Symptom
```
Cloudinary Error: Invalid API key
Upload failed
```

### Solutions ✅

**1. Verify Credentials:**
- `CLOUDINARY_CLOUD_NAME` - Your cloud name (not username)
- `CLOUDINARY_API_KEY` - API key (numbers only)
- `CLOUDINARY_API_SECRET` - API secret (alphanumeric)

**2. Get Credentials:**
Go to Cloudinary Dashboard → Settings → Access Keys

**3. Test Upload:**
Try uploading an image via the admin panel to verify

---

## Error: npm install Fails

### Symptom
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

### Solution ✅

**1. Update package-lock.json:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

**2. Check Node Version:**
Railway uses Node.js 18+ (specified in package.json engines)

---

## Deployment Checklist

Before asking for help, verify:

- [ ] Root directory is set to `backend` in Railway Settings
- [ ] All environment variables are set correctly
- [ ] MongoDB Atlas allows connections from `0.0.0.0/0`
- [ ] OpenAI API key is valid and has billing configured
- [ ] Cloudinary credentials are correct
- [ ] `npm run build` works locally
- [ ] Latest code is pushed to GitHub
- [ ] Railway is connected to correct GitHub branch

---

## Getting Help

### 1. Check Railway Logs
```
Railway Dashboard → Your Service → Deployments → Latest → View Logs
```

Look for specific error messages.

### 2. Test Locally
```bash
cd backend
npm install
npm run build
npm start
```

If it works locally but not on Railway, it's likely an environment variable or configuration issue.

### 3. Railway Discord
Get help from Railway community:
https://discord.gg/railway

### 4. Check Documentation
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Full guide
- [RAILWAY_FIX.md](RAILWAY_FIX.md) - Root directory fix
- [backend/QUICK_DEPLOY.md](backend/QUICK_DEPLOY.md) - Quick start

---

## Common Configuration Mistakes

| Issue | Wrong | Correct |
|-------|-------|---------|
| Root directory | `backend/` or `/backend` | `backend` |
| ALLOWED_ORIGINS | `https://app.com, https://api.com` (space) | `https://app.com,https://api.com` |
| ALLOWED_ORIGINS | `https://app.com/` (trailing slash) | `https://app.com` |
| MONGODB_URI | Missing database name | Include `/social-ecommerce` |
| JWT secrets | Short or predictable | Use crypto.randomBytes(64) |

---

## Quick Diagnostic Commands

Once deployed, test with:

```bash
# Replace YOUR_APP with your Railway domain

# Health check
curl https://YOUR_APP.railway.app/health
# Expected: {"status":"ok","timestamp":"..."}

# API endpoints
curl https://YOUR_APP.railway.app/api/v1/products
curl https://YOUR_APP.railway.app/api/v1/categories

# Test search
curl "https://YOUR_APP.railway.app/api/v1/search?q=laptop&mode=semantic"
```

---

**Status:** Troubleshooting Guide Complete
**Last Updated:** 2025-12-23
