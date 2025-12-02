import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Cart.css"; // CSS riêng
import Navbar from "../components/Navbar";  // 👈 THÊM
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải giỏ hàng:", err);
      setCart({ cartitems: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  const increaseQty = async (cartItemId) => {
    try {
      await axios.put(`${BACKEND_URL}/cart/update/${cartItemId}`, {
        quantity: 1,
        action: "increase",
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const decreaseQty = async (cartItemId) => {
    try {
      await axios.put(`${BACKEND_URL}/cart/update/${cartItemId}`, {
        quantity: 1,
        action: "decrease",
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`${BACKEND_URL}/cart/remove/${cartItemId}`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const goToCheckout = () => navigate("/checkout");

 if (loading) return <p>Đang tải giỏ hàng...</p>;

if (!cart || !cart.cartitems || cart.cartitems.length === 0) {
  return (
    <>
      <Navbar />
      <div className="empty-cart-container">
        <div className="empty-cart-box">
          <h2>Giỏ hàng trống</h2>
          <button onClick={() => navigate("/home")} className="back-home-btn">
            Quay về trang chủ
          </button>
        </div>
      </div>
    </>
  );
}


  const cartItems = cart.cartitems;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
     <>
    <Navbar />  {/* Navbar xuất hiện ở mọi trang bạn đặt */}
    <div className="cart-container">
  <div className="cart-items-wrapper">
    <div className="cart-items">
      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="cart-item-image"
          />
          <div className="cart-item-info">
            <span className="cart-item-name">{item.product.name}</span>
            <span className="cart-item-price">{item.product.price.toLocaleString()} VNĐ</span>
            <div className="cart-item-controls">
              <button onClick={() => decreaseQty(item.id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => increaseQty(item.id)}>+</button>
              <span className="cart-item-total">
                {(item.quantity * item.product.price).toLocaleString()} VNĐ
              </span>
              <button onClick={() => removeItem(item.id)} className="remove-btn">
                Xóa
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

<div className="cart-summary">
  <h2>Tổng giỏ hàng</h2>

  <div className="summary-container">
    {/* Bên trái: tổng số lượng và tổng tiền */}
    <div className="summary-details">
      <p>Tổng số lượng: <strong>{totalQuantity}</strong></p>
      <p>Tổng tiền: <strong>{totalPrice.toLocaleString()} VNĐ</strong></p>
    </div>

    {/* Bên phải: nút thanh toán */}
    <div className="summary-actions">
      <button className="checkout-btn" onClick={goToCheckout}>Thanh toán</button>
    </div>
  </div>
</div>


</div>
</>
  );
};

export default Cart;
