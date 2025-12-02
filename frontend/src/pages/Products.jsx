import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "../css/Products.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_PRODUCTS = `${BACKEND_URL}/products`;
const STORE_API = `${BACKEND_URL}/stores`;

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;

const Products = () => {
  const [currentStore, setCurrentStore] = useState(null);

useEffect(() => {
  fetchStoreOfUser().then(store => setCurrentStore(store));
}, []);

  const [products, setProducts] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    storeId: "",
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    isAvailable: true,
    soldOutUntil: "",
  });

  // Load store của user khi mở trang
  useEffect(() => {
    fetchStoreOfUser();
  }, []);

  // Khi có storeId → load sản phẩm
  useEffect(() => {
    if (storeId) fetchProducts();
  }, [storeId]);

  const fetchStoreOfUser = async () => {
    const res = await axios.get(STORE_API);

      const userStore = res.data.find((s) => s.ownerId === userId);
      if (!userStore) {
        alert("Bạn chưa có cửa hàng nào!");
        return;
      }

    setStoreId(userStore.id);
  };

  const fetchProducts = async () => {
    const res = await axios.get(`${API_PRODUCTS}/store/${storeId}`, {
      params: { userId },
    });
    setProducts(res.data);
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
      storeId: storeId, // auto set vào store của user
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
    const storeId = currentStore?.id;
if (!storeId) {
  alert("User chưa có cửa hàng!");
  return;
}


    const dataToSend = { ...formData, storeId }; // gán storeId
    if (isAdding) {
      await axios.post(API_URL, dataToSend);
      alert("Thêm sản phẩm thành công!");
    } else {
      await axios.put(`${API_URL}/${editingProduct.id}`, dataToSend);
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
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>
                  <img src={p.imageUrl} alt={p.name} />
                </td>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString()} ₫</td>
                <td>{p.description}</td>
                <td>{p.isAvailable ? "✔ Còn hàng" : "❌ Hết hàng"}</td>

                <td>
                  <button onClick={() => handleEdit(p)}>Sửa</button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Xác nhận xóa?")) {
                        await axios.delete(`${API_PRODUCTS}/${p.id}`);
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
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
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
