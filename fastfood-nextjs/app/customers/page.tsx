'use client';

import React, { useEffect, useState } from 'react';
import SidebarBigAdmin from '@/components/SidebarBigAdmin';
import '@/styles/Customers.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api/users`;

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    address: '',
    ward: '',
    district: '',
    province: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy/users`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError('');

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return;
    }

    // Phone validation
    const phoneRegex = /^(0[1-9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Phone must be 10 digits starting with 0');
      return;
    }

    try {
      if (editUser) {
        // Update existing user
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
        };
        const res = await fetch(`/api/proxy/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // Create new user as admin
        const res = await fetch(`/api/proxy/users/admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Create failed');
      }

      setShowForm(false);
      setEditUser(null);
      setFormData(initialFormData);
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/proxy/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'CUSTOMER',
      status: u.status || 'ACTIVE',
      address: u.address || '',
      ward: u.ward || '',
      district: u.district || '',
      province: u.province || '',
    });
    setError('');
    setShowForm(true);
  };

  const openAdd = () => {
    setEditUser(null);
    setFormData(initialFormData);
    setError('');
    setShowForm(true);
  };

  if (loading) return <div style={{ display: 'flex' }}><SidebarBigAdmin /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarBigAdmin />
      <div style={{ flex: 1, padding: '20px' }}>
        <span className="rendering-badge">CSR - User Management</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Users</h2>
          <button
            onClick={openAdd}
            style={{
              padding: '10px 20px',
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Add User
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
            <h3>{editUser ? 'Edit User' : 'Add User'}</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '10px' }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <input
                type="text"
                name="name"
                placeholder="Name"
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
                disabled={!!editUser}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone (10 digits)"
                value={formData.phone}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              {!editUser && (
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              )}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option>CUSTOMER</option>
                <option>STORE_ADMIN</option>
                <option>ADMIN</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </select>
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

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{user.id}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>{user.name || '-'}</td>
                    <td style={{ padding: '12px' }}>{user.phone || '-'}</td>
                    <td style={{ padding: '12px' }}>{user.role}</td>
                    <td style={{ padding: '12px' }}>{user.status}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => openEdit(user)}
                        style={{ marginRight: '8px', padding: '5px 10px', background: '#f39c12', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
