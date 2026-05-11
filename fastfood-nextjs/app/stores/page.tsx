'use client';

import React, { useEffect, useState } from 'react';
import SidebarBigAdmin from '@/components/SidebarBigAdmin';
import '@/styles/Store.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function StoresAdmin() {
  const [stores, setStores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);

  const initialFormData = {
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    ownerId: '',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchStores();
    fetchAdmins();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy/stores`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`/api/proxy/users`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.filter((u: any) => u.role === 'STORE_ADMIN'));
      }
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (editStore) {
        const res = await fetch(`/api/proxy/stores/${editStore.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude),
            description: formData.description,
          }),
        });
        if (res.ok) {
          setEditStore(null);
          fetchStores();
        }
      } else {
        const res = await fetch(`/api/proxy/stores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude),
            ownerId: Number(formData.ownerId),
            description: formData.description,
          }),
        });
        if (res.ok) {
          fetchStores();
        }
      }
      setShowForm(false);
      setFormData(initialFormData);
    } catch (err) {
      console.error('Error saving store:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this store?')) return;
    try {
      const res = await fetch(`/api/proxy/stores/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStores();
      }
    } catch (err) {
      console.error('Error deleting store:', err);
    }
  };

  const openEdit = (store: any) => {
    setEditStore(store);
    setFormData({
      name: store.name || '',
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      latitude: store.latitude || '',
      longitude: store.longitude || '',
      ownerId: store.ownerId || '',
      description: store.description || '',
    });
    setShowForm(true);
  };

  if (loading) return <div style={{ display: 'flex' }}><SidebarBigAdmin /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarBigAdmin />
      <div style={{ flex: 1, padding: '20px' }}>
        <span className="rendering-badge">CSR - Store Management</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Stores</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 20px',
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Add Store
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
            <h3>{editStore ? 'Edit Store' : 'Add Store'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <input
                type="text"
                name="name"
                placeholder="Store Name"
                value={formData.name}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                name="latitude"
                placeholder="Latitude"
                step="0.0001"
                value={formData.latitude}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                name="longitude"
                placeholder="Longitude"
                step="0.0001"
                value={formData.longitude}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              {!editStore && (
                <select
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleChange}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Owner</option>
                  {admins.map((admin: any) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.email} ({admin.name})
                    </option>
                  ))}
                </select>
              )}
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
                onClick={() => setShowForm(false)}
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

        {/* Stores Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {stores.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>No stores found</p>
          ) : (
            stores.map((store: any) => (
              <div
                key={store.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <h4 style={{ margin: '0 0 12px 0' }}>{store.name}</h4>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  📍 {store.address}
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  📞 {store.phone || '-'}
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  📧 {store.email || '-'}
                </p>
                {store.description && (
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#999' }}>
                    {store.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => openEdit(store)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
