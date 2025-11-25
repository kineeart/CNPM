import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/CustomerOrder.css";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Haversine distance (km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ICONS
const storeIcon = new L.Icon({
  iconUrl: "/icons/store.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const userIcon = new L.Icon({
  iconUrl: "/icons/user.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const droneIcon = new L.Icon({
  iconUrl: "/icons/drone.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// MAP POPUP + DRONE ANIMATION
const PopupMap = ({ storeLat, storeLon, userLat, userLon, status, droneSpeed, orderId, onClose }) => {

  const [dronePos, setDronePos] = useState([storeLat, storeLon]);

  // ---- FIX SPEED ----
  const speed = Number(droneSpeed) > 0 ? Number(droneSpeed) : 30;

 useEffect(() => {
  if (status !== "delivering") return;

  if (!dronePos) {
    setDronePos([storeLat, storeLon]);
  }

  const totalDistance = haversineDistance(storeLat, storeLon, userLat, userLon);

  // Test nhanh hơn (x2, x3, x5 ...)
  const speedMultiplier = 1000;
  const adjustedSpeed = speed * speedMultiplier;

  // Tổng thời gian bay (ms)
  const totalTimeMs = (totalDistance / adjustedSpeed) * 3600 * 1000;

  const startTime = Date.now();

  const timer = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / totalTimeMs, 1);

    const newLat = storeLat + (userLat - storeLat) * progress;
    const newLon = storeLon + (userLon - storeLon) * progress;

    setDronePos([newLat, newLon]);

    // Đến nơi → cập nhật trạng thái
   if (progress >= 1) {
  clearInterval(timer);

  await axios.put(`http://localhost:3000/api/orders/${orderId}`, {
    status: "success",
  });

  window.location.reload();  // 🔄 Reload lại trang
}

  }, 100);

  return () => clearInterval(timer);
}, [status, speed, storeLat, storeLon, userLat, userLon]);


  const distance = haversineDistance(storeLat, storeLon, userLat, userLon);
  const estMinutes = (distance / 100) * 60;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h3>🚁 Lộ trình Drone</h3>

        <MapContainer
          center={[storeLat, storeLon]}
          zoom={14}
          style={{ height: "350px", width: "100%", borderRadius: 10 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Store */}
          <Marker position={[storeLat, storeLon]} icon={storeIcon}>
            <Popup>Store</Popup>
          </Marker>

          {/* User */}
          <Marker position={[userLat, userLon]} icon={userIcon}>
            <Popup>Khách hàng</Popup>
          </Marker>

          {/* Drone */}
          <Marker position={dronePos} icon={droneIcon}>
            <Popup>Drone đang bay 🚀</Popup>
          </Marker>

          <Polyline
            positions={[
              [storeLat, storeLon],
              [userLat, userLon],
            ]}
            color="blue"
          />
        </MapContainer>

        <div style={{ marginTop: 10 }}>
          <p>📏 Khoảng cách: {distance.toFixed(2)} km</p>
          <p>⏱️ Thời gian dự kiến: {estMinutes.toFixed(1)} phút</p>
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT
const CustomerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [storeLat, setStoreLat] = useState(null);
  const [storeLon, setStoreLon] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);

  const [showMapPopup, setShowMapPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const STATUS_MAP = {
    pending: { label: "Chưa xác nhận", icon: "🕒" },
    confirm: { label: "Xác nhận", icon: "✅" },
    processing: { label: "Đang xử lý", icon: "⚙️" },
    delivering: { label: "Vận chuyển", icon: "🚚" },
    success: { label: "Thành công", icon: "🌟" },
    failed: { label: "Hủy", icon: "❌" },
  };

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/orders/user/${userId}`
        );
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const showMap = (order) => {
    setStoreLat(order.Store.latitude);
    setStoreLon(order.Store.longitude);
    setUserLat(order.latitude);
    setUserLon(order.longitude);

    setSelectedOrder(order);
    setShowMapPopup(true);
  };

  const closePopup = () => {
    setShowMapPopup(false);
    setSelectedOrder(null);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <>
      <Navbar />
      <div className="order-page-wrapper">
        <div className="order-container">
          <h2>🧾 Đơn hàng của bạn</h2>

          <table className="order-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã đơn</th>
                <th>Giá tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Map</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, i) => (
                <tr key={order.id}>
                  <td>{i + 1}</td>
                  <td>#{order.id}</td>
                  <td>
                    {new Intl.NumberFormat("vi-VN").format(order.totalPrice)} VNĐ
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    {STATUS_MAP[order.status]?.icon}{" "}
                    {STATUS_MAP[order.status]?.label}
                  </td>

                  <td>
                    {(order.status === "delivering" ||
                      order.status === "success") && (
                      <button onClick={() => showMap(order)}>
                        🗺️ Xem Map
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showMapPopup &&
            storeLat != null &&
            userLat != null &&
            selectedOrder && (
          <PopupMap
  storeLat={storeLat}
  storeLon={storeLon}
  userLat={userLat}
  userLon={userLon}
  status={selectedOrder.status}
  droneSpeed={selectedOrder.Drone?.speed}
  orderId={selectedOrder.id}   //<--- thêm dòng này
  onClose={closePopup}
/>

            )}
        </div>
      </div>
    </>
  );
};

export default CustomerOrder;
