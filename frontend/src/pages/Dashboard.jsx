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

  // ✅ State mới cho doanh thu theo thời gian
  const [revenueByDate, setRevenueByDate] = useState({
    today: 0,
    thisMonth: 0,
    thisYear: 0,
  });

  // ✅ State cho khoảng thời gian tùy chỉnh
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customRevenue, setCustomRevenue] = useState(0);

  // ✅ Helper function: Tính doanh thu theo khoảng thời gian
  const calculateRevenueByDate = (orders) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const successOrders = orders.filter(o => o.status === "success");

    const revenueToday = successOrders.reduce((sum, o) => {
      const orderDate = new Date(o.updatedAt);
      const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      return orderDay.getTime() === today.getTime() ? sum + Number(o.totalPrice || 0) : sum;
    }, 0);

    const revenueThisMonth = successOrders.reduce((sum, o) => {
      const orderDate = new Date(o.updatedAt);
      return (orderDate >= startOfMonth && orderDate < now) ? sum + Number(o.totalPrice || 0) : sum;
    }, 0);

    const revenueThisYear = successOrders.reduce((sum, o) => {
      const orderDate = new Date(o.updatedAt);
      return (orderDate >= startOfYear && orderDate < now) ? sum + Number(o.totalPrice || 0) : sum;
    }, 0);

    return { today: revenueToday, thisMonth: revenueThisMonth, thisYear: revenueThisYear };
  };

  // ✅ Helper function: Tính doanh thu theo khoảng thời gian tùy chỉnh
  const calculateCustomRevenue = (orders, fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999); // Đến hết ngày cuối cùng

    const successOrders = orders.filter(o => o.status === "success");

    return successOrders.reduce((sum, o) => {
      const orderDate = new Date(o.updatedAt);
      return (orderDate >= start && orderDate <= end) ? sum + Number(o.totalPrice || 0) : sum;
    }, 0);
  };

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

        // ✅ 5) Tính doanh thu theo thời gian
        const dateRevenue = calculateRevenueByDate(orders);
        setRevenueByDate(dateRevenue);

        // ✅ Tính doanh thu khoảng thời gian tùy chỉnh nếu đã chọn
        if (startDate && endDate) {
          const custom = calculateCustomRevenue(orders, startDate, endDate);
          console.log("Custom revenue:", custom, "Start:", startDate, "End:", endDate);
          setCustomRevenue(custom);
        }

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
  }, [startDate, endDate]);

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

        
        {/* ✅ Phần hiển thị doanh thu theo thời gian */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#333" }}>Doanh thu theo thời gian</h2>
          <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
            <div
              style={{
                flex: "1 1 200px",
                minWidth: "200px",
                padding: "20px",
                background: "#e8f5e9",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>Hôm nay</h3>
              <p style={{ fontSize: "22px", fontWeight: "bold", color: "#1b5e20", margin: "10px 0" }}>
                {revenueByDate.today.toLocaleString("vi-VN")} ₫
              </p>
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                minWidth: "200px",
                padding: "20px",
                background: "#fff3e0",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#f57c00" }}>Tháng này</h3>
              <p style={{ fontSize: "22px", fontWeight: "bold", color: "#e65100", margin: "10px 0" }}>
                {revenueByDate.thisMonth.toLocaleString("vi-VN")} ₫
              </p>
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
                {new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
              </p>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                minWidth: "200px",
                padding: "20px",
                background: "#e3f2fd",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#1976d2" }}>Năm nay</h3>
              <p style={{ fontSize: "22px", fontWeight: "bold", color: "#0d47a1", margin: "10px 0" }}>
                {revenueByDate.thisYear.toLocaleString("vi-VN")} ₫
              </p>
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>
                Năm {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Phần chọn khoảng thời gian tùy chỉnh */}
        <div style={{ marginTop: "50px", padding: "30px", background: "#f5f5f5", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "25px", color: "#333" }}>Xem doanh thu theo ngày</h2>
          
          <div style={{ display: "flex", gap: "30px", marginBottom: "25px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "2px solid #ddd",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  minWidth: "180px",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="dd/mm/yyyy"
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "2px solid #ddd",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  minWidth: "180px",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>

         
          </div>

          {startDate && endDate && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                background: "#fff",
                borderRadius: "8px",
                border: "3px solid #4CAF50",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ fontSize: "14px", color: "#666", margin: "0 0 12px 0", fontWeight: "500" }}>
                Doanh thu từ <strong>{new Date(startDate).toLocaleDateString("vi-VN")}</strong> đến <strong>{new Date(endDate).toLocaleDateString("vi-VN")}</strong>
              </p>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "#4CAF50", margin: 0 }}>
                {customRevenue.toLocaleString("vi-VN")} ₫
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard;
