import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Orders.css";

const API_URL = "http://localhost:3000/api/orders";
const DRONE_API = "http://localhost:3000/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [showDronePopup, setShowDronePopup] = useState(false);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // --- Lấy danh sách đơn ---
  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
      setDisplayOrders(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách đơn:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Lọc theo trạng thái ---
  const filterByStatus = (status) => {
    setFilterStatus(status);
    setDisplayOrders(
      status === "ALL" ? orders : orders.filter((o) => o.status === status)
    );
  };

  // --- Cập nhật trạng thái ---
  const handleAction = async (id, nextStatus) => {
    if (nextStatus === "delivering") {
      setSelectedOrderId(id);
      fetchAvailableDrones();
      setShowDronePopup(true);
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}`, { status: nextStatus });
      fetchOrders();
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
    }
  };

  // --- Lấy danh sách drone WAITING ---
  const fetchAvailableDrones = async () => {
    try {
      const res = await axios.get(`${DRONE_API}/drones/waiting`);
      setAvailableDrones(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy drone:", err);
    }
  };

  // --- Gán drone cho đơn hàng (frontend) ---
  const assignDroneToOrder = async (droneId) => {
    try {
      await axios.post(`${DRONE_API}/drones/assign`, {
        orderId: selectedOrderId,
        droneId,
      });

      alert("🚁 Drone đã được gán cho đơn hàng!");
      setShowDronePopup(false);
      fetchOrders();
    } catch (err) {
      console.error("❌ Lỗi gán drone:", err);
    }
  };

  // --- Render nút hành động ---
  const renderActionButton = (status, id) => {
    return (
      <>
        {status === "pending" && (
          <>
            <button onClick={() => handleAction(id, "confirm")}>Xác nhận</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        )}
        {status === "confirm" && (
          <>
            <button onClick={() => handleAction(id, "processing")}>Xử lý</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        )}
        {status === "processing" && (
          <>
            <button onClick={() => handleAction(id, "delivering")}>Giao hàng</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        )}
        {status === "delivering" && (
          <>
            <button onClick={() => handleAction(id, "success")}>Thành công</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        )}
      </>
    );
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
                .reduce((sum, o) => sum + (o.status === "success" ? o.totalPrice : 0), 0)
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
              className={filterStatus === item.key ? "filter-btn active" : "filter-btn"}
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
                  <td>{renderActionButton(order.status, order.id)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup chọn drone */}
      {showDronePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Chọn drone để giao hàng</h3>
            {availableDrones.length === 0 ? (
              <p>Không có drone rảnh!</p>
            ) : (
              availableDrones.map((d) => (
                <button key={d.id} onClick={() => assignDroneToOrder(d.id)}>
                  Drone #{d.id}
                </button>
              ))
            )}
            <button onClick={() => setShowDronePopup(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
