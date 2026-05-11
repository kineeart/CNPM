'use client';

import React, { useEffect, useState } from 'react';
import '@/styles/CustomerOrder.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const id = user?.id ? Number(user.id) : null;
    setUserId(id);
    if (id) {
      fetchOrders(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (uid: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy/orders/user/${uid}`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
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

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      confirm: 'Confirmed',
      processing: 'Processing',
      delivering: 'Delivering',
      success: 'Completed',
      failed: 'Cancelled',
    };
    return labels[status] || status;
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <span className="rendering-badge">CSR - Customer Order History</span>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ color: '#999', fontSize: '16px' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order: any) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>Order #{order.id}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span
                  style={{
                    padding: '6px 12px',
                    background: getStatusColor(order.status),
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginBottom: '12px' }}>
                <p style={{ margin: '8px 0' }}>
                  <strong>Items:</strong> {order.orderItems?.length || 0}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Delivery Address:</strong> {order.deliveryAddress || '-'}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Contact Phone:</strong> {order.contactPhone || '-'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', textAlign: 'right' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2ecc71', margin: 0 }}>
                  Total: {order.totalPrice.toLocaleString('vi-VN')} ₫
                </p>
              </div>

              {order.status === 'delivering' && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#ecf9ff', borderRadius: '4px', color: '#1abc9c' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>🚁 Order is being delivered</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
