import { Request, Response } from 'express';
import { uploadService } from './upload.service';
import { sendSuccess, sendError } from '../../utils/response';

export class UploadController {
  uploadImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 'No image file provided', 400);
      }

      const imageUrl = await uploadService.uploadToCloudinary(req.file);
      
      return sendSuccess(res, { url: imageUrl }, 200);
    } catch (error: any) {
      console.error('Upload error:', error);
      return sendError(res, error.message || 'Failed to upload image', 500);
    }
  };

  uploadMultipleImages = async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return sendError(res, 'No image files provided', 400);
      }

      const imageUrls = await uploadService.uploadMultipleToCloudinary(files);
      
      return sendSuccess(res, { urls: imageUrls }, 200);
    } catch (error: any) {
      console.error('Upload error:', error);
      return sendError(res, error.message || 'Failed to upload images', 500);
    }
  };
}

export const uploadController = new UploadController();
