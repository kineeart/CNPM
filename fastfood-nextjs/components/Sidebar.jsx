"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();

  const menuItems = [
    { label: "Tổng quan", path: "/dashboard" },
    { label: "Đơn hàng", path: "/orders" },
    { label: "Sản phẩm", path: "/products" },
    { label: "Trang chủ", path: "/home" },
  ];

  return (
    <div
      className="sidebar"
      style={{
        width: "200px",
        background: "#2c3e50",
        color: "#fff",
        padding: "20px",
      }}
    >
      <h2 style={{ color: "#fff" }}>Dashboard</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {menuItems.map((item) => (
          <li
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{ margin: "15px 0", cursor: "pointer" }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
