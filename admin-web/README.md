# Admin Web Panel

React-based admin dashboard for managing the social e-commerce platform.

## Features

- Admin authentication with JWT
- Product CRUD operations
- Image upload to ImgBB/Cloudinary
- Automatic embedding generation for products
- Dashboard with product listing
- Responsive UI with green & white theme

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- React Hook Form + Zod validation
- Axios
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running

### Installation

```bash
npm install
```

### Configuration

Create [.env](.env) file:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_IMGBB_API_KEY`: ImgBB API key for image uploads

### Running

Development:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Usage

### Creating Admin User

First, create an admin user by registering through the API with `role: "admin"` or modify a user in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

### Login

Navigate to `/login` and sign in with admin credentials. Only users with `role: "admin"` can access the panel.

### Managing Products

- **View Products**: Dashboard shows all products with pagination
- **Create Product**: Click "Create New Product" button
- **Edit Product**: Click "Edit" on any product card
- **Delete Product**: Click "Delete" on any product card (requires confirmation)

### Image Upload

Images are uploaded to ImgBB (free tier) or Cloudinary. Get your API key from:
- ImgBB: https://api.imgbb.com/
- Cloudinary: https://cloudinary.com/

## Project Structure

```
src/
├── auth/
│   ├── AuthContext.tsx       # Authentication context
│   └── ProtectedRoute.tsx    # Route protection
├── pages/
│   ├── LoginPage.tsx          # Admin login
│   ├── DashboardPage.tsx      # Product listing
│   └── ProductFormPage.tsx    # Create/Edit product
├── services/
│   ├── api.ts                 # API client
│   └── imageUpload.ts         # Image upload service
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

## API Integration

The admin panel integrates with these backend endpoints:

- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

## Security

- Admin-only access enforced
- JWT token refresh on expiry
- Protected routes
- Input validation with Zod

## License

ISC
# social_Ecommerce
