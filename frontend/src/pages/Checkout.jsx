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

  // Lấy userId từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Lấy giỏ hàng từ backend
  const fetchCart = async () => {
    if (!userId) return; // user chưa đăng nhập
    try {
      const res = await axios.get(`http://localhost:3000/api/cart/user/${userId}`);
      // Chú ý: backend trả về cartitems theo model
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

  // Thanh toán / tạo đơn hàng
  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:3000/api/orders", {
        userId, // gửi userId từ localStorage
        note: form.note,
        deliveryAddress: form.deliveryAddress,
        contactPhone: form.contactPhone,
        cartId: cartItems[0].cartId, // lấy cartId từ item đầu tiên
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
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>🛒 Checkout</h2>

      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <table style={{ width: "100%", marginBottom: "20px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Tổng</th>
            </tr>
          </thead>
         <tbody>
  {cartItems.map((item) => (
    <tr key={item.id}>
      <td>{item.productName}</td>
      <td>{item.productPrice}</td>
      <td>{item.quantity}</td>
      <td>{item.totalItemPrice}</td> 
    </tr>
  ))}
</tbody>

        </table>
      )}

      <h3>Tổng tiền: {cartTotal}</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Ghi chú:
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Địa chỉ giao hàng:
          <input
            type="text"
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Số điện thoại:
          <input
            type="text"
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || cartItems.length === 0 || !userId}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        {loading ? "Đang xử lý..." : "Thanh toán & Tạo đơn"}
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default Checkout;
