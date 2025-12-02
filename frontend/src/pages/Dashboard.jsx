import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import Sidebar from "./Sidebar"; // import Sidebar
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

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    products: 0,    // số sản phẩm của store
    orders: 0,      // số đơn của store
    revenue: 0,     // doanh thu (đơn success)
  });

  useEffect(() => {
    const fetchStoreScopedStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id ? Number(user.id) : null;
        if (!userId) return;

        // 1) Lấy store của user
        const storesRes = await axios.get(`${BACKEND_URL}/stores`);
        const myStore = (storesRes.data || []).find(s => Number(s.ownerId) === Number(userId));
        if (!myStore) {
          console.warn("Không tìm thấy cửa hàng của user:", userId);
          return;
        }
        const storeId = myStore.id;

        // 2) Lấy sản phẩm của store (public hoặc private đều được)
        const productsRes = await axios.get(`${BACKEND_URL}/products/store/${storeId}/public`);
        const products = productsRes.data || [];

        // 3) Lấy tất cả orders rồi lọc theo storeId
        const ordersRes = await axios.get(`${BACKEND_URL}/orders`);
        const ordersAll = ordersRes.data || [];
        const orders = ordersAll.filter(o => Number(o.storeId) === Number(storeId));

        // 4) Tính doanh thu từ đơn success
        const revenue = orders.reduce((sum, o) => {
          return sum + (o.status === "success" ? Number(o.totalPrice || 0) : 0);
        }, 0);

        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
        });
      } catch (err) {
        console.error("❌ Lỗi khi tải số liệu thống kê theo store:", err);
      }
    };

    fetchStoreScopedStats();
  }, []);

  return (
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar trái */}
      <Sidebar />


      {/* Nội dung bên phải */}
      <div className="dashboard-content" style={{ flex: 1, padding: "20px" }}>
        <h1>Tổng quan cửa hàng của bạn</h1>
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
            <h3>Doanh thu</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.revenue.toLocaleString("vi-VN")} ₫</p>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
