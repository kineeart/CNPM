import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Drone.css";
import Sidebar from "./SidebarBigAdmin";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ 1. Thống nhất và sửa lại URL API
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const DRONE_API_URL = `${API_BASE_URL}/drone-delivery`;
const DELIVERY_API_URL = `${API_BASE_URL}/delivery`;
const STORES_API = `${API_BASE_URL}/stores`;

// Icon cho drone
const droneIcon = new L.Icon({
  iconUrl: "/icons/drone.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function Drone() {
  const [showMap, setShowMap] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [drones, setDrones] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", speed: "" });
  const [assignDroneId, setAssignDroneId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [dronePositions, setDronePositions] = useState({});

  // ✅ 1. State mới cho việc chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, name: "", speed: "" });

  const openMap = (drone) => {
    setSelectedDrone(drone);
    setShowMap(true);
  };

  // ✅ 3. useEffect để theo dõi vị trí drone liên tục
  useEffect(() => {
    const interval = setInterval(async () => {
      const flyingDrones = drones.filter((d) => d.status === "FLYING" && d.orderId);
      if (flyingDrones.length === 0) return;

      const newPositions = { ...dronePositions };
      for (const drone of flyingDrones) {
        try {
          const res = await axios.get(`${DELIVERY_API_URL}/progress/${drone.orderId}`);
          const pos = res.data.position;
          if (pos?.lat != null && pos?.lon != null) {
            newPositions[drone.id] = [pos.lat, pos.lon];
          }
        } catch (err) {
          // Bỏ qua lỗi 404 vì có thể đơn hàng đã hoàn thành
          if (err.response?.status !== 404) {
            console.error(`Lỗi lấy tiến trình drone ${drone.id}:`, err);
          }
        }
      }
      setDronePositions(newPositions);
    }, 2000); // Cập nhật mỗi 2 giây

    return () => clearInterval(interval);
  }, [drones, dronePositions]); // Chạy lại khi danh sách drone thay đổi

  useEffect(() => {
    fetchDrones();
    fetchStores();
  }, []);

  const fetchDrones = async () => {
    try {
      const res = await axios.get(DRONE_API_URL);
      setDrones(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetch drone:", err);
      setDrones([]);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get(STORES_API);
      const storeData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setStores(storeData);
    } catch (err) {
      console.error("❌ Lỗi fetch stores:", err);
      setStores([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ✅ 2. Hàm xử lý thay đổi cho form chỉnh sửa
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert("Tên drone bắt buộc");

    try {
      await axios.post(DRONE_API_URL, {
        name: form.name,
        speed: Number(form.speed) || 0,
      });
      fetchDrones();
      setShowModal(false);
    } catch (err) {
      console.error("❌ Lỗi tạo drone:", err);
      alert("Không thể tạo drone!");
    }
  };

  // ✅ 3. Hàm xử lý cập nhật drone
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.name) return alert("Tên drone bắt buộc");

    try {
      await axios.put(`${DRONE_API_URL}/${editForm.id}`, {
        name: editForm.name,
        speed: Number(editForm.speed) || 0,
      });
      fetchDrones();
      setShowEditModal(false);
    } catch (err) {
      console.error("❌ Lỗi cập nhật drone:", err);
      alert("Không thể cập nhật drone!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá drone này?")) return;
    try {
      await axios.delete(`${DRONE_API_URL}/${id}`);
      fetchDrones();
    } catch (err) {
      console.error("❌ Lỗi xóa drone:", err);
      alert(err.response?.data?.error || "Xóa thất bại!");
    }
  };

  const openAssign = (droneId) => {
    const droneToAssign = drones.find((d) => d.id === droneId);
    setAssignDroneId(droneId);
    setSelectedStore(droneToAssign?.storeId || null);
  };

  const handleAssign = async () => {
    if (!selectedStore) return alert("Chọn cửa hàng để phân phối!");
    try {
      await axios.post(`${DRONE_API_URL}/${assignDroneId}/assign`, { storeId: selectedStore });
      fetchDrones();
      setAssignDroneId(null);
    } catch (err) {
      console.error("❌ Lỗi phân phối drone:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Phân phối thất bại!");
    }
  };

  const openAdd = () => {
    setForm({ name: "", speed: "" });
    setShowModal(true);
  };

  // ✅ 4. Hàm mở modal chỉnh sửa
  const openEdit = (drone) => {
    setEditForm({ id: drone.id, name: drone.name, speed: drone.speed });
    setShowEditModal(true);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="drone-content">
        <div className="drone-header">
          <h2>Quản lý Drone Delivery</h2>
          <button className="add-btn" onClick={openAdd}>
            ➕ Thêm Drone
          </button>
        </div>

        <table className="drone-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Tốc độ</th>
              <th>Status</th>
              <th>Cửa hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {drones.map((d, idx) => (
              <tr key={d.id}>
                <td>{idx + 1}</td>
                <td>{d.name}</td>
                <td>{d.speed} km/h</td>
                <td>{d.status}</td>
                <td>{stores.find((s) => s.id === d.storeId)?.name || "Chưa phân phối"}</td>
                <td>
                  {/* ✅ Chỉ hiển thị nút Xem khi drone đang bay */}
                  {d.status === "FLYING" && (
                    <button className="view-btn" onClick={() => openMap(d)}>
                      Xem
                    </button>
                  )}
                  {/* ✅ 5. Thêm nút Sửa */}
                  <button className="edit-btn" onClick={() => openEdit(d)}>
                    Sửa
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(d.id)}>
                    Xoá
                  </button>
                  {d.status !== "FLYING" && (
                    <button className="assign-btn" onClick={() => openAssign(d.id)}>
                      {d.storeId ? "Chuyển" : "Phân phối"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal Thêm mới */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Thêm Drone</h3>
              <label>Tên Drone</label>
              <input name="name" value={form.name} onChange={handleChange} />
              <label>Tốc độ (km/h)</label>
              <input type="number" name="speed" value={form.speed} onChange={handleChange} />
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  Đóng
                </button>
                <button className="submit-btn" onClick={handleSubmit}>
                  Tạo mới
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ 6. Modal Chỉnh sửa */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Chỉnh sửa Drone</h3>
              <label>Tên Drone</label>
              <input name="name" value={editForm.name} onChange={handleEditChange} />
              <label>Tốc độ (km/h)</label>
              <input type="number" name="speed" value={editForm.speed} onChange={handleEditChange} />
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowEditModal(false)}>
                  Đóng
                </button>
                <button className="submit-btn" onClick={handleUpdate}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Phân phối */}
        {assignDroneId && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Phân phối Drone</h3>
              <label>Chọn cửa hàng</label>
              <select value={selectedStore || ""} onChange={(e) => setSelectedStore(Number(e.target.value) || null)}>
                <option value="">-- Chọn cửa hàng --</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setAssignDroneId(null)}>
                  Đóng
                </button>
                <button className="submit-btn" onClick={handleAssign}>
                  Phân phối
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bản đồ */}
        {showMap && selectedDrone && (
          <div className="modal-overlay">
            <div className="modal-box map-modal">
              <h3>Vị trí Drone: {selectedDrone.name}</h3>
              <div style={{ height: "400px", width: "100%" }}>
                <MapContainer
                  // Lấy vị trí từ state, nếu không có thì dùng tọa độ mặc định
                  center={dronePositions[selectedDrone.id] || [10.77, 106.69]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {/* Chỉ hiển thị Marker nếu có vị trí */}
                  {dronePositions[selectedDrone.id] && (
                    <Marker position={dronePositions[selectedDrone.id]} icon={droneIcon}>
                      <Popup>Vị trí hiện tại của {selectedDrone.name}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowMap(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
