import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      alert("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      await axios.post("${BACKEND_URL}/api/cart/add", {
        userId,
        productId: product.id,
        quantity: 1,
      });

      // show popup
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error("❌ Lỗi khi thêm giỏ hàng:", err.response?.data || err.message);
    }
  };

  if (!product) return <p>Đang tải sản phẩm...</p>;

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h2>{product.name}</h2>
        <img src={product.imageUrl} alt={product.name} width={300} />
        <p><strong>Giá:</strong> {product.price} VNĐ</p>
        <p>{product.description}</p>
        <button
          onClick={handleAddToCart}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Thêm vào giỏ hàng 🛒
        </button>
      </div>

      {/* Popup nằm ngoài tất cả, không bị container che */}
      {showPopup && (
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          padding: "15px 25px",
          backgroundColor: "#4caf50",
          color: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 9999,
          animation: "fadeInOut 2s forwards",
        }}>
          Thêm sản phẩm vào giỏ hàng thành công!
        </div>
      )}

      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(20px); }
          }
        `}
      </style>
    </>
  );
};

export default ProductDetail;
