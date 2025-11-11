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
