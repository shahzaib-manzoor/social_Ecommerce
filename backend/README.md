# Social E-Commerce Backend API

Production-grade Node.js + Express + MongoDB backend for social e-commerce platform.

## Features

- **Authentication**: JWT-based auth with refresh token rotation
- **Product Management**: Admin-created catalog with semantic embeddings
- **Cart System**: Server-authoritative pricing and persistence
- **Social Features**: Friends system with friend requests
- **Messaging**: REST-based direct messaging
- **Semantic Search**: OpenAPI-compatible embedding-powered search
- **Security**: Helmet, rate limiting, input validation

## Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- JWT authentication
- Zod validation
- Bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- MongoDB 6.0+
- OpenAI API key (for embeddings, optional)

### Installation

```bash
npm install
```

### Configuration

Create [.env](.env) file based on [.env.example](.env.example):

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `EMBEDDING_API_KEY`: OpenAI API key (optional, for semantic search)

### Running

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Products

- `GET /products` - Get all products (with pagination)
- `GET /products/:id` - Get single product
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)
- `POST /products/:id/like` - Like/unlike product

### Cart

- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:productId` - Update cart item quantity
- `DELETE /cart/items/:productId` - Remove item from cart
- `DELETE /cart` - Clear cart

### Friends

- `POST /friends/requests` - Send friend request
- `GET /friends/requests` - Get pending requests
- `POST /friends/requests/:requestId/accept` - Accept request
- `POST /friends/requests/:requestId/reject` - Reject request
- `GET /friends` - Get friends list
- `DELETE /friends/:friendId` - Remove friend
- `GET /friends/search?q=query` - Search users

### Messages

- `POST /messages/conversations` - Create/get conversation
- `GET /messages/conversations` - Get all conversations
- `GET /messages/conversations/:id` - Get conversation with messages
- `POST /messages/conversations/:id/messages` - Send message
- `POST /messages/conversations/:id/read` - Mark messages as read

### Search

- `GET /search?q=query&mode=hybrid` - Search products
  - Modes: `semantic`, `keyword`, `hybrid`

### Users

- `GET /users/:userId` - Get user profile
- `PUT /users/profile` - Update own profile

## Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "data": { ... }
}
```

Error response:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Database Indexes

The application automatically creates these indexes for optimal performance:

- Users: username, email, role
- Products: title/description (text), category, price, likes, createdAt
- Cart: userId
- FriendRequests: from+to (unique), to+status, from+status
- Conversations: participants, lastMessageAt
- RefreshTokens: token, userId, expiresAt (TTL)

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Refresh token rotation
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS protection
- Input validation with Zod
- MongoDB injection prevention

## Admin Setup

To create an admin user, you can manually insert into MongoDB or modify the registration service temporarily. Admin users have `role: "admin"`.

## License

ISC
