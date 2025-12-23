import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';
import { imageUploadService } from '../services/imageUpload';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  _id: string;
  name: string;
  description?: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!imageFile && !editingCategory) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = editingCategory?.image || '';

      if (imageFile) {
        setUploadingImage(true);
        const uploadedUrls = await imageUploadService.uploadMultipleImages([imageFile]);
        imageUrl = uploadedUrls[0];
        setUploadingImage(false);
      }

      const categoryData = {
        name: data.name,
        description: data.description || '',
        image: imageUrl,
      };

      if (editingCategory) {
        await apiService.updateCategory(editingCategory._id, categoryData);
        toast.success('Category updated successfully');
      } else {
        await apiService.createCategory(categoryData);
        toast.success('Category created successfully');
      }

      reset();
      setImageFile(null);
      setImagePreview('');
      setEditingCategory(null);
      setShowForm(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description || '');
    setImagePreview(category.image);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await apiService.deleteCategory(id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await apiService.toggleCategoryStatus(id);
      toast.success('Category status updated');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category status');
    }
  };

  const handleCancel = () => {
    reset();
    setImageFile(null);
    setImagePreview('');
    setEditingCategory(null);
    setShowForm(false);
  };

  if (isLoading) {
    return <div style={styles.loading}>Loading categories...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Category Management</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={styles.addButton}>
            + Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category Name *</label>
              <input {...register('name')} style={styles.input} placeholder="Enter category name" />
              {errors.name && <span style={styles.error}>{errors.name.message}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                {...register('description')}
                style={{ ...styles.input, minHeight: '80px' }}
                placeholder="Enter category description (optional)"
              />
              {errors.description && <span style={styles.error}>{errors.description.message}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category Image *</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={styles.input} />
              <p style={styles.hint}>Upload a category image. Max 5MB.</p>

              {imagePreview && (
                <div style={styles.imagePreviewContainer}>
                  <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" disabled={isSubmitting || uploadingImage} style={styles.submitButton}>
                {uploadingImage ? 'Uploading...' : isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.categoriesGrid}>
        {categories.map((category) => (
          <div key={category._id} style={styles.categoryCard}>
            <img src={category.image} alt={category.name} style={styles.categoryImage} />
            <div style={styles.categoryContent}>
              <h3 style={styles.categoryName}>{category.name}</h3>
              {category.description && <p style={styles.categoryDescription}>{category.description}</p>}
              <div style={styles.categoryStatus}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: category.isActive ? '#d4edda' : '#f8d7da',
                  color: category.isActive ? '#155724' : '#721c24',
                }}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div style={styles.categoryActions}>
              <button onClick={() => handleEdit(category)} style={styles.editButton}>
                Edit
              </button>
              <button onClick={() => handleToggleStatus(category._id)} style={styles.toggleButton}>
                {category.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => handleDelete(category._id)} style={styles.deleteButton}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && !showForm && (
          <div style={styles.emptyState}>
            <p>No categories found. Create your first category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
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
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
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
  imagePreviewContainer: {
    marginTop: '12px',
  },
  previewImage: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  submitButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  categoryContent: {
    padding: '16px',
  },
  categoryName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  categoryDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
  },
  categoryStatus: {
    marginBottom: '8px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  categoryActions: {
    display: 'flex',
    borderTop: '1px solid #eee',
  },
  editButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#2d6a4f',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  toggleButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#f77f00',
    border: 'none',
    borderLeft: '1px solid #eee',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#e63946',
    border: 'none',
    borderLeft: '1px solid #eee',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px',
    color: '#666',
    fontSize: '16px',
  },
};
