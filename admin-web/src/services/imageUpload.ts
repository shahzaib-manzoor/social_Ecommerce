// Image upload service using ImgBB (free tier)
// Alternative: Cloudinary, Uploadcare

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';

export class ImageUploadService {
  async uploadToImgBB(file: File): Promise<string> {
    if (!IMGBB_API_KEY) {
      throw new Error('Image upload API key not configured');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        return data.data.url;
      }

      throw new Error('Upload failed');
    } catch (error) {
      console.error('ImgBB upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  async uploadToCloudinary(file: File, cloudName: string, uploadPreset: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      }

      throw new Error('Upload failed');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Default method - uses ImgBB
  async uploadImage(file: File): Promise<string> {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error('Image size must be less than 5MB');
    }

    return this.uploadToImgBB(file);
  }

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploads = files.map((file) => this.uploadImage(file));
    return Promise.all(uploads);
  }
}

export const imageUploadService = new ImageUploadService();
