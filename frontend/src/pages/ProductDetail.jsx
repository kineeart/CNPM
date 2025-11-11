import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Bạn cần đăng nhập trước!");
        return;
      }

      const res = await axios.post(
        "http://localhost:3000/api/cart/add",
        { productId: product.id, quantity: 1 }, // chỉ gửi productId và quantity
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Thêm vào giỏ hàng thành công:", res.data);
      alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("❌ Lỗi khi thêm giỏ hàng:", err.response?.data || err.message);
      alert(`❌ Lỗi khi thêm giỏ hàng: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!product) return <p>Đang tải sản phẩm...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{product.name}</h2>
      <img src={product.imageUrl} alt={product.name} width={300} />
      <p><strong>Giá:</strong> {product.price} VNĐ</p>
      <p>{product.description}</p>
      <button onClick={handleAddToCart}>Thêm vào giỏ hàng 🛒</button>
    </div>
  );
};

export default ProductDetail;
