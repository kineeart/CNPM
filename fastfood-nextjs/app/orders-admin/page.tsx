'use client';

import React, { useEffect, useState } from 'react';
import SidebarBigAdmin from '@/components/SidebarBigAdmin';
import '@/styles/Orders.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function OrderBigAdmin() {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proxy/orders`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setDisplayOrders(data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: string) => {
    setFilterStatus(status);
    setDisplayOrders(status === 'ALL' ? orders : orders.filter((o: any) => o.status === status));
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/proxy/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
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

  if (loading) return <div style={{ display: 'flex' }}><SidebarBigAdmin /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarBigAdmin />
      <div style={{ flex: 1, padding: '20px' }}>
        <span className="rendering-badge">CSR - Admin Order Management</span>
        <h2>Orders</h2>

        {/* Overview Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '150px', padding: '20px', background: '#ecf0f1', borderRadius: '5px', textAlign: 'center' }}>
            <h4>Total Orders</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{orders.length}</p>
          </div>
          <div style={{ flex: '1', minWidth: '150px', padding: '20px', background: '#ecf0f1', borderRadius: '5px', textAlign: 'center' }}>
            <h4>Processing</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{orders.filter((o: any) => o.status === 'processing').length}</p>
          </div>
          <div style={{ flex: '1', minWidth: '150px', padding: '20px', background: '#ecf0f1', borderRadius: '5px', textAlign: 'center' }}>
            <h4>Completed</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{orders.filter((o: any) => o.status === 'success').length}</p>
          </div>
          <div style={{ flex: '1', minWidth: '150px', padding: '20px', background: '#ecf0f1', borderRadius: '5px', textAlign: 'center' }}>
            <h4>Revenue</h4>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {orders.reduce((sum: number, o: any) => sum + (o.status === 'success' ? o.totalPrice : 0), 0).toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

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
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
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
      </div>
    </div>
  );
}
