// Image upload service using Cloudinary via backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api/v1';

export class ImageUploadService {
  async uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Upload via backend API which handles Cloudinary authentication
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();

      if (data.data?.url) {
        return data.data.url;
      }

      throw new Error('Upload failed - no URL returned');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload image to Cloudinary');
    }
  }

  // Default method - uses Cloudinary
  async uploadImage(file: File): Promise<string> {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit for Cloudinary
      throw new Error('Image size must be less than 10MB');
    }

    return this.uploadToCloudinary(file);
  }

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploads = files.map((file) => this.uploadImage(file));
    return Promise.all(uploads);
  }
}

export const imageUploadService = new ImageUploadService();
