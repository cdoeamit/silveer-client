import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';
import api from '../../utils/api';

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(!!id);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data.product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Failed to load product');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/admin/products/${id}`, formData);
        alert('Product updated successfully!');
      } else {
        await api.post('/admin/products', formData);
        alert('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update product details' : 'Create a new product in your inventory'}
          </p>
        </div>

        {/* Product Form */}
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export default AddProduct;