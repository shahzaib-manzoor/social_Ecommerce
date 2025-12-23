# Quick Deploy to Railway - 5 Minute Guide

## Prerequisites Checklist

- [ ] GitHub repository with backend code
- [ ] MongoDB Atlas connection string
- [ ] OpenAI API key
- [ ] Cloudinary credentials
- [ ] 2 JWT secrets (generate below)

### Generate JWT Secrets

```bash
# Run this twice to get 2 different secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 1: Push to GitHub (1 minute)

```bash
cd c:\Users\shahz\social_Ecommerce
git add .
git commit -m "Configure backend for Railway"
git push origin main
```

---

## Step 2: Create Railway Project (1 minute)

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select your repository
4. **Settings → Root Directory:** `backend`

---

## Step 3: Set Environment Variables (2 minutes)

**Railway Dashboard → Variables → Raw Editor**

Paste this (replace with your values):

```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/social-ecommerce?retryWrites=true&w=majority
JWT_ACCESS_SECRET=YOUR_64_CHAR_RANDOM_SECRET_1
JWT_REFRESH_SECRET=YOUR_64_CHAR_RANDOM_SECRET_2
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMBEDDING_API_URL=https://api.openai.com/v1/embeddings
EMBEDDING_API_KEY=sk-YOUR_OPENAI_KEY
EMBEDDING_MODEL=text-embedding-3-small
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_SECRET
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

Click **"Update Variables"**

---

## Step 4: Deploy (1 minute - automatic)

Railway will automatically:
1. Install dependencies
2. Build TypeScript
3. Start server
4. Run health checks

**Wait for:** Green checkmark ✅

---

## Step 5: Test (1 minute)

Get your Railway URL from **Settings → Domains → Generate Domain**

```bash
# Replace YOUR_APP with your Railway domain
curl https://YOUR_APP.up.railway.app/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2025-12-23T..."}
```

---

## Done! 🎉

Your backend is now live at:
```
https://YOUR_APP.up.railway.app/api/v1
```

---

## Update Frontend Apps

### Mobile App

Edit `mobile-app/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.88.69:5002'
  : 'https://YOUR_APP.up.railway.app';
```

### Admin Web

Edit your admin web API config:

```typescript
const API_BASE_URL = 'https://YOUR_APP.up.railway.app';
```

### Update CORS

Go back to **Railway → Variables** and update:

```bash
ALLOWED_ORIGINS=https://your-admin.vercel.app,https://your-mobile.expo.dev
```

---

## Quick Test Commands

```bash
# Health
curl https://YOUR_APP.up.railway.app/health

# Products
curl https://YOUR_APP.up.railway.app/api/v1/products

# Search
curl "https://YOUR_APP.up.railway.app/api/v1/search?q=laptop&mode=semantic"

# Register
curl -X POST https://YOUR_APP.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!@#"}'
```

---

## Troubleshooting

### Build Failed
- Check Railway logs
- Verify all environment variables are set

### Health Check Failed
- Check MongoDB connection string
- Ensure MongoDB Atlas allows 0.0.0.0/0
- View Railway logs for errors

### CORS Error
- Add your frontend URL to `ALLOWED_ORIGINS`
- Comma-separated, no spaces
- No trailing slashes

---

## Full Documentation

For detailed instructions, see:
- [RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md) - Complete guide
- [RAILWAY_CHECKLIST.md](../RAILWAY_CHECKLIST.md) - Full checklist
- [DEPLOYMENT_READY.md](../DEPLOYMENT_READY.md) - Status summary

---

**Total Time:** 5 minutes (if you have all credentials ready)

**Status:** ✅ Ready to deploy
