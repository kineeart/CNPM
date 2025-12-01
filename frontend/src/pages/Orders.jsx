import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Orders.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_BACKEND_URL+"/orders";
const DRONE_API = import.meta.env.VITE_BACKEND_URL;

const fetchStore = async (storeId) => {
  try {
    const res = await axios.get(`http://10.112.28.37:3000/api/stores/${storeId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi lấy thông tin store:", err);
    return null;
  }
};

// Haversine distance (km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ICONS
const storeIcon = new L.Icon({ iconUrl: "/icons/store.png", iconSize: [35, 35], iconAnchor: [17, 35] });
const userIcon = new L.Icon({ iconUrl: "/icons/user.png", iconSize: [35, 35], iconAnchor: [17, 35] });
const droneIcon = new L.Icon({ iconUrl: "/icons/drone.png", iconSize: [40, 40], iconAnchor: [20, 20] });

// Popup Map & Drone Animation
const PopupMap = ({ storeLat, storeLon, userLat, userLon, status, droneSpeed, orderId, onClose }) => {
  const [dronePos, setDronePos] = useState([storeLat, storeLon]);
const speed = (Number(droneSpeed) || 30) * 1000; // bay nhanh gấp đôi

  useEffect(() => {
    if (status !== "delivering") return;

    const totalDistance = haversineDistance(storeLat, storeLon, userLat, userLon); // km
    const totalTimeMs = (totalDistance / speed) * 3600 * 1000; // ms
    const startTime = Date.now();

    const timer = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalTimeMs, 1);

      const newLat = storeLat + (userLat - storeLat) * progress;
      const newLon = storeLon + (userLon - storeLon) * progress;
      setDronePos([newLat, newLon]);

      if (progress >= 1) {
        clearInterval(timer);
        try {
          // Update order status
          await axios.put(`${API_URL}/${orderId}`, { status: "success" });
          // Update drone status → waiting
          await axios.put(`${DRONE_API}/delivery/${orderId}/status`, { status: "waiting" });
          window.location.reload();
        } catch (err) {
          console.error("❌ Lỗi cập nhật order/drone:", err);
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [status, speed, storeLat, storeLon, userLat, userLon, orderId]);

  const distance = haversineDistance(storeLat, storeLon, userLat, userLon);
  const estMinutes = (distance / speed) * 60;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h3>🚁 Lộ trình Drone</h3>
        <MapContainer center={[storeLat, storeLon]} zoom={14} style={{ height: "350px", width: "100%", borderRadius: 10 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[storeLat, storeLon]} icon={storeIcon}><Popup>Store</Popup></Marker>
          <Marker position={[userLat, userLon]} icon={userIcon}><Popup>Khách hàng</Popup></Marker>
          <Marker position={dronePos} icon={droneIcon}><Popup>Drone đang bay 🚀</Popup></Marker>
          <Polyline positions={[[storeLat, storeLon], [userLat, userLon]]} color="blue" />
        </MapContainer>
        <div style={{ marginTop: 10 }}>
          <p>📏 Khoảng cách: {distance.toFixed(2)} km</p>
          <p>⏱️ Thời gian dự kiến: {estMinutes.toFixed(1)} phút</p>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showDronePopup, setShowDronePopup] = useState(false);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [showMapPopup, setShowMapPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [storeLat, setStoreLat] = useState(null);
  const [storeLon, setStoreLon] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
      setDisplayOrders(res.data);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách đơn:", err);
    }
  };

  const filterByStatus = (status) => {
    setFilterStatus(status);
    setDisplayOrders(status === "ALL" ? orders : orders.filter(o => o.status === status));
  };

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

  const fetchAvailableDrones = async () => {
    try {
      const res = await axios.get(`${DRONE_API}/drones/waiting`);
      setAvailableDrones(res.data.data);
    } catch (err) {
      console.error("❌ Lỗi lấy drone:", err);
    }
  };

  const assignDroneToOrder = async (droneId) => {
    try {
      await axios.post(`${DRONE_API}/drones/assign`, { orderId: selectedOrderId, droneId });
      await axios.put(`${API_URL}/${selectedOrderId}`, { status: "delivering" });
      alert("🚁 Drone đã được gán, đơn hàng đang vận chuyển!");
      setShowDronePopup(false);
      fetchOrders();
    } catch (err) {
      console.error("❌ Lỗi gán drone:", err);
    }
  };

  const showMap = async (order) => {
    const store = await fetchStore(order.storeId);
    if (!store) return;

    setStoreLat(store.latitude);
    setStoreLon(store.longitude);
    setUserLat(order.latitude);
    setUserLon(order.longitude);
    setSelectedOrder(order);
    setShowMapPopup(true);
  };

  const closePopup = () => {
    setShowMapPopup(false);
    setSelectedOrder(null);
  };

  const renderActionButton = (status, id, order) => {
    switch (status) {
      case "pending":
        return (
          <>
            <button onClick={() => handleAction(id, "confirm")}>Xác nhận</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        );
      case "confirm":
        return (
          <>
            <button onClick={() => handleAction(id, "processing")}>Xử lý</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        );
      case "processing":
        return (
          <>
            <button onClick={() => handleAction(id, "delivering")}>Giao hàng</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        );
      case "delivering":
        return (
          <>
            <button onClick={() => showMap(order)}>Xem bản đồ</button>
            <button onClick={() => handleAction(id, "failed")}>Hủy</button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="orders-page">
        <h2>Danh sách đơn hàng</h2>

        {/* Overview */}
        <div className="overview-container">
          <div className="overview-box"><h3>{orders.length}</h3><p>Tổng đơn hàng</p></div>
          <div className="overview-box"><h3>{orders.filter(o => o.status === "processing").length}</h3><p>Đang xử lý</p></div>
          <div className="overview-box"><h3>{orders.filter(o => o.status === "success").length}</h3><p>Hoàn thành</p></div>
          <div className="overview-box">
            <h3>{orders.reduce((sum,o)=>sum+(o.status==="success"?o.totalPrice:0),0).toLocaleString("vi-VN")} ₫</h3>
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
          ].map(item => (
            <button key={item.key} className={filterStatus === item.key ? "filter-btn active" : "filter-btn"} onClick={() => filterByStatus(item.key)}>
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
              <tr><td colSpan="6" style={{textAlign:"center",padding:"20px"}}>Không có đơn hàng</td></tr>
            ) : displayOrders.map((order,index)=>(
              <tr key={order.id}>
                <td>{index+1}</td>
                <td>{order.id}</td>
                <td>{order.totalPrice.toLocaleString()} ₫</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                <td>{renderActionButton(order.status, order.id, order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup chọn drone */}
      {showDronePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Chọn drone để giao hàng</h3>
            {availableDrones.length === 0 ? <p>Không có drone rảnh!</p> :
              availableDrones.map(d => <button key={d.id} onClick={()=>assignDroneToOrder(d.id)}>Drone #{d.id}</button>)}
            <button onClick={()=>setShowDronePopup(false)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Popup bản đồ */}
      {showMapPopup && selectedOrder && storeLat!=null && userLat!=null && (
        <PopupMap
          storeLat={storeLat}
          storeLon={storeLon}
          userLat={userLat}
          userLon={userLon}
          status={selectedOrder.status}
          droneSpeed={selectedOrder.Drone?.speed || 30}
          orderId={selectedOrder.id}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default Orders;
