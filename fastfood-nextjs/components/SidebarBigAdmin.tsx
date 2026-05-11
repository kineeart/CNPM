'use client';

import React from 'react';
import Link from 'next/link';

export default function SidebarBigAdmin() {
  const menuItems = [
    { label: 'Tổng quan', path: '/dashboard-bigadmin' },
    { label: 'Người dùng', path: '/customers' },
    { label: 'Nhà hàng', path: '/stores' },
    { label: 'Đơn hàng', path: '/orders-admin' },
    { label: 'Drone', path: '/drone' },
    { label: 'Trang chủ', path: '/home' },
  ];

  return (
    <div
      className="sidebar"
      style={{
        width: '200px',
        background: '#2c3e50',
        color: '#fff',
        padding: '20px',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ color: '#fff', margin: '0 0 20px 0' }}>Admin</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {menuItems.map((item) => (
          <li key={item.path} style={{ margin: '15px 0' }}>
            <Link
              href={item.path}
              style={{
                
                color: '#fff',
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'block',
                padding: '8px',
                borderRadius: '4px',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
