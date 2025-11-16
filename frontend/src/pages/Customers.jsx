import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; // import Sidebar

const API_URL = "http://localhost:3000/api/users";
// ⚠️ đổi lại đúng port backend của bạn

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
  });

  // ================== FETCH USERS ==================
  const fetchUsers = async () => {
    try {
const res = await axios.get("http://localhost:3000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================== HANDLE CHANGE ==================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================== ADD or UPDATE ==================
  const handleSubmit = async () => {
    try {
      if (editUser) {
        await axios.put(`${API_URL}/${editUser.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

      setShowForm(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  // ================== DELETE ==================
  const handleDelete = async (id) => {
    if (!confirm("❗ Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  // ================== OPEN EDIT FORM ==================
  const openEdit = (u) => {
    setEditUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
    });
    setShowForm(true);
  };

  // ================== OPEN ADD FORM ==================
  const openAdd = () => {
    setEditUser(null);
    setFormData({ name: "", email: "", phone: "", status: "active" });
    setShowForm(true);
  };

  return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

    <div style={{ padding: "20px" }}>
      <h2>👤 Người dùng</h2>

      <button
        onClick={openAdd}
        style={{
          padding: "8px 15px",
          marginBottom: "15px",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ➕ Thêm người dùng
      </button>

      {/* FORM */}
      {showForm && (
        <div
          style={{
            padding: "20px",
            background: "#f4f4f4",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h3>{editUser ? "✏️ Chỉnh sửa người dùng" : "➕ Thêm người dùng"}</h3>

          <input
            type="text"
            name="name"
            placeholder="Tên"
            value={formData.name}
            onChange={handleChange}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}
          />

          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ padding: "8px", width: "150px" }}
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>

          <br />

          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 15px",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            💾 Lưu
          </button>
        </div>
      )}

      {/* TABLE */}
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.status}</td>
              <td>
                <button onClick={() => openEdit(u)}>✏️ Sửa</button>
                <button onClick={() => handleDelete(u.id)}>🗑 Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </div>
  );
};

export default Customers;
