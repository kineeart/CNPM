import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
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
    <div style={{ padding: "20px" }}>
      {/* Thanh tiêu đề */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🏪 Danh sách cửa hàng</h2>

        {/* 👉 Nút xem giỏ hàng */}
        <button
          onClick={() => navigate("/cart")}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🛒 Xem giỏ hàng
        </button>
      </div>

      {/* Danh sách cửa hàng */}
      {stores.length === 0 ? (
        <p>Đang tải hoặc chưa có cửa hàng...</p>
      ) : (
        <ul>
          {stores.map((store) => (
            <li
              key={store.id}
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <strong>{store.name}</strong> — {store.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomePage;
