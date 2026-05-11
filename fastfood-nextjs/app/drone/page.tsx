'use client';

import React, { useEffect, useState } from 'react';
import SidebarBigAdmin from '@/components/SidebarBigAdmin';
import '@/styles/Drone.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Drone() {
  const [drones, setDrones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDrone, setEditingDrone] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    speed: '',
    storeId: '',
    status: 'waiting',
  });

  useEffect(() => {
    fetchDrones();
    fetchStores();
  }, []);

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy/drone-delivery`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setDrones(data.data || data || []);
      }
    } catch (err) {
      console.error('Error fetching drones:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`/api/proxy/stores`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.speed) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        speed: Number(formData.speed),
        storeId: formData.storeId ? Number(formData.storeId) : null,
        status: formData.status,
      };

      if (editingDrone) {
        const res = await fetch(`/api/proxy/drone-delivery/${editingDrone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setEditingDrone(null);
          fetchDrones();
        }
      } else {
        const res = await fetch(`/api/proxy/drone-delivery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchDrones();
        }
      }

      setShowModal(false);
      setFormData({ name: '', speed: '', storeId: '', status: 'waiting' });
    } catch (err) {
      console.error('Error saving drone:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this drone?')) return;
    try {
      const res = await fetch(`/api/proxy/drone-delivery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDrones();
      }
    } catch (err) {
      console.error('Error deleting drone:', err);
    }
  };

  const openEdit = (drone: any) => {
    setEditingDrone(drone);
    setFormData({
      name: drone.name,
      speed: drone.speed,
      storeId: drone.storeId || '',
      status: drone.status,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingDrone(null);
    setFormData({ name: '', speed: '', storeId: '', status: 'waiting' });
    setShowModal(true);
  };

  if (loading) return <div style={{ display: 'flex' }}><SidebarBigAdmin /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarBigAdmin />
      <div style={{ flex: 1, padding: '20px' }}>
        <span className="rendering-badge">CSR - Drone Management</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Drones</h2>
          {!showModal && (
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
              Add Drone
            </button>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
            <h3>{editingDrone ? 'Edit Drone' : 'Add Drone'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <input
                type="text"
                name="name"
                placeholder="Drone Name"
                value={formData.name}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                name="speed"
                placeholder="Speed (km/h)"
                value={formData.speed}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <select
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">No Store</option>
                {stores.map((store: any) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="waiting">Waiting</option>
                <option value="flying">Flying</option>
                <option value="maintenance">Maintenance</option>
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
                onClick={() => setShowModal(false)}
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

        {/* Drones Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Speed</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Store</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drones.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No drones found
                  </td>
                </tr>
              ) : (
                drones.map((drone: any) => {
                  const store = (stores as any[]).find((s: any) => s.id === drone.storeId);
                  return (
                    <tr key={drone.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{drone.id}</td>
                      <td style={{ padding: '12px' }}>{drone.name}</td>
                      <td style={{ padding: '12px' }}>{drone.speed} km/h</td>
                      <td style={{ padding: '12px' }}>{store?.name || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', background: drone.status === 'flying' ? '#e74c3c' : '#2ecc71', color: 'white', borderRadius: '3px', fontSize: '12px' }}>
                          {drone.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => openEdit(drone)}
                          style={{ marginRight: '8px', padding: '5px 10px', background: '#f39c12', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(drone.id)}
                          style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
