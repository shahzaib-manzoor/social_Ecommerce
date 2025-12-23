import { Router } from 'express';
import multer from 'multer';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Protected routes - require authentication
router.post('/image', authenticate, upload.single('image'), uploadController.uploadImage);
router.post('/images', authenticate, upload.array('images', 10), uploadController.uploadMultipleImages);

export default router;
