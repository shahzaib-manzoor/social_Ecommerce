# Quick Start Guide

Get the entire social e-commerce platform running in 10 minutes.

## Prerequisites

Install these first:
- Node.js 18+ LTS
- MongoDB 6.0+
- Git
- npm or yarn

## 🚀 Installation (3 Steps)

### Step 1: Backend API

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/social-ecommerce
JWT_ACCESS_SECRET=your-secret-change-this-in-production-123456789
JWT_REFRESH_SECRET=your-refresh-secret-change-this-too-987654321
EMBEDDING_API_URL=https://api.openai.com/v1/embeddings
EMBEDDING_API_KEY=sk-your-openai-key-here
```

Start backend:
```bash
npm run dev
```

Backend running at http://localhost:5000

### Step 2: Admin Panel

Open new terminal:
```bash
cd admin-web
npm install
```

Create `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_IMGBB_API_KEY=your-imgbb-key
```

Start admin panel:
```bash
npm run dev
```

Admin panel at http://localhost:3000

### Step 3: Mobile App

Open new terminal:
```bash
cd mobile-app
npm install
```

Create `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start mobile app:
```bash
npm start
```

## 🎯 First Run Setup

### 1. Create Admin User

Open MongoDB shell or Compass:
```javascript
use social-ecommerce

// Create an admin user
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  passwordHash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW3fQB1qhH1G", // password: admin123
  role: "admin",
  friends: [],
  interests: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or register a user via API and manually update:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### 2. Login to Admin Panel

1. Go to http://localhost:3000/login
2. Email: `admin@example.com`
3. Password: `admin123`

### 3. Create Your First Product

1. Click "Create New Product"
2. Fill in:
   - Title: "iPhone 15 Pro"
   - Description: "Latest Apple smartphone..."
   - Price: 999
   - Category: "Electronics"
   - Tags: "smartphone, tech, apple"
   - Upload image (use ImgBB)
3. Click "Create Product"

Product automatically gets semantic embeddings!

### 4. Test Mobile App

1. Download Expo Go app on your phone
2. Scan QR code from terminal
3. Register a new user
4. Browse products
5. Add to cart
6. Try search

## 🔑 Get API Keys

### OpenAI (for semantic search)
1. Go to https://platform.openai.com
2. Create account
3. Generate API key
4. Add to backend `.env`

### ImgBB (for image uploads)
1. Go to https://api.imgbb.com
2. Sign up
3. Get API key
4. Add to admin `.env`

**Alternative**: Use Cloudinary instead
1. Go to https://cloudinary.com
2. Sign up
3. Get cloud name and preset
4. Update admin `.env`

## 📱 Test All Features

### Admin Features
- ✅ Login as admin
- ✅ Create product
- ✅ Upload images
- ✅ Edit product
- ✅ Delete product
- ✅ View dashboard

### User Features (Mobile)
- ✅ Register account
- ✅ Login
- ✅ Browse products
- ✅ Search products (try "phone" or "laptop")
- ✅ Like products
- ✅ Add to cart
- ✅ Search users
- ✅ Send friend requests
- ✅ Accept friend requests
- ✅ Message friends
- ✅ View profile

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongod --version
# Start MongoDB
mongod
```

### Can't login to admin
```bash
# Check user has admin role
db.users.findOne({ email: "admin@example.com" })
# Should show role: "admin"
```

### Mobile app can't connect
```bash
# Use your computer's IP instead of localhost
# In mobile-app/.env:
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5000/api/v1
```

### Images won't upload
```bash
# Check ImgBB API key is correct
# Or switch to Cloudinary in admin-web/src/services/imageUpload.ts
```

### Semantic search not working
```bash
# Check OpenAI API key
# Products created without embeddings will use keyword search
```

## 📊 Verify Everything Works

Run these API tests:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test1234"}'

# Get products
curl http://localhost:5000/api/v1/products
```

## 🎨 Customize

### Change Theme Color
Edit `mobile-app/src/theme/colors.ts`:
```typescript
primary: '#2d6a4f',  // Change this
```

### Add Product Categories
Common categories to add:
- Electronics
- Fashion
- Home & Garden
- Sports
- Books
- Beauty
- Toys
- Food

### Customize Navigation
Edit `mobile-app/src/navigation/MainNavigator.tsx`

## 📦 Next Steps

1. **Add More Products**: Populate your catalog
2. **Test Social Features**: Create multiple users, send friend requests
3. **Try Semantic Search**: Search "fast computer" or "warm jacket"
4. **Customize UI**: Update colors, fonts, spacing
5. **Deploy**: Follow DEPLOYMENT_GUIDE.md

## 🆘 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in `.env` |
| MongoDB connection failed | Start MongoDB with `mongod` |
| CORS error | Check ALLOWED_ORIGINS in backend `.env` |
| Token expired | App auto-refreshes, or logout/login |
| Search not working | Check OpenAI key or use keyword mode |

## 📚 Documentation

- [README.md](README.md) - Project overview
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Complete mobile app guide
- [backend/README.md](backend/README.md) - API documentation
- [admin-web/README.md](admin-web/README.md) - Admin panel docs

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Admin panel on port 3000
- [ ] Mobile app running
- [ ] Admin user created
- [ ] First product created
- [ ] Mobile user registered
- [ ] Product appears in app
- [ ] Can add to cart
- [ ] Can send friend request

**When all checked, you're ready to develop!**

---

**Time to completion: ~10 minutes**
**Next: Start building your mobile app screens!**
