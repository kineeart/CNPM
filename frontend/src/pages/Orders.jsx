import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Orders.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = import.meta.env.VITE_BACKEND_URL + "/orders";
const DRONE_API = import.meta.env.VITE_BACKEND_URL;
const STORE_API = import.meta.env.VITE_BACKEND_URL + "/stores";

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id ? Number(user.id) : null;

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
    let timer;
    const poll = async () => {
      try {
        const res = await axios.get(`${DRONE_API}/delivery/progress/${orderId}`);
        const { status: s, progress, position } = res.data || {};
        if (position?.lat != null && position?.lon != null) {
          setDronePos([position.lat, position.lon]);
        }
        if (progress >= 1 || s === "done") {
          clearInterval(timer);
        }
      } catch (e) {
        console.error("❌ Lỗi progress:", e);
      }
    };

    poll();
    timer = setInterval(poll, 1500);
    return () => clearInterval(timer);
  }, [orderId]);

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
  const [storeId, setStoreId] = useState(null);
  const [showDronePopup, setShowDronePopup] = useState(false);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // ✅ 1. Thêm state để lưu tất cả drone của cửa hàng
  const [storeDrones, setStoreDrones] = useState([]);

  const [showMapPopup, setShowMapPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [storeLat, setStoreLat] = useState(null);
  const [storeLon, setStoreLon] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);

  useEffect(() => { 
    fetchStoreOfUser(); 
  }, []);

  const fetchStoreOfUser = async () => {
    try {
      const res = await axios.get(STORE_API);
      const stores = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const myStore = stores.find((s) => Number(s.ownerId ?? s.owner_id) === Number(userId));
      if (!myStore) {
        console.warn("Không tìm thấy cửa hàng của user:", userId, stores);
        return;
      }
      setStoreId(myStore.id);
      fetchOrders(myStore.id);
      // ✅ 2. Gọi hàm lấy tất cả drone của cửa hàng
      fetchAllStoreDrones(myStore.id);
    } catch (err) {
      console.error("❌ Lỗi lấy cửa hàng của user:", err);
    }
  };

  // ✅ 3. Hàm mới để lấy tất cả drone của cửa hàng
  const fetchAllStoreDrones = async (sid) => {
    try {
      const res = await axios.get(`${DRONE_API}/drone-delivery`);
      const allDrones = res.data.data || res.data || [];
      const filteredDrones = allDrones.filter(d => Number(d.storeId) === Number(sid));
      setStoreDrones(filteredDrones);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách drone của cửa hàng:", err);
    }
  };

  const fetchOrders = async (sid) => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
      // Lọc theo storeId cửa hàng của user
      const filtered = res.data.filter(o => Number(o.storeId) === Number(sid));
      setDisplayOrders(filtered);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách đơn:", err);
    }
  };

  const filterByStatus = (status) => {
    setFilterStatus(status);
    const base = orders.filter(o => Number(o.storeId) === Number(storeId));
    setDisplayOrders(status === "ALL" ? base : base.filter(o => o.status === status));
  };

  const handleAction = async (id, nextStatus) => {
    if (nextStatus === "delivering") {
      setSelectedOrderId(id);
      // ✅ Gọi hàm lấy drone rảnh (đã được sửa)
      fetchAvailableDrones();
      setShowDronePopup(true);
      return;
    }
    try {
      await axios.put(`${API_URL}/${id}`, { status: nextStatus });
      // ✅ truyền lại storeId để lọc đúng
      if (storeId) await fetchOrders(storeId);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
    }
  };

  const fetchAvailableDrones = async () => {
    // ✅ 4. Sửa lại để chỉ lấy drone rảnh của cửa hàng hiện tại
    if (!storeId) return; // Không gọi API nếu chưa có storeId

    try {
      const res = await axios.get(`${DRONE_API}/drone-delivery/waiting`, {
        params: { storeId: storeId } // Gửi storeId làm query param
      });
      setAvailableDrones(res.data.data || res.data || []);
    } catch (err) {
      console.error("❌ Lỗi lấy drone:", err);
      setAvailableDrones([]);
    }
  };

  const assignDroneToOrder = async (droneId) => {
    try {
      // Gọi assign (backend tự set order -> delivering, drone -> FLYING)
      await axios.post(`${DRONE_API}/drone-delivery/assign`, { orderId: selectedOrderId, droneId });
      alert("🚁 Drone đã được gán, đơn hàng đang vận chuyển!");
      setShowDronePopup(false);
      if (storeId) {
        fetchOrders(storeId); // Tải lại danh sách đơn hàng để cập nhật trạng thái
      }
    } catch (err) {
      console.error("❌ Lỗi gán drone:", err);
      alert(err.response?.data?.message || "Gán drone thất bại!");
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
          {(() => {
            const base = orders.filter(o => Number(o.storeId) === Number(storeId));
            const total = base.length;
            const processing = base.filter(o => o.status === "processing").length;
            const success = base.filter(o => o.status === "success").length;
            const revenue = base.reduce((sum, o) => sum + (o.status === "success" ? Number(o.totalPrice || 0) : 0), 0);

            return (
              <>
                <div className="overview-box"><h3>{total}</h3><p>Tổng đơn hàng</p></div>
                <div className="overview-box"><h3>{processing}</h3><p>Đang xử lý</p></div>
                <div className="overview-box"><h3>{success}</h3><p>Hoàn thành</p></div>
                {/* ✅ 5. Thêm box hiển thị tổng số drone */}
                <div className="overview-box"><h3>{storeDrones.length}</h3><p>Tổng số Drone</p></div>
                <div className="overview-box">
                  <h3>{revenue.toLocaleString("vi-VN")} ₫</h3>
                  <p>Doanh thu</p>
                </div>
              </>
            );
          })()}
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
