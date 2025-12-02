// Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const SidebarBigAdmin = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Tổng quan", path: "/dashboard-bigadmin" },
    { label: "Người dùng", path: "/customers" },
    { label: "Đơn hàng", path: "/orders" },
    { label: "Nhà hàng", path: "/stores" },
    { label: "Drone", path: "/drone" },

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
            onClick={() => navigate(item.path)}
            style={{ margin: "15px 0", cursor: "pointer" }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarBigAdmin;
