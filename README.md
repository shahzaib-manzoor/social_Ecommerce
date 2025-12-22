# Social E-Commerce Platform

A production-grade full-stack social e-commerce platform combining shopping with social features.

## 🎯 Project Overview

This platform integrates:
- **E-commerce**: Product catalog, shopping cart, secure checkout
- **Social Features**: Friends system, product sharing, direct messaging
- **Semantic Search**: AI-powered intent-based product discovery
- **Admin Panel**: Web-based product management dashboard

## 🏗️ Architecture

```
social-ecommerce-platform/
├── backend/              # Node.js + Express + MongoDB API
├── admin-web/            # React admin dashboard
└── mobile-app/           # React Native user app
```

### Tech Stack

**Backend:**
- Node.js (LTS) + TypeScript
- Express.js REST API
- MongoDB + Mongoose
- JWT Authentication
- OpenAI Embeddings (semantic search)
- Bcrypt password hashing

**Admin Web:**
- React 18 + TypeScript
- Vite build tool
- React Router
- React Hook Form + Zod
- Axios HTTP client
- ImgBB/Cloudinary image upload

**Mobile App:**
- React Native + TypeScript
- React Navigation (Stack + Drawer)
- Redux Toolkit + RTK Query
- React Hook Form + Zod
- AsyncStorage for persistence
- Green & White theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ LTS
- MongoDB 6.0+
- npm or yarn
- Expo CLI (for mobile app)
- OpenAI API key (optional, for semantic search)
- ImgBB API key (for image uploads)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend runs on http://localhost:5000

### 2. Admin Panel Setup

```bash
cd admin-web
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Admin panel runs on http://localhost:3000

### 3. Mobile App Setup

```bash
cd mobile-app
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## 📱 Features

### User Features (Mobile App)
- ✅ User registration and authentication
- ✅ Browse product catalog with semantic search
- ✅ Add products to cart
- ✅ Like and share products
- ✅ Send/accept friend requests
- ✅ Direct messaging with friends
- ✅ View friends' liked products
- ✅ User profile management

### Admin Features (Web Panel)
- ✅ Admin authentication
- ✅ Create/Edit/Delete products
- ✅ Upload product images
- ✅ Auto-generate product embeddings
- ✅ View all products with pagination
- ✅ Dashboard analytics

### Backend API Features
- ✅ RESTful API design
- ✅ JWT access + refresh tokens
- ✅ Role-based access control (user/admin)
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Semantic product search
- ✅ Pagination support

## 🗄️ Database Schema

### Collections

**Users**
```javascript
{
  _id: ObjectId,
  username: String (unique, immutable),
  email: String (unique),
  passwordHash: String,
  avatar: String,
  bio: String,
  friends: [ObjectId],
  interests: [String],
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

**Products**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  images: [String],
  category: String,
  tags: [String],
  embedding: [Number],
  createdBy: ObjectId (admin),
  likes: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

**Cart**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique),
  items: [{
    productId: ObjectId,
    quantity: Number
  }],
  updatedAt: Date
}
```

**FriendRequests**
```javascript
{
  _id: ObjectId,
  from: ObjectId,
  to: ObjectId,
  status: "pending" | "accepted" | "rejected",
  createdAt: Date,
  updatedAt: Date
}
```

**Conversations**
```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (exactly 2),
  messages: [{
    senderId: ObjectId,
    content: String,
    read: Boolean,
    createdAt: Date
  }],
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication Flow

1. User registers with email, username, password
2. Server hashes password with bcrypt (12 rounds)
3. Server generates JWT access token (15min) and refresh token (7 days)
4. Client stores tokens securely
5. Client includes access token in Authorization header
6. On 401 error, client auto-refreshes using refresh token
7. On logout, refresh token is revoked

## 🔍 Semantic Search

The platform uses OpenAI embeddings for intelligent product search:

1. Admin creates product → generates embedding from title + description + tags
2. User searches → query converted to embedding
3. Cosine similarity calculated between query and all products
4. Results ranked by similarity score
5. Fallback to keyword search if embedding fails

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products` - List products (paginated)
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (admin)
- `PUT /api/v1/products/:id` - Update product (admin)
- `DELETE /api/v1/products/:id` - Delete product (admin)
- `POST /api/v1/products/:id/like` - Like/unlike product
- `GET /api/v1/products/friends/liked` - Get friends' liked products

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add to cart
- `PUT /api/v1/cart/items/:productId` - Update quantity
- `DELETE /api/v1/cart/items/:productId` - Remove item
- `DELETE /api/v1/cart` - Clear cart

### Friends
- `POST /api/v1/friends/requests` - Send friend request
- `GET /api/v1/friends/requests` - Get pending requests
- `POST /api/v1/friends/requests/:id/accept` - Accept request
- `POST /api/v1/friends/requests/:id/reject` - Reject request
- `GET /api/v1/friends` - Get friends list
- `DELETE /api/v1/friends/:id` - Remove friend
- `GET /api/v1/friends/search?q=query` - Search users

### Messages
- `POST /api/v1/messages/conversations` - Create conversation
- `GET /api/v1/messages/conversations` - Get all conversations
- `GET /api/v1/messages/conversations/:id` - Get conversation
- `POST /api/v1/messages/conversations/:id/messages` - Send message
- `POST /api/v1/messages/conversations/:id/read` - Mark as read

### Search
- `GET /api/v1/search?q=query&mode=hybrid` - Search products

### Users
- `GET /api/v1/users/:userId` - Get user profile
- `PUT /api/v1/users/profile` - Update profile

## 🎨 Design System

### Colors (Mobile App)
- **Primary**: `#2d6a4f` (Green)
- **Background**: `#ffffff` (White)
- **Text**: `#333333`
- **Text Secondary**: `#666666`
- **Border**: `#dddddd`
- **Error**: `#e63946`
- **Success**: `#2d6a4f`

### Typography
- **Font Family**: System default
- **Title**: 24-32px, bold
- **Subtitle**: 16-20px, semibold
- **Body**: 14-16px, regular
- **Caption**: 12-14px, regular

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Refresh token rotation
- Rate limiting (100 req/15min)
- Helmet security headers
- CORS protection
- Input validation with Zod
- MongoDB injection prevention
- Server-authoritative cart pricing

## 🧪 Testing

Each module should be tested with:
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows

## 📦 Deployment

### Backend
- Deploy to Railway, Render, or Heroku
- Set environment variables
- Connect to MongoDB Atlas

### Admin Web
- Build: `npm run build`
- Deploy to Vercel, Netlify, or Cloudflare Pages

### Mobile App
- Build for iOS: `eas build --platform ios`
- Build for Android: `eas build --platform android`
- Submit to App Store / Play Store

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write self-documenting code
- Add comments for complex logic only

### Git Workflow
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Commit messages: Conventional Commits format

### Environment Variables
- Never commit `.env` files
- Keep `.env.example` updated
- Use different values for dev/prod

## 📄 License

ISC

## 👥 Contributors

Built following production-grade architecture and best practices.

## 🆘 Support

For issues and questions:
- Check documentation
- Review API endpoints
- Test with Postman/Thunder Client
- Check backend logs
