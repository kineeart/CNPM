import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Drone.css";
import Sidebar from "./Sidebar";

const API_URL = "http://localhost:3000/api/drone-delivery";

export default function Drone() {
  const [drones, setDrones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", speed: "" });

  useEffect(() => {
    fetchDrones();
  }, []);

const fetchDrones = async () => {
  try {
    const res = await axios.get(API_URL);
    setDrones(res.data.data || []); // Lấy đúng mảng drones từ backend
  } catch (err) {
    console.error("❌ Lỗi fetch drone:", err);
    setDrones([]);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Tên drone bắt buộc");
      return;
    }

    try {
     await axios.post("http://localhost:3000/api/drone-delivery", {
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
          <th>Tốc độ</th>
          <th>Status</th>
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
            <td>
              <button className="delete-btn" onClick={() => handleDelete(d.id)}>Xoá</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

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
  </div>
</div>

  );
}
