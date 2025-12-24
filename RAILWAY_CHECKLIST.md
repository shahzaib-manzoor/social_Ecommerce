# Railway Deployment Checklist

Quick checklist to ensure successful Railway deployment.

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code committed and pushed to GitHub
- [ ] `backend/railway.json` exists
- [ ] `backend/Procfile` exists
- [ ] `backend/.railwayignore` exists
- [ ] `backend/package.json` has `engines` field
- [ ] TypeScript builds successfully (`npm run build`)
- [ ] No TypeScript errors

### 2. External Services Setup

#### MongoDB Atlas
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free tier or higher)
- [ ] Database user created with strong password
- [ ] Network access allows `0.0.0.0/0`
- [ ] Connection string copied and ready

#### OpenAI API
- [ ] OpenAI account created
- [ ] API key generated
- [ ] Billing configured (if not using free credits)
- [ ] API key tested and working

#### Cloudinary
- [ ] Cloudinary account created
- [ ] Cloud name noted
- [ ] API key and secret copied
- [ ] Upload preset configured (optional)

### 3. Security Preparation
- [ ] JWT access secret generated (64+ characters)
- [ ] JWT refresh secret generated (64+ characters)
- [ ] All secrets stored securely (password manager)
- [ ] `.env` files excluded from git (.gitignore)

## Railway Deployment Checklist

### 1. Project Setup
- [ ] Railway account created
- [ ] New project created in Railway
- [ ] GitHub repository connected
- [ ] Root directory set to `backend` (if in subdirectory)

### 2. Environment Variables
- [ ] `PORT` = `5000`
- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = MongoDB Atlas connection string
- [ ] `JWT_ACCESS_SECRET` = Your generated secret
- [ ] `JWT_REFRESH_SECRET` = Your generated secret
- [ ] `JWT_ACCESS_EXPIRES_IN` = `15m`
- [ ] `JWT_REFRESH_EXPIRES_IN` = `7d`
- [ ] `EMBEDDING_API_URL` = `https://api.openai.com/v1/embeddings`
- [ ] `EMBEDDING_API_KEY` = Your OpenAI API key
- [ ] `EMBEDDING_MODEL` = `text-embedding-3-small`
- [ ] `CLOUDINARY_CLOUD_NAME` = Your cloud name
- [ ] `CLOUDINARY_API_KEY` = Your API key
- [ ] `CLOUDINARY_API_SECRET` = Your API secret
- [ ] `ALLOWED_ORIGINS` = Your frontend URLs (comma-separated)

### 3. Deployment
- [ ] Variables saved in Railway
- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] No errors in deployment logs
- [ ] Service is running

### 4. Domain Setup
- [ ] Railway domain generated
- [ ] Domain URL copied
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

## Post-Deployment Checklist

### 1. Testing Endpoints
- [ ] Health check: `GET /health` returns `200 OK`
- [ ] Categories: `GET /api/v1/categories` works
- [ ] Products: `GET /api/v1/products` works
- [ ] Search: `GET /api/v1/search?q=test&mode=semantic` works
- [ ] Auth register: `POST /api/v1/auth/register` works
- [ ] Auth login: `POST /api/v1/auth/login` works

### 2. Database Verification
- [ ] MongoDB Atlas shows active connections
- [ ] Collections created automatically
- [ ] Products can be queried
- [ ] Users can register and login

### 3. Frontend Integration
- [ ] Admin web API URL updated to Railway URL
- [ ] Mobile app API URL updated to Railway URL
- [ ] CORS origins include frontend URLs
- [ ] Frontend can connect to backend
- [ ] Authentication works from frontend
- [ ] API calls succeed from frontend

### 4. Monitoring Setup
- [ ] Railway logs accessible
- [ ] No errors in logs
- [ ] Health check responding
- [ ] MongoDB Atlas monitoring active
- [ ] OpenAI API usage tracking (optional)

## Environment-Specific URLs

### Development
```bash
Backend: http://localhost:5002
Admin Web: http://localhost:3000
Mobile App: http://localhost:19006
```

### Production (Railway)
```bash
Backend: https://your-app-name.up.railway.app
Admin Web: https://your-admin-web.vercel.app
Mobile App: https://your-mobile-app.expo.dev
```

## Quick Test Commands

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL

# Health Check
curl https://YOUR_RAILWAY_URL/health

# Get Categories
curl https://YOUR_RAILWAY_URL/api/v1/categories

# Get Products
curl https://YOUR_RAILWAY_URL/api/v1/products?page=1&limit=10

# Semantic Search
curl "https://YOUR_RAILWAY_URL/api/v1/search?q=laptop&mode=semantic"

# Register User
curl -X POST https://YOUR_RAILWAY_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!@#"}'

# Login
curl -X POST https://YOUR_RAILWAY_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

## Common Issues & Solutions

### Build Fails
- ✅ Check Railway logs for specific error
- ✅ Verify `npm run build` works locally
- ✅ Ensure all dependencies in `package.json`

### Database Connection Fails
- ✅ Verify MongoDB Atlas connection string
- ✅ Check MongoDB Atlas network access (0.0.0.0/0)
- ✅ Ensure database user has correct permissions

### CORS Errors
- ✅ Update `ALLOWED_ORIGINS` environment variable
- ✅ Include all frontend URLs
- ✅ No trailing slashes in URLs

### Health Check Fails
- ✅ Increase timeout in `railway.json`
- ✅ Check if server starts properly in logs
- ✅ Verify `/health` endpoint exists

### OpenAI API Errors
- ✅ Verify API key is correct
- ✅ Check OpenAI billing and quota
- ✅ Test API key independently

## Deployment Timeline

Typical deployment takes 3-5 minutes:
1. **Build** (1-2 minutes) - Installing dependencies, compiling TypeScript
2. **Deploy** (30 seconds) - Starting server
3. **Health Check** (10-30 seconds) - Railway verifies health endpoint
4. **Ready** - Service is live

## Success Criteria

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Health check endpoint returns 200 OK
- ✅ All API endpoints respond correctly
- ✅ Database connection is established
- ✅ Frontend apps can connect to backend
- ✅ Authentication and authorization work
- ✅ Image uploads work (Cloudinary)
- ✅ Semantic search returns results

## Next Steps After Successful Deployment

1. **Monitor Performance**
   - Check Railway metrics dashboard
   - Monitor MongoDB Atlas performance
   - Track OpenAI API usage

2. **Set Up Alerts**
   - Railway uptime monitoring
   - MongoDB Atlas alerts
   - OpenAI spending alerts

3. **Configure Backups**
   - Enable MongoDB Atlas automated backups
   - Document recovery procedures

4. **Optimize Costs**
   - Monitor Railway usage
   - Optimize OpenAI embedding calls
   - Review Cloudinary storage

5. **Security Hardening**
   - Rotate JWT secrets regularly
   - Review API rate limits
   - Enable 2FA on all services

---

**Status:** Ready to Deploy ✅

**Estimated Time:** 15-30 minutes (including external service setup)

**Difficulty:** Intermediate

For detailed instructions, see [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
