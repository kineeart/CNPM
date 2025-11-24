import React, { useEffect, useState } from "react";
import "../css/Checkout.css";
import Navbar from "../components/Navbar";
import axios from "axios";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Lấy giỏ hàng
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

  // -------------- BỎ ZALOPAY — thay bằng checkout đơn giản ------------------
  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;

    setLoading(true);

    try {
      // Bạn có thể gửi dữ liệu đơn hàng vào backend nếu muốn
      // tạm thời chỉ demo thành công
      alert("🎉 Thanh toán thành công (demo – không dùng ZaloPay)!");
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      alert("❌ Lỗi thanh toán, vui lòng thử lại.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="checkout-container">
        <h2>🛒 Thanh toán</h2>
        <div className="checkout-content">

          {/* Giỏ hàng */}
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

                {cartItems.map(item => (
                  <div key={item.id} className="cart-row">
                    <span className="item-name">{item.productName}</span>
                    <span>{item.quantity}</span>
                    <span>{(item.quantity * item.productPrice).toLocaleString()} VNĐ</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tổng tiền */}
          <div className="checkout-right">
            <div className="cart-summary1">
              <h3>Tổng giỏ hàng</h3>
              <p>
                Tổng số lượng:{" "}
                <strong>{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong>
              </p>
              <p>
                Tổng tiền:{" "}
                <strong>{cartTotal.toLocaleString()} VNĐ</strong>
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
              className="checkout-btn-green"
            >
              {loading ? "Đang xử lý..." : "Thanh toán"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Checkout;
