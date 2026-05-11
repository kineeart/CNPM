'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import '@/styles/Orders.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function StoreOwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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
          fetchOrders(store.id);
        }
      }
    } catch (err) {
      console.error('Error fetching store:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (sid: number) => {
    try {
      const res = await fetch(`/api/proxy/orders`, { method: 'GET' });
      if (res.ok) {
        const allOrders = await res.json();
        const storeOrders = allOrders.filter((o: any) => Number(o.storeId) === Number(sid));
        setOrders(storeOrders);
        setDisplayOrders(storeOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const filterByStatus = (status: string) => {
    setFilterStatus(status);
    setDisplayOrders(status === 'ALL' ? orders : orders.filter((o: any) => o.status === status));
  };

  const fetchAvailableDrones = async () => {
    try {
      if (!storeId) return;
      const res = await fetch(`/api/proxy/drone-delivery/waiting?storeId=${storeId}`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setAvailableDrones(data.data || data || []);
      }
    } catch (err) {
      console.error('Error fetching drones:', err);
    }
  };

  const assignDroneToOrder = async (droneId: number) => {
    if (!selectedOrderId) return;
    try {
      const res = await fetch(`/api/proxy/drone-delivery/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId, droneId }),
      });
      if (res.ok) {
        setShowDroneModal(false);
        if (storeId) fetchOrders(storeId);
      }
    } catch (err) {
      console.error('Error assigning drone:', err);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (newStatus === 'delivering') {
      setSelectedOrderId(orderId);
      fetchAvailableDrones();
      setShowDroneModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/proxy/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok && storeId) {
        fetchOrders(storeId);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#f39c12',
      confirm: '#3498db',
      processing: '#9b59b6',
      delivering: '#1abc9c',
      success: '#2ecc71',
      failed: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) return <div style={{ display: 'flex' }}><Sidebar /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <span className="rendering-badge">CSR - Store Owner Order Management</span>
        <h2>My Orders</h2>

        {/* Filter Buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['ALL', 'pending', 'confirm', 'processing', 'delivering', 'success', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => filterByStatus(status)}
              style={{
                padding: '8px 16px',
                background: filterStatus === status ? '#34495e' : '#bdc3c7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: filterStatus === status ? 'bold' : 'normal',
              }}
            >
              {status === 'ALL' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                displayOrders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{order.id}</td>
                    <td style={{ padding: '12px' }}>{order.totalPrice.toLocaleString('vi-VN')} ₫</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', background: getStatusColor(order.status), color: 'white', borderRadius: '3px', fontSize: '12px' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ddd' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirm">Confirm</option>
                        <option value="processing">Processing</option>
                        <option value="delivering">Delivering</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Drone Assignment Modal */}
        {showDroneModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
              <h3>Select Drone for Delivery</h3>
              {availableDrones.length === 0 ? (
                <p style={{ color: '#999' }}>No available drones</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {availableDrones.map((drone: any) => (
                    <button
                      key={drone.id}
                      onClick={() => assignDroneToOrder(drone.id)}
                      style={{
                        padding: '12px',
                        background: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {drone.name} (Speed: {drone.speed} km/h)
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowDroneModal(false)}
                style={{
                  marginTop: '15px',
                  width: '100%',
                  padding: '10px',
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
      </div>
    </div>
  );
}
