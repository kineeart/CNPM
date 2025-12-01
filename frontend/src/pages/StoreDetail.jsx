import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/StoreDetail.css";
import Navbar from "../components/Navbar";
import Notification from "../components/Notification";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StoreDetail = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [notification, setNotification] = useState(null); // popup notification

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeRes = await axios.get(`${BACKEND_URL}/stores/${id}`);
        setStore(storeRes.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải cửa hàng:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products/store/${id}`);
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm:", err);
      }
    };

    fetchStore();
    fetchProducts();
  }, [id]);

  const handleAddToCart = async (product) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      setNotification({ message: "Bạn cần đăng nhập!", type: "error" });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/cart/add`, {
        userId,
        productId: product.id,
        quantity: 1,
      });
      setNotification({ message: "✅ Thêm sản phẩm thành công!", type: "success" });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("❌ Lỗi khi thêm giỏ hàng:", err.response?.data || err.message);
      setNotification({ message: "❌ Thêm giỏ hàng thất bại!", type: "error" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!store) return <p>Đang tải cửa hàng...</p>;

  return (
    <>
      <Navbar />
      <Notification 
        message={notification?.message} 
        type={notification?.type} 
        onClose={() => setNotification(null)} 
      />
      <div className="store-detail-container">
        <h2 className="store-header">🛍️ {store.name}</h2>

        {products.length === 0 ? (
          <p className="loading-text">Không có sản phẩm nào trong cửa hàng này.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div
                  className="product-image"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                ></div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>{product.price} VNĐ</strong>
                  <button onClick={() => handleAddToCart(product)}>🛒 Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StoreDetail;
