import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Customers.css";

const API_URL = "http://localhost:3000/api/users";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
    status: "ACTIVE",
    address: "",
    ward: "",
    district: "",
    province: ""
  };

  const [formData, setFormData] = useState(initialFormData);

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editUser) {
        // Chỉ gửi những field có thể update
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
        };
        await axios.put(`${API_URL}/${editUser.id}`, updateData);
      } else {
        // Tạo user từ admin
        await axios.post(`${API_URL}/admin`, formData);
      }

      setShowForm(false);
      setEditUser(null);
      setFormData(initialFormData);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Có lỗi xảy ra. Kiểm tra console để biết chi tiết.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("❗ Bạn có chắc chắn muốn xóa người dùng này?")) return;
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
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "", // không hiển thị mật khẩu cũ
      role: u.role || "CUSTOMER",
      status: u.status || "ACTIVE",
      address: u.address || "",
      ward: u.ward || "",
      district: u.district || "",
      province: u.province || ""
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditUser(null);
    setFormData(initialFormData);
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

            <input type="text" name="name" placeholder="Tên" value={formData.name} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
            {!editUser && (
              <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} />
            )}

            <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} />
            <input type="text" name="ward" placeholder="Phường/Xã" value={formData.ward} onChange={handleChange} />
            <input type="text" name="district" placeholder="Quận/Huyện" value={formData.district} onChange={handleChange} />
            <input type="text" name="province" placeholder="Tỉnh/Thành phố" value={formData.province} onChange={handleChange} />

            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="STORE_ADMIN">STORE_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
            </select>

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
                <th>Role</th>
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
                  <td>{u.role}</td>
                  <td>
                    <span className={u.status === "ACTIVE" ? "active" : "inactive"}>
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
