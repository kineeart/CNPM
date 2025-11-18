import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";  // 👈 THÊM
import "../css/CustomerOrder.css";


const CustomerOrder = () => {
  const [orders, setOrders] = useState([]); // ✅ khởi tạo là mảng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const STATUS_MAP = {
    pending: { label: "Chưa xác nhận", icon: "🕒", color: "#ffc107" },
    confirm: { label: "Xác nhận", icon: "✅", color: "#007bff" },
    processing: { label: "Đang xử lý", icon: "⚙️", color: "#6f42c1" },
    delivering: { label: "Vận chuyển", icon: "🚚", color: "#17a2b8" },
    success: { label: "Thành công", icon: "🌟", color: "#28a745" },
    failed: { label: "Hủy", icon: "❌", color: "#dc3545" },
  };
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("Bạn cần đăng nhập để xem đơn hàng.");
      return;
    }

    const fetchOrders = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/orders/user/${userId}`
    );

    // Lấy mảng orders từ object
    if (Array.isArray(response.data.orders)) {
      setOrders(response.data.orders);
    } else {
      console.warn("API không trả về mảng:", response.data);
      setOrders([]);
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
    setError("Không thể tải đơn hàng.");
  } finally {
    setLoading(false);
  }
};


    fetchOrders();
  }, [userId]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

 return (
  <>
    <Navbar />
    <div className="order-page-wrapper">
      <div className="order-container">
        <h2>🧾 Đơn hàng của bạn</h2>

        {orders.length === 0 ? (
          <div className="no-orders-message">Bạn chưa có đơn hàng nào.</div>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đơn</th>
                <th>Giá tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>#{order.id}</td>
                  <td>{new Intl.NumberFormat('vi-VN').format(order.totalPrice)} VNĐ</td>
                  <td>{new Date(order.createAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className="status-icon">
                      {STATUS_MAP[order.status]?.icon || "❓"}
                    </span>
                    {STATUS_MAP[order.status]?.label || order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </>
);

};

export default CustomerOrder;
