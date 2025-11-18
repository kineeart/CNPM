import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Customers.css";

const API_URL = "http://localhost:3000/api/users";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi tải users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleDelete = async (id) => {
    if (!confirm("❗ Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

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

  const openAdd = () => {
    setEditUser(null);
    setFormData({ name: "", email: "", phone: "", status: "ACTIVE" });
    setShowForm(true);
  };

  return (
    <div className="customers-container">
      <Sidebar />

      <div className="customers-content">
        <div className="header">
          <h2>Danh sách người dùng</h2>
          <button className="btn-add" onClick={openAdd}>Thêm người dùng</button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="form-box">
            <h3>{editUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}</h3>

            <input
              type="text"
              name="name"
              placeholder="Tên"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />

            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>

            <button className="btn-save" onClick={handleSubmit}>💾 Lưu</button>
          </div>
        )}

        {/* TABLE */}
        <div className="table-container">
          <table className="user-table">
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
                  <td>
                    <span className={u.status === "ACTIVE" ? "active" : "INACTIVE"}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => openEdit(u)}>✏️</button>
                    <button className="btn-delete" onClick={() => handleDelete(u.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Customers;
