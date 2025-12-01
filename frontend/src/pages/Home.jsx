import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/HomePage.css";
import Navbar from "../components/Navbar";

import logo from "/icons/logostore.png"; // 👈 Logo
import bannerImg from "/icons/banner.png"; // 👈 Banner

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [stores, setStores] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/stores`);
        setStores(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách cửa hàng:", err);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products/featured`);
        setFeaturedProducts(res.data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm nổi bật:", err);
      }
    };

    fetchStores();
    fetchFeaturedProducts();
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar logo={logo} />  {/* có thể chỉnh Navbar nhận logo */}

      {/* Banner */}
      <div className="home-banner">
        <img src={bannerImg} alt="Banner" />
      </div>

      <div className="homepage-container">
        {/* CỬA HÀNG */}
        <h2 className="section-title">Danh sách cửa hàng</h2>
        {stores.length === 0 ? (
          <p className="loading-text">Đang tải hoặc chưa có cửa hàng...</p>
        ) : (
          <div className="store-list">
            {stores.map((store) => (
              <div
                key={store.id}
                className="store-card"
                onClick={() => navigate(`/store/${store.id}`)}
              >
                <div
                  className="store-image"
                  style={{ backgroundImage: `url(${store.avatar})` }}
                ></div>
                <div className="store-info">
                  <h3>{store.name}</h3>
                  <p>{store.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SẢN PHẨM NỔI BẬT */}
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        {featuredProducts.length === 0 ? (
          <p className="loading-text">Đang tải sản phẩm...</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div
                  className="product-image"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                ></div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>{product.price} VNĐ</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
