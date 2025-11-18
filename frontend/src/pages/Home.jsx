import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/HomePage.css";
import Navbar from "../components/Navbar";  // 👈 THÊM

const Home = () => {
  
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/stores");
        setStores(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách cửa hàng:", err);
      }
    };
    fetchStores();
  }, []);

return (
  <>
    <Navbar />  {/* Navbar xuất hiện ở mọi trang bạn đặt */}
    <div className="homepage-container">
      {/* HEADER */}
      <div className="header">
        <h2>Danh sách cửa hàng</h2>
      
      </div>

      {/* STORE GRID */}
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
    </div>
  </>
);

  
};

export default Home;
