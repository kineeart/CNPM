import React, { useEffect, useState } from "react";
import "../css/Checkout.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [form, setForm] = useState({
    note: "",
    deliveryAddress: "",
    contactPhone: "",
  }); // ✅ KHÔNG XÓA biến này
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
        cartId: cartItems[0]?.cartId, // lấy cartId từ cartItems
        note: form.note, // ✅ sử dụng biến form
        deliveryAddress: form.deliveryAddress,
        contactPhone: form.contactPhone,
      });

      setMessage(`✅ Tạo đơn thành công, orderId: ${res.data.orderId}`);
      setCartItems([]);
      setCartTotal(0);
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn:", err);
      setMessage("❌ Lỗi khi tạo đơn, thử lại sau.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
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
            {/* Form ghi chú, địa chỉ, số điện thoại */}
            <div className="checkout-form">
              <input
                type="text"
                name="note"
                placeholder="Ghi chú"
                value={form.note}
                onChange={handleChange}
              />
              <input
                type="text"
                name="deliveryAddress"
                placeholder="Địa chỉ giao hàng"
                value={form.deliveryAddress}
                onChange={handleChange}
              />
              <input
                type="text"
                name="contactPhone"
                placeholder="Số điện thoại"
                value={form.contactPhone}
                onChange={handleChange}
              />
            </div>
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
              {loading ? "Đang xử lý..." : "Thanh toán"}
            </button>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
