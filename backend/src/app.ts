import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/product.routes';
import cartRoutes from './modules/cart/cart.routes';
import friendsRoutes from './modules/friends/friends.routes';
import messagesRoutes from './modules/messages/messages.routes';
import searchRoutes from './modules/search/search.routes';
import usersRoutes from './modules/users/users.routes';
import uploadRoutes from './modules/upload/upload.routes';
import categoryRoutes from './modules/categories/category.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';

const app: Application = express();

// Trust proxy - required for Railway/reverse proxies to get correct client IPs
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/friends', friendsRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
