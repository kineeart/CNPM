import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Store.css";

const API_URL = "http://localhost:3000/api/stores";
const API_USER_URL = "http://localhost:3000/api/users"; // để lấy STORE_ADMIN

const Store = () => {
  const [stores, setStores] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [formData, setFormData] = useState({
    ownerId: "",
    name: "",
    description: "",
    address: "",
    ward: "",
    district: "",
    province: "",
    phone: "",
    email: "",
    isActive: true,
  });

  // Lấy danh sách cửa hàng
  const fetchStores = async () => {
    try {
      const res = await axios.get(API_URL);
      setStores(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Lỗi fetchStores:", err);
    }
  };

  // Lấy danh sách STORE_ADMIN để chọn owner
  const fetchAdmins = async () => {
    try {
      const res = await axios.get(API_USER_URL);
      const storeAdmins = res.data.filter((u) => u.role === "STORE_ADMIN");
      setAdmins(storeAdmins);
    } catch (err) {
      console.error("❌ Lỗi fetchAdmins:", err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.ownerId || !formData.name) {
        alert("❌ Vui lòng chọn owner và nhập tên cửa hàng");
        return;
      }

      if (editStore) {
        await axios.put(`${API_URL}/${editStore.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

      setShowForm(false);
      setEditStore(null);
      setFormData({
        ownerId: "",
        name: "",
        description: "",
        address: "",
        ward: "",
        district: "",
        province: "",
        phone: "",
        email: "",
        isActive: true,
      });
      fetchStores();
    } catch (err) {
      console.error("❌ Lỗi submit store:", err);
    }
  };

  const openEdit = (store) => {
    setEditStore(store);
    setFormData({
      ownerId: store.ownerId,
      name: store.name,
      description: store.description || "",
      address: store.address || "",
      ward: store.ward || "",
      district: store.district || "",
      province: store.province || "",
      phone: store.phone || "",
      email: store.email || "",
      isActive: store.isActive,
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditStore(null);
    setFormData({
      ownerId: "",
      name: "",
      description: "",
      address: "",
      ward: "",
      district: "",
      province: "",
      phone: "",
      email: "",
      isActive: true,
    });
    setShowForm(true);
  };

  const deleteStore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cửa hàng này?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setStores(stores.filter((s) => s.id !== id));
    } catch (err) {
      console.error("❌ Lỗi deleteStore:", err);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="store-container">
      <Sidebar />
      <div className="store-content">
        <h1>Danh sách cửa hàng</h1>
        <button onClick={openAdd}>➕ Thêm cửa hàng</button>

        {showForm && (
          <div className="form-box">
            <h3>{editStore ? "Chỉnh sửa cửa hàng" : "Thêm cửa hàng"}</h3>

            <select name="ownerId" value={formData.ownerId} onChange={handleChange}>
              <option value="">-- Chọn STORE_ADMIN --</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>

            <input
              type="text"
              name="name"
              placeholder="Tên cửa hàng"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Mô tả"
              value={formData.description}
              onChange={handleChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleChange}
            />
            <input
              type="text"
              name="ward"
              placeholder="Phường/Xã"
              value={formData.ward}
              onChange={handleChange}
            />
            <input
              type="text"
              name="district"
              placeholder="Quận/Huyện"
              value={formData.district}
              onChange={handleChange}
            />
            <input
              type="text"
              name="province"
              placeholder="Tỉnh/TP"
              value={formData.province}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email cửa hàng"
              value={formData.email}
              onChange={handleChange}
            />
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />{" "}
              Đang hoạt động
            </label>

            <button onClick={handleSubmit}>💾 Lưu</button>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Owner</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Địa chỉ</th>
              <th>Ward</th>
              <th>District</th>
              <th>Province</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Active</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.id}</td>
                <td>{store.owner?.name || "-"}</td>
                <td>{store.name}</td>
                <td>{store.description}</td>
                <td>{store.address}</td>
                <td>{store.ward}</td>
                <td>{store.district}</td>
                <td>{store.province}</td>
                <td>{store.phone}</td>
                <td>{store.email}</td>
                <td>{store.isActive ? "✅" : "❌"}</td>
                <td>
                  <button onClick={() => openEdit(store)}>✏️</button>
                  <button onClick={() => deleteStore(store.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Store;
