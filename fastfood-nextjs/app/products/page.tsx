'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import '@/styles/Products.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Products() {
  const [storeId, setStoreId] = useState<number | null>(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    storeId: '',
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    isAvailable: true,
    inventory: 0,
    soldOutUntil: '',
  });

  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const userId = user?.id ? Number(user.id) : null;

    if (userId) {
      fetchStoreOfUser(userId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStoreOfUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/proxy/stores`, { method: 'GET' });
      if (res.ok) {
        const stores = await res.json();
        const store = stores.find((s: any) => Number(s.ownerId) === Number(userId));
        if (store) {
          setStoreId(store.id);
          fetchProducts(store.id);
        }
      }
    } catch (err) {
      console.error('Error fetching store:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (sid: number) => {
    try {
      const res = await fetch(`/api/proxy/products/store/${sid}/public`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name as keyof typeof formData] : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const payload = {
        storeId,
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        imageUrl: formData.imageUrl,
        isAvailable: formData.isAvailable,
        inventory: Number(formData.inventory),
        soldOutUntil: formData.soldOutUntil,
      };

      if (editingProduct) {
        const res = await fetch(`/api/proxy/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setEditingProduct(null);
          if (storeId) fetchProducts(storeId);
        }
      } else {
        const res = await fetch(`/api/proxy/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsAdding(false);
          if (storeId) fetchProducts(storeId);
        }
      }
      setFormData({
        storeId: '',
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        isAvailable: true,
        inventory: 0,
        soldOutUntil: '',
      });
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/proxy/products/${id}`, { method: 'DELETE' });
      if (res.ok && storeId) {
        fetchProducts(storeId);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setIsAdding(false);
    setFormData({
      storeId: product.storeId,
      name: product.name,
      price: product.price,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      isAvailable: product.isAvailable,
      inventory: product.inventory || 0,
      soldOutUntil: product.soldOutUntil || '',
    });
  };

  if (loading) return <div style={{ display: 'flex' }}><Sidebar /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <span className="rendering-badge">CSR - Store Product Management</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Products</h2>
          {!isAdding && !editingProduct && (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: '10px 20px',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Add Product
            </button>
          )}
        </div>

        {/* Form */}
        {(isAdding || editingProduct) && (
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                name="imageUrl"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', gridColumn: '1 / -1' }}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', gridColumn: '1 / -1', minHeight: '100px' }}
              />
              <input
                type="number"
                name="inventory"
                placeholder="Inventory"
                value={formData.inventory}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="datetime-local"
                name="soldOutUntil"
                placeholder="Sold Out Until"
                value={formData.soldOutUntil}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 20px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingProduct(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>No products found</p>
          ) : (
            products.map((product: any) => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{product.name}</h4>
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>{product.description}</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2ecc71', margin: '8px 0' }}>
                    {product.price.toLocaleString('vi-VN')} ₫
                  </p>
                  <p style={{ fontSize: '12px', color: '#999', margin: '8px 0' }}>Stock: {product.inventory}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => openEdit(product)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
