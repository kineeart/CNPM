import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Products.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_PRODUCTS = `${BACKEND_URL}/products`;
const STORE_API = `${BACKEND_URL}/stores`;

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id ? Number(user.id) : null;

const Products = () => {
  const [storeId, setStoreId] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    storeId: "",
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    isAvailable: true,
    inventory: 0, // ✅ Thêm
    soldOutUntil: "",
  });

  // 🟦 1. Lấy cửa hàng của user
  const fetchStoreOfUser = async () => {
    try {
      const res = await axios.get(STORE_API);
      // Ép kiểu để tránh lệch kiểu dữ liệu
      const store = res.data.find((s) => Number(s.ownerId) === Number(userId));
      if (!store) {
        console.warn("Không tìm thấy store của user:", userId);
        return;
      }
      setStoreId(store.id);
    } catch (e) {
      console.error("Lỗi fetchStoreOfUser:", e);
    }
  };

  useEffect(() => {
    fetchStoreOfUser();
  }, []);

  // 🟩 2. Khi có storeId → load sản phẩm
  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  // 🟦 3. Load sản phẩm
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_PRODUCTS}/store/${storeId}`, {
        params: { userId }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    }
  };

  // 🟦 4. Bấm sửa
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
      inventory: p.inventory, // ✅ Thêm
      soldOutUntil: p.soldOutUntil
        ? p.soldOutUntil.substring(0, 16)
        : "",
    });
  };

  // 🟦 5. Bấm thêm
  const handleAdd = () => {
    setEditingProduct({});
    setIsAdding(true);
    setFormData({
      storeId,
      name: "",
      price: "",
      description: "",
      imageUrl: "",
      isAvailable: true,
      inventory: 0, // ✅ Thêm
      soldOutUntil: "",
    });
  };

  // 🟦 6. Submit thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!storeId) {
      alert("Không tìm thấy storeId!");
      return;
    }

    const priceNum = Number(formData.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert("Giá sản phẩm phải ≥ 0");
      return;
    }
    // ✅ Thêm validation cho inventory
    const inventoryNum = Number(formData.inventory);
    if (Number.isNaN(inventoryNum) || inventoryNum < 0) {
      alert("Tồn kho phải là số và ≥ 0");
      return;
    }

    const dataToSend = { ...formData, storeId, price: priceNum, inventory: inventoryNum }; // ✅ Thêm

    try {
      if (isAdding) {
        await axios.post(API_PRODUCTS, dataToSend, { params: { userId } });
        alert("Thêm sản phẩm thành công!");
      } else {
        await axios.put(`${API_PRODUCTS}/${editingProduct.id}`, dataToSend, { params: { userId } });
        alert("Cập nhật sản phẩm thành công!");
      }

      fetchProducts();
      setEditingProduct(null);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi xử lý sản phẩm!");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="products-page">
        <h2>Danh sách sản phẩm</h2>

        <button className="add-btn" onClick={handleAdd}>
          ➕ Thêm sản phẩm
        </button>

        <table className="products-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Hình ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th> {/* ✅ Thêm cột */}
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td><img src={p.imageUrl} alt={p.name} /></td>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString()} ₫</td>
                <td>{p.inventory}</td> {/* ✅ Thêm dữ liệu */}
                <td>{p.description}</td>
                <td>{p.isAvailable ? "✔ Còn hàng" : "❌ Hết hàng"}</td>

                <td>
                  <button onClick={() => handleEdit(p)}>Sửa</button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Xác nhận xóa?")) {
                        try {
                          await axios.delete(`${API_PRODUCTS}/${p.id}`, {
                            params: { userId } // 👈 truyền userId bắt buộc
                          });
                          fetchProducts();
                        } catch (err) {
                          console.error("Xóa sản phẩm lỗi:", err.response?.data || err.message);
                          alert(err.response?.data?.message || "Không thể xóa sản phẩm");
                        }
                      }
                    }}
                    style={{ marginLeft: 8 }}
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
                Ảnh URL:
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Tên:
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Giá:
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Math.max(0, Number(e.target.value || 0)) })
                  }
                  required
                />
              </label>

              <label>
                Tồn kho:
                <input
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={(e) =>
                    setFormData({ ...formData, inventory: Math.max(0, Number(e.target.value || 0)) })
                  }
                  required
                />
              </label>

              <label>
                Mô tả:
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </label>

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

              <button type="submit">
                {isAdding ? "Thêm" : "Lưu"}
              </button>

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
