import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/StoreDetail.css";
import Navbar from "../components/Navbar";

const StoreDetail = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeRes = await axios.get(`http://localhost:3000/api/stores/${id}`);
        setStore(storeRes.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải cửa hàng:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/store/${id}`);
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
      alert("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/cart/add", {
        userId,
        productId: product.id,
        quantity: 1,
      });
      console.log(`✅ Đã thêm sản phẩm vào giỏ của userId = ${userId}`);
      console.log(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi thêm giỏ hàng:", err.response?.data || err.message);
    }
  };

  if (!store) return <p>Đang tải cửa hàng...</p>;

  return (
    <>
      <Navbar />
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
