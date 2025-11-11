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
      <h2>🏪 Danh sách cửa hàng</h2>
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
