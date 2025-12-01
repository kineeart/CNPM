import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Products.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_USERS = `${BACKEND_URL}/users`;
const API_PRODUCTS = `${BACKEND_URL}/products`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    storeId: "",
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    isAvailable: true,
    soldOutUntil: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get(STORE_API);
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    setIsAdding(false);
    setFormData({
      storeId: p.storeId,
      name: p.name,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable,
      soldOutUntil: p.soldOutUntil ? p.soldOutUntil.substring(0, 16) : "",
    });
  };

  const handleAdd = () => {
    setEditingProduct({});
    setIsAdding(true);
    setFormData({
      storeId: "",
      name: "",
      price: "",
      description: "",
      imageUrl: "",
      isAvailable: true,
      soldOutUntil: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await axios.post(API_URL, formData);
        alert("Thêm sản phẩm thành công!");
      } else {
        await axios.put(`${API_URL}/${editingProduct.id}`, formData);
        alert("Cập nhật sản phẩm thành công!");
      }
      fetchProducts();
      setEditingProduct(null);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi xử lý sản phẩm");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="products-page">
        <h2>Danh sách sản phẩm</h2>
        <button className="add-btn" onClick={handleAdd}>➕ Thêm sản phẩm</button>

        <table className="products-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Store</th>
              <th>Hình ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.Store ? p.Store.name : "Không có"}</td>
                <td><img src={p.imageUrl} alt={p.name} /></td>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString()} ₫</td>
                <td>{p.description}</td>
                <td>{p.isAvailable ? "✔ Còn hàng" : "❌ Hết hàng"}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Sửa</button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Xác nhận xóa?")) {
                        await axios.delete(`${API_URL}/${p.id}`);
                        fetchProducts();
                      }
                    }}
                    style={{ marginLeft: "8px" }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingProduct && (
          <div className="popup-overlay">
            <form className="popup-form" onSubmit={handleSubmit}>
              <h3>{isAdding ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}</h3>

              <label>
                Thuộc cửa hàng:
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn store --</option>
                  {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>

              <label>
                Ảnh URL:
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </label>

              <label>
                Tên:
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>

              <label>
                Giá:
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </label>

              <label>
                Mô tả:
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </label>

              <label>
                Còn hàng:
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
              </label>

              <label>
                Hết hàng đến:
                <input
                  type="datetime-local"
                  value={formData.soldOutUntil}
                  onChange={(e) => setFormData({ ...formData, soldOutUntil: e.target.value })}
                />
              </label>

              <button type="submit">{isAdding ? "Thêm" : "Lưu"}</button>
              <button type="button" onClick={() => setEditingProduct(null)}>Hủy</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
