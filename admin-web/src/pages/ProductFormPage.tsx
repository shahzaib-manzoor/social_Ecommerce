import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { imageUploadService } from '../services/imageUpload';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string(), // Comma-separated tags
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const product = await apiService.getProduct(productId);
      setValue('title', product.title);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('category', product.category);
      setValue('tags', product.tags.join(', '));
      setImageUrls(product.images);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load product');
      navigate('/');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);

    // Preview images
    const previews = files.map((file) => URL.createObjectURL(file));
    setImageUrls(previews);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (imageUrls.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images if any
      let finalImageUrls = imageUrls;
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        finalImageUrls = await imageUploadService.uploadMultipleImages(imageFiles);
        setUploadingImages(false);
      }

      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        tags: data.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        images: finalImageUrls,
      };

      if (isEditMode && id) {
        await apiService.updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        await apiService.createProduct(productData);
        toast.success('Product created successfully');
      }

      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{isEditMode ? 'Edit Product' : 'Create New Product'}</h1>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Product Title *</label>
          <input {...register('title')} style={styles.input} placeholder="Enter product title" />
          {errors.title && <span style={styles.error}>{errors.title.message}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            {...register('description')}
            style={{ ...styles.input, minHeight: '120px' }}
            placeholder="Enter product description"
          />
          {errors.description && <span style={styles.error}>{errors.description.message}</span>}
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Price ($) *</label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              style={styles.input}
              placeholder="0.00"
            />
            {errors.price && <span style={styles.error}>{errors.price.message}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category *</label>
            <input {...register('category')} style={styles.input} placeholder="e.g., Electronics, Fashion" />
            {errors.category && <span style={styles.error}>{errors.category.message}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tags (comma-separated)</label>
          <input {...register('tags')} style={styles.input} placeholder="e.g., smartphone, tech, gadget" />
          {errors.tags && <span style={styles.error}>{errors.tags.message}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Product Images *</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} style={styles.input} />
          <p style={styles.hint}>Upload up to 5 images. Max 5MB each.</p>

          {imageUrls.length > 0 && (
            <div style={styles.imagePreview}>
              {imageUrls.map((url, index) => (
                <img key={index} src={url} alt={`Preview ${index + 1}`} style={styles.previewImage} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || uploadingImages} style={styles.submitButton}>
          {uploadingImages ? 'Uploading images...' : isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  form: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '24px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
  },
  error: {
    color: '#e63946',
    fontSize: '13px',
    marginTop: '4px',
    display: 'block',
  },
  hint: {
    fontSize: '13px',
    color: '#666',
    marginTop: '4px',
  },
  imagePreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  previewImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
  },
};
