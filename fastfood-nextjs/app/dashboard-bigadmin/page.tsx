'use client';

import React, { useEffect, useState } from 'react';
import SidebarBigAdmin from '@/components/SidebarBigAdmin';
import '@/styles/Dashboard.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function DashboardBigAdmin() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    store: 0,
  });
  const [storeRevenues, setStoreRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // Render strategy badge
        const badge = <span className="rendering-badge">CSR - Admin Dashboard</span>;

        // 📊 Fetch admin dashboard stats
        const statsRes = await fetch('/api/proxy/dashboard/stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          console.log("📊 Stats response:", statsData);
          setStats(statsData);
        }

        // 🏪 Fetch stores and orders
        const [storesRes, ordersRes] = await Promise.all([
          fetch('/api/proxy/stores', { method: 'GET' }),
          fetch('/api/proxy/orders', { method: 'GET' }),
        ]);

        const stores = storesRes.ok ? await storesRes.json() : [];
        const orders = ordersRes.ok ? await ordersRes.json() : [];

        // 💰 Calculate revenue by store
        const revenueByStore = stores.map((store: any) => {
          const storeOrders = orders.filter((o: any) => Number(o.storeId) === Number(store.id));
          const revenue = storeOrders.reduce((sum: number, o: any) => {
            return o.status === 'success' ? sum + Number(o.totalPrice || 0) : sum;
          }, 0);
          return {
            storeId: store.id,
            storeName: store.name || `Store #${store.id}`,
            revenue,
            orderCount: storeOrders.length,
          };
        });

        // Sort by revenue descending
          revenueByStore.sort((a: any, b: any) => b.revenue - a.revenue);
        setStoreRevenues(revenueByStore);
      } catch (err) {
        console.error('❌ Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const StatCard = ({ title, value }: { title: string; value: number }) => (
    <div
      style={{
        flex: '1 1 200px',
        padding: '20px',
        background: '#ecf0f1',
        borderRadius: '10px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0' }}>{title}</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{value}</p>
    </div>
  );

  if (loading) return <div style={{ display: 'flex', minHeight: '100vh' }}><SidebarBigAdmin /><div style={{ flex: 1, padding: '20px' }}>Loading...</div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarBigAdmin />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Admin Dashboard</h1>
        <span className="rendering-badge">CSR - Admin Dashboard</span>

        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          <StatCard title="Users" value={stats.users} />
          <StatCard title="Orders" value={stats.orders} />
          <StatCard title="Products" value={stats.products} />
          <StatCard title="Stores" value={stats.store} />
        </div>

        {/* Store Revenues */}
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>📈 Revenue by Store</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {storeRevenues.map((item: any) => (
              <div
                key={item.storeId}
                style={{
                  flex: '1 1 240px',
                  minWidth: '240px',
                  padding: '20px',
                  background: '#f0f4ff',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#1a237e' }}>{item.storeName}</h3>
                <p style={{ margin: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#2ecc71' }}>
                  {item.revenue.toLocaleString('vi-VN')} ₫
                </p>
                <p style={{ margin: '8px 0', color: '#666' }}>Orders: {item.orderCount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
