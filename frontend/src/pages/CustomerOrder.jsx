import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/CustomerOrder.css";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

// POPUP MAP + DRONE ANIMATION
const PopupMap = ({
  storeLat,
  storeLon,
  userLat,
  userLon,
  status,
  droneSpeed,
  orderId,
  onClose,
}) => {
  const [dronePos, setDronePos] = useState([storeLat, storeLon]);
  const [progress, setProgress] = useState(0); // ✅ 1. Thêm state cho progress

  const distance = haversineDistance(storeLat, storeLon, userLat, userLon);
  const speed = Number(droneSpeed) > 0 ? Number(droneSpeed) : 30;
  const estMinutes = (distance / speed) * 60;
  const remainingDistance = distance * (1 - progress);

  useEffect(() => {
    // ❌ Đang chặn: if (status !== "delivering") return;
    // ✅ Luôn poll khi popup mở để thấy drone bay, kể cả success
    let timer;
    const poll = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/delivery/progress/${orderId}`);
        const { status: s, progress: p, position } = res.data || {};
        if (position?.lat != null && position?.lon != null) {
          setDronePos([position.lat, position.lon]);
        }
        if (typeof p === "number") setProgress(p);
        if (p >= 1 || s === "done") clearInterval(timer);
      } catch (err) {
        console.error("Lỗi cập nhật tiến trình drone:", err);
      }
    };
    poll();
    timer = setInterval(poll, 1500);
    return () => clearInterval(timer);
  }, [orderId]); // ✅ bỏ phụ thuộc vào status

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

          <Marker position={[storeLat, storeLon]} icon={storeIcon}>
            <Popup>Store</Popup>
          </Marker>

          <Marker position={[userLat, userLon]} icon={userIcon}>
            <Popup>Khách hàng</Popup>
          </Marker>

          <Marker position={dronePos} icon={droneIcon}>
            <Popup>
              Drone đang bay 🚀
              {/* ✅ Thông báo mốc 1/3 quãng đường (~33% đến <36%) */}
              {progress >= 0.33 && progress < 0.36 && (
                <div style={{ marginTop: 5, color: '#0c7', fontWeight: 'bold' }}>
                  Đã đi được 1/3 chặng đường! Còn {remainingDistance.toFixed(2)} km.
                </div>
              )}
              {/* ✅ Thông báo mốc 1/2 quãng đường (~50% đến <55%) */}
              {progress >= 0.5 && progress < 0.55 && (
                <div style={{ marginTop: 5, color: 'green', fontWeight: 'bold' }}>
                  Chỉ còn {remainingDistance.toFixed(2)} km nữa!
                </div>
              )}
            </Popup>
          </Marker>

          <Polyline
            positions={[
              [storeLat, storeLon],
              [userLat, userLon],
            ]}
            color="blue"
          />
        </MapContainer>

        {/* ✅ Chỉ hiển thị thống kê khi đã qua 50% */}
        {progress >= 0.5 && (
          <div style={{ marginTop: 10 }}>
            <p>📏 Tổng quãng đường: {distance.toFixed(2)} km</p>
            <p>✅ Quãng đường đã đi: {(distance * progress).toFixed(2)} km</p>
            <p>⏱️ Thời gian dự kiến còn lại: {(estMinutes * (1 - progress)).toFixed(1)} phút</p>
          </div>
        )}
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
        const res = await axios.get(`${BACKEND_URL}/orders/user/${userId}`);
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
                  <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
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
                orderId={selectedOrder.id}
                onClose={closePopup}
              />
            )}
        </div>
      </div>
    </>
  );
};

export default CustomerOrder;
