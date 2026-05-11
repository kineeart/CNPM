"use client";

import React, { useEffect, useState, type CSSProperties } from "react";
import Sidebar from "../../components/Sidebar";

const cardStyle: CSSProperties = {
  flex: "1 1 200px",
  padding: "20px",
  background: "#ecf0f1",
  borderRadius: "10px",
  textAlign: "center",
};

const valueStyle: CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
};

type OrderLike = {
  status?: string;
  totalPrice?: number | string;
  updatedAt?: string;
  storeId?: number | string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [revenueByDate, setRevenueByDate] = useState({
    today: 0,
    thisMonth: 0,
    thisYear: 0,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customRevenue, setCustomRevenue] = useState(0);

  const calculateRevenueByDate = (orders: OrderLike[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const successOrders = orders.filter((order) => order.status === "success");

    const revenueToday = successOrders.reduce((sum, order) => {
      const orderDate = new Date(order.updatedAt || "");
      const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      return orderDay.getTime() === today.getTime() ? sum + Number(order.totalPrice || 0) : sum;
    }, 0);

    const revenueThisMonth = successOrders.reduce((sum, order) => {
      const orderDate = new Date(order.updatedAt || "");
      return orderDate >= startOfMonth && orderDate < now ? sum + Number(order.totalPrice || 0) : sum;
    }, 0);

    const revenueThisYear = successOrders.reduce((sum, order) => {
      const orderDate = new Date(order.updatedAt || "");
      return orderDate >= startOfYear && orderDate < now ? sum + Number(order.totalPrice || 0) : sum;
    }, 0);

    return { today: revenueToday, thisMonth: revenueThisMonth, thisYear: revenueThisYear };
  };

  const calculateCustomRevenue = (orders: OrderLike[], fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 0;

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    const successOrders = orders.filter((order) => order.status === "success");

    return successOrders.reduce((sum, order) => {
      const orderDate = new Date(order.updatedAt || "");
      return orderDate >= start && orderDate <= end ? sum + Number(order.totalPrice || 0) : sum;
    }, 0);
  };

  useEffect(() => {
    const fetchStoreScopedStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const userId = user?.id ? Number(user.id) : null;
        if (!userId) return;

        const storesRes = await fetch("/api/proxy/stores", { cache: "no-store" });
        const stores = await storesRes.json();
        const myStore = (stores || []).find((store: { ownerId?: number | string }) => Number(store.ownerId) === Number(userId));
        if (!myStore) {
          console.warn("Không tìm thấy cửa hàng của user:", userId);
          return;
        }

        const storeId = myStore.id;

        const productsRes = await fetch(`/api/proxy/products/store/${storeId}/public`, { cache: "no-store" });
        const products = await productsRes.json();

        const ordersRes = await fetch("/api/proxy/orders", { cache: "no-store" });
        const ordersAll = await ordersRes.json();
        const orders = (ordersAll || []).filter((order: OrderLike) => Number(order.storeId) === Number(storeId));

        const revenue = orders.reduce((sum: number, order: OrderLike) => {
          return sum + (order.status === "success" ? Number(order.totalPrice || 0) : 0);
        }, 0);

        const dateRevenue = calculateRevenueByDate(orders);
        setRevenueByDate(dateRevenue);

        if (startDate && endDate) {
          const custom = calculateCustomRevenue(orders, startDate, endDate);
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
      <Sidebar />

      <div className="dashboard-content" style={{ flex: 1, padding: "20px" }}>
        <div className="dashboard-badge">CSR</div>
        <p className="dashboard-note">This page fetches data in the browser using useEffect via Next API routes.</p>

        <h1>Tổng quan cửa hàng của bạn</h1>

        <div className="stats" style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
          <div className="stat-card" style={cardStyle}>
            <h3>Sản phẩm</h3>
            <p style={valueStyle}>{stats.products}</p>
          </div>

          <div className="stat-card" style={cardStyle}>
            <h3>Đơn hàng</h3>
            <p style={valueStyle}>{stats.orders}</p>
          </div>

          <div className="stat-card" style={cardStyle}>
            <h3>Doanh thu</h3>
            <p style={valueStyle}>{stats.revenue.toLocaleString("vi-VN")} ₫</p>
          </div>
        </div>

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
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>{new Date().toLocaleDateString("vi-VN")}</p>
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
              <p style={{ fontSize: "12px", color: "#666", margin: "5px 0 0 0" }}>Năm {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "50px", padding: "30px", background: "#f5f5f5", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "25px", color: "#333" }}>Xem doanh thu theo ngày</h2>

          <div style={{ display: "flex", gap: "30px", marginBottom: "25px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "2px solid #ddd",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  minWidth: "180px",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4CAF50")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "2px solid #ddd",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  minWidth: "180px",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4CAF50")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
              />
            </div>
          </div>

          {startDate && endDate ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
