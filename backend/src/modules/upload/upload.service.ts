import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadService {
  async uploadToCloudinary(file: any): Promise<string> {
    try {
      // Convert buffer to base64 if needed
      const fileStr = file.buffer 
        ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
        : file.path;

      const result = await cloudinary.uploader.upload(fileStr, {
        folder: 'social-ecommerce',
        resource_type: 'auto',
      });

      return result.secure_url;
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  async uploadMultipleToCloudinary(files: any[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadToCloudinary(file));
    return Promise.all(uploadPromises);
  }
}

export const uploadService = new UploadService();
