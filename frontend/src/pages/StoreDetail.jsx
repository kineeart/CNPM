import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const StoreDetail = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const navigate = useNavigate();

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
        // ✅ Sửa lại route backend: tạo route /api/products/store/:storeId
        const res = await axios.get(`http://localhost:3000/api/products/store/${id}`);
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải sản phẩm:", err);
      }
    };

    fetchStore();
    fetchProducts();
  }, [id]);

  return (
    <div style={{ padding: "20px" }}>
      {store && <h2>🛍️ {store.name}</h2>}

      {products.length === 0 ? (
        <p>Không có sản phẩm nào trong cửa hàng này.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li
              key={product.id}
              style={{ cursor: "pointer", marginBottom: "15px" }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <img src={product.imageUrl} alt={product.name} width="80" />
              <div>
                <strong>{product.name}</strong> — {product.price} VNĐ
              </div>
              <p>{product.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoreDetail;
