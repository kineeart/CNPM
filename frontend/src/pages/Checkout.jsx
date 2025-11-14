import React, { useEffect, useState } from "react";
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
    <div className="checkout-container">
      <h2 style={{ textAlign: "center" }}>🛒 Thanh toán</h2>
      <div className="checkout-content">
        {/* Cột trái: giỏ hàng */}
        <div className="checkout-left">
          {cartItems.length === 0 ? (
            <p>Giỏ hàng trống</p>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <p>{item.productName}</p>
                    <p>Số lượng: {item.quantity}</p>
                    <p>Tổng: {(item.quantity * item.productPrice).toLocaleString()} VNĐ</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="cart-summary">
            <p>Tổng số lượng: <strong>{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong></p>
            <p>Tổng tiền: <strong>{cartTotal.toLocaleString()} VNĐ</strong></p>
          </div>
        </div>

        {/* Cột phải: form */}
        <div className="checkout-right">
          <div className="form-group">
            <label>
              Ghi chú:
              <input type="text" name="note" value={form.note} onChange={handleChange} />
            </label>
          </div>
          <div className="form-group">
            <label>
              Địa chỉ giao hàng:
              <input type="text" name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} />
            </label>
          </div>
          <div className="form-group">
            <label>
              Số điện thoại:
              <input type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
            </label>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0 || !userId}
          >
            {loading ? "Đang xử lý..." : "Thanh toán & Tạo đơn"}
          </button>

          {message && <p style={{ marginTop: "10px" }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
