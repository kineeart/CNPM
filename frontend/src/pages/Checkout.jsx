import React, { useEffect, useState } from "react";
import "../css/Checkout.css";
import Navbar from "../components/Navbar";  // 👈 THÊM

import axios from "axios";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form, setForm] = useState({
    note: "",
    deliveryAddress: "",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const fetchCart = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/cart/user/${userId}`);
      setCartItems(res.data.cartitems || []);
      setCartTotal(res.data.totalPrice || 0);
    } catch (err) {
      console.error("❌ Lỗi fetchCart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:3000/api/orders", {
        userId,
        note: form.note,
        deliveryAddress: form.deliveryAddress,
        contactPhone: form.contactPhone,
        cartId: cartItems[0].cartId,
      });
      setMessage(`✅ Đơn hàng #${res.data.orderId} đã tạo thành công! Tổng: ${res.data.total}`);
      setCartItems([]);
      setCartTotal(0);
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn hàng:", err);
      setMessage("❌ Lỗi khi tạo đơn hàng, thử lại sau.");
    }
    setLoading(false);
  };

  return (
    <>
    <Navbar />  {/* Navbar xuất hiện ở mọi trang bạn đặt */}
   <div className="checkout-container">
  <h2>🛒 Thanh toán</h2>
  <div className="checkout-content">
    {/* Cột trái: danh sách sản phẩm */}
   <div className="checkout-left">
  {cartItems.length === 0 ? (
    <p>Giỏ hàng trống</p>
  ) : (
    <div className="cart-items">
      <div className="cart-header">
        <span>Tên</span>
        <span>SL</span>
        <span>Tổng</span>
      </div>

      {cartItems.map((item) => (
        <div key={item.id} className="cart-row">
          <span className="item-name">{item.productName}</span>
          <span>{item.quantity}</span>
          <span>{(item.quantity * item.productPrice).toLocaleString()} VNĐ</span>
        </div>
      ))}
    </div>
  )}
</div>


    {/* Cột phải: tổng số lượng và tổng tiền */}
    <div className="checkout-right">
  <div className="cart-summary1">
    <h3>Tổng giỏ hàng</h3>
    <p>
      Tổng số lượng: <strong>{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong>
    </p>
    <p>
      Tổng tiền: <strong>{cartTotal.toLocaleString()} VNĐ</strong>
    </p>
  </div>

  <button
    onClick={handleCheckout}
    disabled={loading || cartItems.length === 0 || !userId}
    className="checkout-btn-green"
  >
    {loading ? "Đang xử lý..." : "Thanh toán & Tạo đơn"}
  </button>
</div>

  </div>
</div>

 </>
  );
  
};

export default Checkout;
