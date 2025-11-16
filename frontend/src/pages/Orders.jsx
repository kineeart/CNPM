import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const API_URL = "http://localhost:3000/api/orders";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Load orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
      setDisplayOrders(res.data);
    } catch (error) {
      console.error("❌ Lỗi lấy danh sách đơn:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc theo trạng thái
  const filterByStatus = (status) => {
    setFilterStatus(status);
    if (status === "ALL") setDisplayOrders(orders);
    else setDisplayOrders(orders.filter((o) => o.status === status));
  };

  // Cập nhật trạng thái đơn hàng
  const handleAction = async (id, nextStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: nextStatus });
      fetchOrders();
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
    }
  };

  // Nút hành động theo trạng thái
  const renderActionButton = (status, id) => {
    const actionStyle = { ...actionBtn, marginRight: "8px" };

    switch (status) {
      case "pending":
        return (
          <div>
            <button style={actionStyle} onClick={() => handleAction(id, "confirm")}>
              Xác nhận
            </button>
            <button style={actionBtn} onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </div>
        );
      case "confirm":
        return (
          <div>
            <button style={actionStyle} onClick={() => handleAction(id, "processing")}>
              Xử lý
            </button>
            <button style={actionBtn} onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </div>
        );
      case "processing":
        return (
          <div>
            <button style={actionStyle} onClick={() => handleAction(id, "delivering")}>
              Giao hàng
            </button>
            <button style={actionBtn} onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </div>
        );
      case "delivering":
        return (
          <div>
            <button style={actionStyle} onClick={() => handleAction(id, "success")}>
              Thành công
            </button>
            <button style={actionBtn} onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDetail = (id) => {
    alert("Xem chi tiết đơn: " + id);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar trái */}
      <Sidebar />

      {/* Nội dung bên phải */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>📦 Danh sách đơn hàng</h2>

        {/* Overview */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {[
            { label: "Tổng đơn hàng", value: orders.length },
            { label: "Đang xử lý", value: orders.filter((o) => o.status === "processing").length },
            { label: "Hoàn thành", value: orders.filter((o) => o.status === "success").length },
            {
              label: "Doanh thu",
              value:
                orders.reduce((sum, o) => sum + (o.status === "success" ? o.totalPrice : 0), 0) +
                " ₫",
            },
          ].map((box, i) => (
            <div key={i} style={overviewBox}>
              <h3>{box.value}</h3>
              <p>{box.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ marginTop: "30px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
          {[
            { label: "Tất cả", key: "ALL" },
            { label: "Chưa xác nhận", key: "pending" },
            { label: "Xác nhận", key: "confirm" },
            { label: "Đang xử lý", key: "processing" },
            { label: "Vận chuyển", key: "delivering" },
            { label: "Thành công", key: "success" },
            { label: "Hủy", key: "failed" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => filterByStatus(item.key)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                background: filterStatus === item.key ? "#007bff" : "#ddd",
                color: filterStatus === item.key ? "#fff" : "#000",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <table style={{ width: "100%", marginTop: "25px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={thStyle}>STT</th>
              <th style={thStyle}>Mã đơn</th>
              <th style={thStyle}>Giá tiền</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Thời gian</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                  Không có đơn hàng
                </td>
              </tr>
            ) : (
              displayOrders.map((order, index) => (
                <tr key={order.id} style={rowStyle}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{order.id}</td>
                  <td style={tdStyle}>{order.totalPrice} ₫</td>
                  <td style={tdStyle}>{order.status}</td>
                  <td style={tdStyle}>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                  <td style={tdStyle}>
                    <button style={btnStyle} onClick={() => handleDetail(order.id)}>
                      Chi tiết
                    </button>
                    {renderActionButton(order.status, order.id)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ===== CSS ===== */
const overviewBox = {
  background: "#7b5252ff",
  padding: "15px 20px",
  borderRadius: "10px",
  color: "#fff",
};

const thStyle = { padding: "10px", borderBottom: "2px solid #ccc" };
const tdStyle = { padding: "10px", borderBottom: "1px solid #ddd" };
const rowStyle = { backgroundColor: "#795555ff", color: "white" };
const btnStyle = {
  marginRight: "8px",
  padding: "6px 12px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const actionBtn = {
  padding: "6px 12px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Orders;
