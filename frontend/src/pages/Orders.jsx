import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Orders.css";

const API_URL = "http://localhost:3000/api/orders";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

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

  const filterByStatus = (status) => {
    setFilterStatus(status);
    setDisplayOrders(
      status === "ALL" ? orders : orders.filter((o) => o.status === status)
    );
  };

  const handleAction = async (id, nextStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: nextStatus });
      fetchOrders();
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
    }
  };

  const renderActionButton = (status, id) => {
    return (
      <>
        {status === "pending" && (
          <>
            <button className="action-btn" onClick={() => handleAction(id, "confirm")}>
              Xác nhận
            </button>
            <button className="action-btn cancel" onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </>
        )}

        {status === "confirm" && (
          <>
            <button className="action-btn" onClick={() => handleAction(id, "processing")}>
              Xử lý
            </button>
            <button className="action-btn cancel" onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </>
        )}

        {status === "processing" && (
          <>
            <button className="action-btn" onClick={() => handleAction(id, "delivering")}>
              Giao hàng
            </button>
            <button className="action-btn cancel" onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </>
        )}

        {status === "delivering" && (
          <>
            <button className="action-btn" onClick={() => handleAction(id, "success")}>
              Thành công
            </button>
            <button className="action-btn cancel" onClick={() => handleAction(id, "failed")}>
              Hủy
            </button>
          </>
        )}
      </>
    );
  };

  const handleDetail = (id) => {
    alert("Xem chi tiết đơn: " + id);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="orders-page">
        <h2>Danh sách đơn hàng</h2>

        {/* Overview */}
        <div className="overview-container">
          <div className="overview-box">
            <h3>{orders.length}</h3>
            <p>Tổng đơn hàng</p>
          </div>

          <div className="overview-box">
            <h3>{orders.filter((o) => o.status === "processing").length}</h3>
            <p>Đang xử lý</p>
          </div>

          <div className="overview-box">
            <h3>{orders.filter((o) => o.status === "success").length}</h3>
            <p>Hoàn thành</p>
          </div>

          <div className="overview-box">
            <h3>
              {orders
                .reduce(
                  (sum, o) => sum + (o.status === "success" ? o.totalPrice : 0),
                  0
                )
                .toLocaleString("vi-VN")} ₫
            </h3>
            <p>Doanh thu</p>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-container">
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
              className={
                filterStatus === item.key
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => filterByStatus(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <table className="orders-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã đơn</th>
              <th>Giá tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {displayOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Không có đơn hàng
                </td>
              </tr>
            ) : (
              displayOrders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.id}</td>
                  <td>{order.totalPrice.toLocaleString()} ₫</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    

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

export default Orders;
