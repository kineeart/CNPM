import React, { useEffect, useState } from "react";
import axios from "axios";
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
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <h2>Quản lý Drone Delivery</h2>
          <button onClick={openAdd}>➕ Thêm Drone</button>
        </div>

        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
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
            {drones.length > 0 ? (
              drones.map((d, idx) => (
                <tr key={d.id}>
                  <td>{idx + 1}</td>
                  <td>{d.name}</td>
                  <td>{d.speed}</td>
                  <td>{d.status}</td>
                  <td>
                    <button onClick={() => handleDelete(d.id)}>Xoá</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>

        {showModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "#0005",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div style={{ background: "#fff", padding: 20, borderRadius: 10, width: 300 }}>
              <h3>Thêm Drone</h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
                <label>
                  Tên drone:
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>

                <label>
                  Tốc độ (km/h):
                  <input type="number" name="speed" value={form.speed} onChange={handleChange} />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button type="button" onClick={() => setShowModal(false)}>Đóng</button>
                  <button type="submit">Tạo mới</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
