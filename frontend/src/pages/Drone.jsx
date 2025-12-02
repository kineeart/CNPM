import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Drone.css";
import Sidebar from "./SidebarBigAdmin";

const API_URL = import.meta.env.VITE_BACKEND_URL + "/drone-delivery";
const STORES_API = import.meta.env.VITE_BACKEND_URL + "/stores";


export default function Drone() {
  const [drones, setDrones] = useState([]);
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", speed: "" });
  const [assignDroneId, setAssignDroneId] = useState(null);
  // Sửa: selectedStore nên là number hoặc null
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchDrones();
    fetchStores();
  }, []);

  const fetchDrones = async () => {
    try {
      const res = await axios.get(API_URL);
      setDrones(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetch drone:", err);
      setDrones([]);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get(STORES_API);
      // ✅ Sửa lại để xử lý đúng cấu trúc dữ liệu trả về
      // API có thể trả về mảng trực tiếp hoặc object { data: [...] }
      const storeData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setStores(storeData);
    } catch (err) {
      console.error("❌ Lỗi fetch stores:", err);
      setStores([]);
    }
  };

  // ... (handleChange, handleSubmit, handleDelete không đổi) ...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert("Tên drone bắt buộc");

    try {
      await axios.post(API_URL, {
        name: form.name,
        speed: Number(form.speed) || 0
      });
      fetchDrones();
      setShowModal(false);
    } catch (err) {
      console.error("❌ Lỗi tạo drone:", err);
      alert("Không thể tạo drone!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá drone này?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchDrones();
    } catch (err) {
      console.error("❌ Lỗi xóa drone:", err);
      alert(err.response?.data?.error || "Xóa thất bại!");
    }
  };


  const openAssign = (droneId) => {
    const droneToAssign = drones.find(d => d.id === droneId);
    setAssignDroneId(droneId);
    // ✅ Gán sẵn cửa hàng hiện tại của drone vào modal
    setSelectedStore(droneToAssign?.storeId || null);
  };

  const handleAssign = async () => {
    if (!selectedStore) return alert("Chọn cửa hàng để phân phối!");
    try {
      await axios.post(`${API_URL}/${assignDroneId}/assign`, { storeId: selectedStore });
      fetchDrones(); // Tải lại danh sách drone để cập nhật UI
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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="drone-content">
        <div className="drone-header">
          <h2>Quản lý Drone Delivery</h2>
          <button className="add-btn" onClick={openAdd}>➕ Thêm Drone</button>
        </div>

        <table className="drone-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Tốc độ (km/h)</th>
              <th>Status</th>
              <th>Cửa hàng</th> {/* ✅ Thêm cột cửa hàng */}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {drones.map((d, idx) => (
              <tr key={d.id}>
                <td>{idx + 1}</td>
                <td>{d.name}</td>
                <td>{d.speed}</td>
                <td>{d.status}</td>
                {/* ✅ Hiển thị tên cửa hàng */}
                <td>{stores.find(s => s.id === d.storeId)?.name || 'Chưa phân phối'}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(d.id)}>Xoá</button>
                  {/* ✅ Cho phép phân phối/chuyển cửa hàng khi không đang bay */}
                  {d.status !== "FLYING" && (
                    <button className="assign-btn" onClick={() => openAssign(d.id)}>
                      {d.storeId ? 'Chuyển cửa hàng' : '🚀 Phân phối'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ... (Modal tạo drone không đổi) ... */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Thêm Drone</h3>
              <label>Tên Drone</label>
              <input name="name" value={form.name} onChange={handleChange} />
              <label>Tốc độ (km/h)</label>
              <input type="number" name="speed" value={form.speed} onChange={handleChange} />
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowModal(false)}>Đóng</button>
                <button className="submit-btn" onClick={handleSubmit}>Tạo mới</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal phân phối drone */}
        {assignDroneId && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Phân phối Drone</h3>
              <label>Chọn cửa hàng</label>
              {/* ✅ Sửa select để xử lý number */}
              <select value={selectedStore || ''} onChange={e => setSelectedStore(Number(e.target.value) || null)}>
                <option value="">-- Chọn cửa hàng --</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setAssignDroneId(null)}>Đóng</button>
                <button className="submit-btn" onClick={handleAssign}>Phân phối</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
