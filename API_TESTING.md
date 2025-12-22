# API Testing Guide

Quick reference for testing all API endpoints.

## Base URL
```
http://localhost:5000/api/v1
```

## 🧪 Quick Tests

### Health Check
```bash
curl http://localhost:5000/health
```

Expected: `{"status":"ok","timestamp":"..."}`

---

## 🔐 Authentication

### 1. Register User
```bash
POST /auth/register

Body:
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123456"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 2. Login
```bash
POST /auth/login

Body:
{
  "email": "test@example.com",
  "password": "test123456"
}
```

### 3. Get Current User
```bash
GET /auth/me

Headers:
Authorization: Bearer {accessToken}
```

### 4. Refresh Token
```bash
POST /auth/refresh

Body:
{
  "refreshToken": "{refreshToken}"
}
```

### 5. Logout
```bash
POST /auth/logout

Body:
{
  "refreshToken": "{refreshToken}"
}
```

---

## 📦 Products

### 1. Get All Products
```bash
GET /products?page=1&limit=20&category=Electronics

Response:
{
  "success": true,
  "data": {
    "products": [...],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### 2. Get Single Product
```bash
GET /products/{productId}
```

### 3. Create Product (Admin Only)
```bash
POST /products

Headers:
Authorization: Bearer {adminAccessToken}

Body:
{
  "title": "iPhone 15 Pro",
  "description": "Latest Apple smartphone with A17 chip",
  "price": 999,
  "images": ["https://example.com/image.jpg"],
  "category": "Electronics",
  "tags": ["smartphone", "apple", "tech"]
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "iPhone 15 Pro",
    "embedding": [...], // Auto-generated
    ...
  }
}
```

### 4. Update Product (Admin Only)
```bash
PUT /products/{productId}

Headers:
Authorization: Bearer {adminAccessToken}

Body:
{
  "price": 899,
  "description": "Updated description"
}
```

### 5. Delete Product (Admin Only)
```bash
DELETE /products/{productId}

Headers:
Authorization: Bearer {adminAccessToken}
```

### 6. Like/Unlike Product
```bash
POST /products/{productId}/like

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "likes": ["userId1", "userId2"]
  }
}
```

### 7. Get Friends' Liked Products
```bash
GET /products/friends/liked?page=1&limit=20

Headers:
Authorization: Bearer {accessToken}
```

---

## 🛒 Cart

### 1. Get Cart
```bash
GET /cart

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [
      {
        "product": {...},
        "quantity": 2,
        "subtotal": 1998
      }
    ],
    "total": 1998
  }
}
```

### 2. Add to Cart
```bash
POST /cart/items

Headers:
Authorization: Bearer {accessToken}

Body:
{
  "productId": "{productId}",
  "quantity": 2
}
```

### 3. Update Cart Item
```bash
PUT /cart/items/{productId}

Headers:
Authorization: Bearer {accessToken}

Body:
{
  "quantity": 3
}
```

### 4. Remove from Cart
```bash
DELETE /cart/items/{productId}

Headers:
Authorization: Bearer {accessToken}
```

### 5. Clear Cart
```bash
DELETE /cart

Headers:
Authorization: Bearer {accessToken}
```

---

## 👥 Friends

### 1. Send Friend Request
```bash
POST /friends/requests

Headers:
Authorization: Bearer {accessToken}

Body:
{
  "userId": "{targetUserId}"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "from": "...",
    "to": "...",
    "status": "pending"
  }
}
```

### 2. Get Pending Requests
```bash
GET /friends/requests

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "from": {...},
      "status": "pending"
    }
  ]
}
```

### 3. Accept Friend Request
```bash
POST /friends/requests/{requestId}/accept

Headers:
Authorization: Bearer {accessToken}
```

### 4. Reject Friend Request
```bash
POST /friends/requests/{requestId}/reject

Headers:
Authorization: Bearer {accessToken}
```

### 5. Get Friends List
```bash
GET /friends

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "friend1",
      "avatar": "..."
    }
  ]
}
```

### 6. Remove Friend
```bash
DELETE /friends/{friendId}

Headers:
Authorization: Bearer {accessToken}
```

### 7. Search Users
```bash
GET /friends/search?q=john

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "john_doe",
      "avatar": "..."
    }
  ]
}
```

---

## 💬 Messages

### 1. Create/Get Conversation
```bash
POST /messages/conversations

Headers:
Authorization: Bearer {accessToken}

Body:
{
  "userId": "{friendUserId}"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "participants": [...],
    "messages": []
  }
}
```

### 2. Get All Conversations
```bash
GET /messages/conversations

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "participants": [...],
      "lastMessageAt": "..."
    }
  ]
}
```

### 3. Get Conversation with Messages
```bash
GET /messages/conversations/{conversationId}?limit=50&offset=0

Headers:
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "participants": [...],
    "messages": [
      {
        "_id": "...",
        "senderId": "...",
        "content": "Hello!",
        "read": false,
        "createdAt": "..."
      }
    ]
  }
}
```

### 4. Send Message
```bash
POST /messages/conversations/{conversationId}/messages

Headers:
Authorization: Bearer {accessToken}

Body:
{
  "content": "Hello, how are you?"
}
```

### 5. Mark as Read
```bash
POST /messages/conversations/{conversationId}/read

Headers:
Authorization: Bearer {accessToken}
```

---

## 🔍 Search

### 1. Search Products (Hybrid Mode)
```bash
GET /search?q=smartphone&mode=hybrid&limit=20

Response:
{
  "success": true,
  "data": {
    "query": "smartphone",
    "results": [...],
    "count": 15
  }
}
```

### 2. Semantic Search
```bash
GET /search?q=fast computer&mode=semantic&limit=20
```

### 3. Keyword Search
```bash
GET /search?q=laptop&mode=keyword&limit=20
```

### 4. Search with Category
```bash
GET /search?q=phone&category=Electronics&mode=hybrid
```

---

## 👤 Users

### 1. Get User Profile
```bash
GET /users/{userId}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "john_doe",
    "avatar": "...",
    "bio": "..."
  }
}
```

### 2. Update Profile
```bash
PUT /users/profile

Headers:
Authorization: Bearer {accessToken}

Body:
{
  "bio": "Updated bio",
  "interests": ["tech", "gaming"],
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete User Journey
1. Register new user
2. Login
3. Browse products (GET /products)
4. Like a product
5. Add product to cart
6. Search for users
7. Send friend request
8. View cart
9. Logout

### Scenario 2: Admin Workflow
1. Login as admin
2. Create product
3. View all products
4. Update product
5. Delete product

### Scenario 3: Social Features
1. User A sends friend request to User B
2. User B accepts request
3. User A creates conversation with User B
4. User A sends message
5. User B reads messages
6. User B replies

### Scenario 4: Search & Discovery
1. Search products with keyword
2. Search products semantically
3. Filter by category
4. View friends' liked products
5. Like a product

---

## 🔧 Postman Collection

### Import this JSON:

```json
{
  "info": {
    "name": "Social E-Commerce API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api/v1"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

---

## 📊 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 🚀 Quick Test Script (Bash)

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api/v1"

# Health check
echo "1. Health check..."
curl $BASE_URL/../health

# Register
echo "\n2. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test1234"}')

echo $REGISTER_RESPONSE

# Extract token (requires jq)
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')

# Get products
echo "\n3. Getting products..."
curl -s $BASE_URL/products | jq

# Get cart
echo "\n4. Getting cart..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  $BASE_URL/cart | jq

echo "\n✅ Tests complete!"
```

Save as `test-api.sh` and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📝 Notes

- All POST/PUT requests require `Content-Type: application/json`
- Protected routes require `Authorization: Bearer {token}` header
- Admin routes require admin role
- Pagination: `?page=1&limit=20`
- Search supports: `?q=query&mode=hybrid&category=Electronics`

---

**Happy Testing! 🧪**
