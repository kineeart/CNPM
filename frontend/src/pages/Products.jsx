import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const API_URL = "http://localhost:3000/api/products";
const STORE_API = "http://localhost:3000/api/stores";

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

  // Load stores
  const fetchStores = async () => {
    try {
      const res = await axios.get(STORE_API);
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  // Khi nhấn chỉnh sửa
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

  // Khi nhấn thêm
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

  // Submit form
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <h2>📦 Danh sách sản phẩm</h2>

        <button
          onClick={handleAdd}
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            borderRadius: "6px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          ➕ Thêm sản phẩm
        </button>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
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
                <td>
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "55px", height: "55px", objectFit: "cover" }}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.price} ₫</td>
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

        {/* Popup thêm/chỉnh sửa */}
        {editingProduct && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "400px",
              }}
            >
              <h3>{isAdding ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}</h3>

              {/* storeId */}
              <label>
                Thuộc cửa hàng:
                <select
                  value={formData.storeId}
                  onChange={(e) =>
                    setFormData({ ...formData, storeId: e.target.value })
                  }
                >
                  <option value="">-- Chọn store --</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <br />

              {/* imageUrl */}
              <label>
                Ảnh URL:
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </label>
              <br />

              {/* name */}
              <label>
                Tên:
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>
              <br />

              {/* price */}
              <label>
                Giá:
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </label>
              <br />

              {/* description */}
              <label>
                Mô tả:
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </label>
              <br />

              {/* isAvailable */}
              <label>
                Còn hàng:
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                />
              </label>
              <br />

              {/* soldOutUntil */}
              <label>
                Hết hàng đến:
                <input
                  type="datetime-local"
                  value={formData.soldOutUntil}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soldOutUntil: e.target.value,
                    })
                  }
                />
              </label>
              <br />

              <button type="submit">{isAdding ? "Thêm" : "Lưu"}</button>
              <button type="button" onClick={() => setEditingProduct(null)}>
                Hủy
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
