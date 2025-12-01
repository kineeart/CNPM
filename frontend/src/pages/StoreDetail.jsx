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
      setNotification({ message: "Thêm sản phẩm thành công!", type: "success" });
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
      <div className="store-detail-wrapper">
        {/* Div trái */}
        <div className="store-left">
          {store.avatar && (
            <div
              className="store-avatar"
              style={{ backgroundImage: `url(${store.avatar})` }}
            />
          )}
          <div className="store-description">
            <h2>{store.name}</h2>
            <p>{store.description}</p>
          </div>
        </div>

        {/* Div phải */}
        <div className="store-right">
          <h3>Sản phẩm</h3>
          {products.length === 0 ? (
            <p className="loading-text">Chưa có sản phẩm nào.</p>
          ) : (
            <div className="product-grid">
              {products.map((prod) => (
                <div key={prod.id} className="product-card">
                  <div
                    className="product-image"
                    style={{ backgroundImage: `url(${prod.imageUrl})` }}
                  />
                  <div className="product-info">
                    <h3>{prod.name}</h3>
                    <p>{prod.description}</p>
                    <strong>{prod.price.toLocaleString()}₫</strong>
                    <button>Thêm vào giỏ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default StoreDetail;
