# Railway Deployment Guide - Social E-Commerce Backend

This guide walks you through deploying the Social E-Commerce backend API to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account (sign up at https://railway.app)
2. A GitHub account (for connecting your repository)
3. MongoDB Atlas account (for production database) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
4. OpenAI API key (for semantic search embeddings)
5. Cloudinary account (for image uploads)

---

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

```bash
# If not already a git repository
cd backend
git init
git add .
git commit -m "Initial commit: Social E-commerce Backend"

# Create a new GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Configuration Files

Ensure these files exist in your `backend/` directory:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process file for Railway
- ✅ `.railwayignore` - Files to exclude from deployment
- ✅ `package.json` - Updated with engines and railway scripts
- ✅ `tsconfig.json` - TypeScript configuration

---

## Step 2: Set Up MongoDB Atlas (Production Database)

### 2.1 Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a new cluster (FREE tier M0 is sufficient to start)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/social-ecommerce?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database credentials
7. Keep this connection string handy for Railway environment variables

### 2.2 Configure Network Access

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0) for Railway
4. Click "Confirm"

---

## Step 3: Deploy to Railway

### 3.1 Create a New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select your repository
6. Railway will auto-detect your backend and start deploying

### 3.2 Configure Root Directory (Important!)

If your backend is in a subdirectory:

1. Go to your Railway project
2. Click on your service
3. Go to "Settings" tab
4. Scroll to "Root Directory"
5. Set it to: `backend`
6. Click "Update"

### 3.3 Configure Environment Variables

1. In your Railway service, go to the "Variables" tab
2. Click "Raw Editor"
3. Paste the following variables (replace with your actual values):

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Atlas Connection (REPLACE WITH YOUR MONGODB ATLAS URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/social-ecommerce?retryWrites=true&w=majority

# JWT Secrets (GENERATE SECURE RANDOM STRINGS!)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-in-production-use-random-256-bit-string
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production-use-random-256-bit-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI Embedding API (REPLACE WITH YOUR OPENAI API KEY)
EMBEDDING_API_URL=https://api.openai.com/v1/embeddings
EMBEDDING_API_KEY=sk-your-openai-api-key-here
EMBEDDING_MODEL=text-embedding-3-small

# Cloudinary Image Upload (REPLACE WITH YOUR CLOUDINARY CREDENTIALS)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS - Add your frontend URLs (comma-separated)
ALLOWED_ORIGINS=https://your-admin-web.vercel.app,https://your-mobile-app-domain.com
```

4. Click "Update Variables"

### 3.4 Generate Secure JWT Secrets

Use Node.js to generate secure random secrets:

```bash
# Run in your terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

---

## Step 4: Deploy and Monitor

### 4.1 Trigger Deployment

1. Railway will automatically deploy after setting environment variables
2. Monitor the deployment logs in the "Deployments" tab
3. Wait for the build to complete (usually 2-5 minutes)

### 4.2 Get Your Production URL

1. Once deployed, go to the "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Railway will provide a URL like: `https://your-app-name.up.railway.app`

### 4.3 Test Your Deployment

Test the health check endpoint:

```bash
curl https://your-app-name.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T12:34:56.789Z"
}
```

Test the API:

```bash
curl https://your-app-name.up.railway.app/api/v1/categories
```

---

## Step 5: Update Frontend Configuration

### 5.1 Update Mobile App API URL

Edit `mobile-app/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.88.69:5002' // Local development
  : 'https://your-app-name.up.railway.app'; // Railway production URL
```

### 5.2 Update Admin Web API URL

Edit `admin-web/src/config/api.ts` (or equivalent):

```typescript
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5002'
  : 'https://your-app-name.up.railway.app';
```

### 5.3 Update CORS Origins

Go back to Railway → Variables and update `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://your-admin-web.vercel.app,https://your-mobile-app.expo.dev,exp://192.168.88.69:8081
```

---

## Step 6: Verify Deployment

### 6.1 Check All Endpoints

Test core functionality:

```bash
# Health check
curl https://your-app-name.up.railway.app/health

# Categories
curl https://your-app-name.up.railway.app/api/v1/categories

# Products (with pagination)
curl https://your-app-name.up.railway.app/api/v1/products?page=1&limit=10

# Search (semantic)
curl "https://your-app-name.up.railway.app/api/v1/search?q=laptop&mode=semantic"
```

### 6.2 Test Authentication

```bash
# Register a new user
curl -X POST https://your-app-name.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Login
curl -X POST https://your-app-name.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## Step 7: Monitoring and Logs

### 7.1 View Logs

1. In Railway, go to your service
2. Click "View Logs"
3. Monitor for errors or warnings

### 7.2 Check Metrics

1. Railway provides built-in metrics
2. Monitor CPU, Memory, and Network usage
3. Set up alerts if needed

---

## Troubleshooting

### Issue: Build Fails

**Solution:**
- Check build logs in Railway
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### Issue: Database Connection Errors

**Solution:**
- Verify MongoDB Atlas connection string is correct
- Check if MongoDB Atlas allows connections from `0.0.0.0/0`
- Ensure username/password are URL-encoded if they contain special characters

### Issue: CORS Errors

**Solution:**
- Update `ALLOWED_ORIGINS` environment variable in Railway
- Include your frontend URLs (both development and production)
- Example: `https://admin.vercel.app,https://mobile.expo.dev`

### Issue: OpenAI API Errors (Semantic Search)

**Solution:**
- Verify `EMBEDDING_API_KEY` is valid
- Check OpenAI API quota and billing
- Test API key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $EMBEDDING_API_KEY"`

### Issue: Cloudinary Upload Errors

**Solution:**
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for API usage limits
- Test credentials in Cloudinary dashboard

### Issue: Health Check Timeout

**Solution:**
- Increase `healthcheckTimeout` in `railway.json`
- Check if MongoDB connection is slow
- Verify server starts successfully in logs

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Yes | Server port (Railway sets automatically) | `5000` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Yes | JWT access token secret (64+ characters) | Random hex string |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh token secret (64+ characters) | Random hex string |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry | `7d` |
| `EMBEDDING_API_URL` | Yes | OpenAI API endpoint | `https://api.openai.com/v1/embeddings` |
| `EMBEDDING_API_KEY` | Yes | OpenAI API key | `sk-...` |
| `EMBEDDING_MODEL` | Yes | OpenAI embedding model | `text-embedding-3-small` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `abcdefghijklmnop` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins | `https://app.com,https://admin.com` |

---

## Best Practices

### Security

1. **Never commit `.env` files** - Use Railway's environment variables
2. **Use strong JWT secrets** - Generate with `crypto.randomBytes(64)`
3. **Keep API keys secure** - Never expose in client-side code
4. **Enable HTTPS only** - Railway provides SSL by default
5. **Rotate secrets regularly** - Update JWT secrets every 90 days

### Performance

1. **Use MongoDB indexes** - Ensure text indexes are created for search
2. **Enable caching** - Consider Redis for session storage
3. **Monitor API usage** - Set up OpenAI usage alerts
4. **Optimize images** - Use Cloudinary transformations

### Reliability

1. **Set up monitoring** - Use Railway metrics and logs
2. **Configure auto-restart** - Already set in `railway.json`
3. **Health checks** - Endpoint at `/health` is configured
4. **Database backups** - Enable MongoDB Atlas automatic backups

---

## Continuous Deployment

Railway automatically deploys on every push to your main branch:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```
3. Railway automatically detects changes and redeploys
4. Monitor deployment in Railway dashboard

---

## Custom Domain (Optional)

### Add Your Own Domain

1. In Railway, go to "Settings" → "Domains"
2. Click "Custom Domain"
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Add the CNAME record to your DNS provider:
   - Type: `CNAME`
   - Name: `api` (or your subdomain)
   - Value: `your-app-name.up.railway.app`
5. Wait for DNS propagation (5-60 minutes)
6. Railway will automatically provision SSL certificate

---

## Cost Estimation

Railway pricing (as of 2025):

- **Free Tier**: $5 credit/month (enough for small apps)
- **Pro Plan**: $20/month + usage
- **Typical Backend Cost**: ~$5-15/month for moderate traffic

MongoDB Atlas:
- **Free Tier (M0)**: 512 MB storage (sufficient for development)
- **Paid Tiers**: Start at ~$9/month for production

OpenAI API:
- **text-embedding-3-small**: ~$0.02 per 1M tokens
- Typical cost: $1-5/month for small to medium traffic

Cloudinary:
- **Free Tier**: 25 GB storage, 25 GB bandwidth
- Sufficient for most small to medium applications

---

## Support and Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Update frontend apps with production URLs
3. ✅ Set up monitoring and alerts
4. ✅ Configure custom domain (optional)
5. ✅ Enable MongoDB Atlas backups
6. ✅ Document API endpoints (consider Swagger/OpenAPI)
7. ✅ Set up staging environment (optional)

---

**Deployment Status:** Ready for Railway

**Last Updated:** 2025-12-23

**Railway Configuration Files:**
- [railway.json](backend/railway.json)
- [Procfile](backend/Procfile)
- [.railwayignore](backend/.railwayignore)
- [package.json](backend/package.json) (updated with engines and scripts)

---

**Happy Deploying!** If you encounter any issues, check the Railway logs first and refer to the troubleshooting section above.
