import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import { useNavigate } from "react-router-dom";

const cardStyle = {
  flex: "1 1 200px",
  padding: "20px",
  background: "#ecf0f1",
  borderRadius: "10px",
  textAlign: "center",
};

const valueStyle = {
  fontSize: "24px",
  fontWeight: "bold",
};

const Dashboard = () => {
    const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    stores: 0,
  });

 useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải số liệu thống kê:", err);
    }
  };
  fetchStats();
}, []);


  return (
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar trái */}
      <div className="sidebar" style={{ width: "200px", background: "#2c3e50", color: "#fff", padding: "20px" }}>
        <h2>Dashboard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
<li onClick={() => navigate("/customers")} style={{ margin: "15px 0", cursor: "pointer" }}>
  Người dùng
</li>
          <li style={{ margin: "15px 0", cursor: "pointer" }}>Đơn hàng</li>
          <li style={{ margin: "15px 0", cursor: "pointer" }}>Sản phẩm</li>
          <li style={{ margin: "15px 0", cursor: "pointer" }}>Nhà hàng</li>
        </ul>
      </div>

      {/* Nội dung bên phải */}
      <div className="dashboard-content" style={{ flex: 1, padding: "20px" }}>
        <h1>👋 Tổng quan</h1>
        <div
          className="stats"
          style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}
        >
          <div
            className="stat-card"
            style={{
              flex: "1 1 200px",
              padding: "20px",
              background: "#ecf0f1",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Người dùng</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.users}</p>
          </div>

          <div
            className="stat-card"
            style={{
              flex: "1 1 200px",
              padding: "20px",
              background: "#ecf0f1",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Đơn hàng</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.orders}</p>
          </div>

          <div
            className="stat-card"
            style={{
              flex: "1 1 200px",
              padding: "20px",
              background: "#ecf0f1",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Sản phẩm</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.products}</p>
          </div>

          <div
            className="stat-card"
            style={{
              flex: "1 1 200px",
              padding: "20px",
              background: "#ecf0f1",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Nhà hàng</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.stores}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
