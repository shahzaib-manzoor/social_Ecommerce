import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { Product } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProducts(currentPage, 20);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiService.deleteProduct(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.username}!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.actions}>
        <Link to="/products/new" style={styles.createButton}>
          + Create New Product
        </Link>
        <Link to="/categories" style={styles.categoryButton}>
          Manage Categories
        </Link>
      </div>

      {isLoading ? (
        <div style={styles.loading}>Loading products...</div>
      ) : (
        <>
          <div style={styles.grid}>
            {products.map((product) => (
              <div key={product._id} style={styles.card}>
                <img src={product.images[0]} alt={product.title} style={styles.image} />
                <div style={styles.cardContent}>
                  <h3 style={styles.productTitle}>{product.title}</h3>
                  <p style={styles.price}>${product.price.toFixed(2)}</p>
                  <p style={styles.category}>{product.category}</p>
                  <div style={styles.cardActions}>
                    <Link to={`/products/${product._id}/edit`} style={styles.editButton}>
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(product._id)} style={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={styles.paginationButton}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </>
      )}
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
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#666',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  actions: {
    marginBottom: '24px',
    display: 'flex',
    gap: '12px',
  },
  createButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2d6a4f',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
  },
  categoryButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#457b9d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '16px',
  },
  productTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginBottom: '4px',
  },
  category: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#457b9d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  },
  deleteButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#2d6a4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    color: '#666',
  },
};
