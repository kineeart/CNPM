import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Store.css"; // 👈 import CSS

const Store = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/stores");
      setStores(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Lỗi fetchStores:", err);
    }
  };

  const deleteStore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa cửa hàng này?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/stores/${id}`);
      setStores(stores.filter((s) => s.id !== id));
    } catch (err) {
      console.error("❌ Lỗi deleteStore:", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="store-container">
      <Sidebar />
      <div className="store-content">
        <h1>Danh sách cửa hàng</h1>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Avatar</th>
              <th>Địa chỉ</th>
              <th>Phường</th>
              <th>Quận/Huyện</th>
              <th>Tỉnh/TP</th>
              <th>Phone</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.id}</td>
                <td>{store.name}</td>
                <td>{store.description}</td>
                <td>
                  {store.avatar && <img src={store.avatar} alt="avatar" />}
                </td>
                <td>{store.address}</td>
                <td>{store.ward}</td>
                <td>{store.district}</td>
                <td>{store.province}</td>
                <td>{store.phone}</td>
                <td>
                  <button
                    className="admin-btn btn-delete"
                    onClick={() => deleteStore(store.id)}
                  >
                    Xóa
                  </button>
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
