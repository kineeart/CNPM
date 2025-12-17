import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import Sidebar from "./SidebarBigAdmin"; // import Sidebar
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

const DashboardBigAdmin = () => {
    const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    stores: 0,
  });

  // ✅ Doanh thu theo từng cửa hàng
  const [storeRevenues, setStoreRevenues] = useState([]);

 useEffect(() => {
  const fetchAll = async () => {
    try {
      // 📊 Số liệu tổng quan
      const statsRes = await axios.get(`${BACKEND_URL}/dashboard/stats`);
      setStats(statsRes.data);

      // 🏪 Danh sách cửa hàng + 🧾 tất cả đơn hàng
      const [storesRes, ordersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/stores`),
        axios.get(`${BACKEND_URL}/orders`),
      ]);
      const stores = storesRes.data || [];
      const orders = ordersRes.data || [];

      // 💰 Tính doanh thu theo từng cửa hàng (đơn status = "success")
      const revenueByStore = stores.map((s) => {
        const storeOrders = orders.filter((o) => Number(o.storeId) === Number(s.id));
        const revenue = storeOrders.reduce((sum, o) => {
          return o.status === "success" ? sum + Number(o.totalPrice || 0) : sum;
        }, 0);
        return {
          storeId: s.id,
          storeName: s.name || `Cửa hàng #${s.id}`,
          revenue,
          orderCount: storeOrders.length,
        };
      });

      // Sắp xếp giảm dần theo doanh thu cho dễ nhìn
      revenueByStore.sort((a, b) => b.revenue - a.revenue);
      setStoreRevenues(revenueByStore);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu Dashboard Big Admin:", err);
    }
  };
  fetchAll();
}, []);


  return (
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar trái */}
      <Sidebar />


      {/* Nội dung bên phải */}
      <div className="dashboard-content" style={{ flex: 1, padding: "20px" }}>
        <h1>Tổng quan</h1>
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

        
        </div>

        {/* ✅ Doanh thu theo từng cửa hàng */}
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#333" }}>📈 Doanh thu theo cửa hàng</h2>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {storeRevenues.map((r) => (
              <div
                key={r.storeId}
                style={{
                  flex: "1 1 240px",
                  minWidth: "240px",
                  padding: "20px",
                  background: "#f0f4ff",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", color: "#1a237e" }}>{r.storeName}</h3>
                <p style={{ fontSize: "22px", fontWeight: "bold", color: "#0d47a1", margin: 0 }}>
                  {r.revenue.toLocaleString("vi-VN")} ₫
                </p>
                <p style={{ fontSize: "13px", color: "#555", margin: "8px 0 0 0" }}>
                  Đơn hàng: {r.orderCount}
                </p>
              </div>
            ))}

            {storeRevenues.length === 0 && (
              <p style={{ color: "#666" }}>Chưa có dữ liệu doanh thu cửa hàng.</p>
            )}
          </div>
        </div>
        {/* ✅ Biểu đồ tròn thể hiện tỷ trọng doanh thu các cửa hàng */}
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#333" }}>🟢 Biểu đồ tròn doanh thu các cửa hàng</h2>
          {
            (() => {
              const totalRevenue = storeRevenues.reduce((sum, r) => sum + r.revenue, 0);
              if (!totalRevenue) {
                return <p style={{ color: "#666" }}>Chưa có doanh thu để hiển thị biểu đồ.</p>;
              }

              const baseColors = [
                "#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336",
                "#00BCD4", "#8BC34A", "#FF5722", "#3F51B5", "#795548",
              ];

              let cumulative = 0;
              const segments = storeRevenues.map((r, idx) => {
                const percent = (r.revenue / totalRevenue) * 100;
                const start = cumulative;
                const end = cumulative + percent;
                cumulative = end;
                const color = baseColors[idx % baseColors.length];
                return { label: r.storeName, revenue: r.revenue, percent, start, end, color };
              });

              const gradientStr = segments
                .map((s) => `${s.color} ${s.start}% ${s.end}%`)
                .join(", ");

              return (
                <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                  <div
                    style={{
                      width: "240px",
                      height: "240px",
                      borderRadius: "50%",
                      background: `conic-gradient(${gradientStr})`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {segments.map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "14px", height: "14px", background: s.color, borderRadius: "3px" }} />
                        <span style={{ fontWeight: 600 }}>{s.label}</span>
                        <span style={{ color: "#555" }}>
                          — {s.revenue.toLocaleString("vi-VN")} ₫ ({s.percent.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardBigAdmin;
