import React, { useEffect, useState } from "react";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy userId từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Gọi API lấy cart theo userId
  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải giỏ hàng:", err);
      setCart({ cartitems: [] }); // fallback nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  // Tăng số lượng
  const increaseQty = async (cartItemId) => {
    try {
      await axios.put(`http://localhost:3000/api/cart/update/${cartItemId}`, {
        quantity: 1, // tăng 1
        action: "increase",
      });
      fetchCart();
    } catch (err) {
      console.error("❌ Lỗi khi tăng số lượng:", err);
    }
  };

  // Giảm số lượng
  const decreaseQty = async (cartItemId) => {
    try {
      await axios.put(`http://localhost:3000/api/cart/update/${cartItemId}`, {
        quantity: 1, // giảm 1
        action: "decrease",
      });
      fetchCart();
    } catch (err) {
      console.error("❌ Lỗi khi giảm số lượng:", err);
    }
  };

  // Xóa sản phẩm khỏi giỏ
  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/remove/${cartItemId}`);
      fetchCart();
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm:", err);
    }
  };

  if (loading) return <p>Đang tải giỏ hàng...</p>;
  if (!cart || !cart.cartitems || cart.cartitems.length === 0)
    return <p>Giỏ hàng trống</p>;

  const cartItems = cart.cartitems;

  // Tính tổng
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Giỏ hàng của bạn</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id} style={{ marginBottom: "20px" }}>
            <img
              src={item.product.imageUrl}
              alt={item.product.name}
              width="80"
              style={{ marginRight: "10px", verticalAlign: "middle" }}
            />
            <strong>{item.product.name}</strong> —{" "}
            {item.product.price.toLocaleString()} VNĐ
            <div>
              <button onClick={() => decreaseQty(item.id)}>-</button>
              <span style={{ margin: "0 8px" }}>{item.quantity}</span>
              <button onClick={() => increaseQty(item.id)}>+</button>
              <button
                onClick={() => removeItem(item.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Xóa
              </button>
            </div>
            <p>
              Thành tiền: {(item.quantity * item.product.price).toLocaleString()} VNĐ
            </p>
          </li>
        ))}
      </ul>
      <h3>Tổng số lượng: {totalQuantity}</h3>
      <h3>Tổng tiền: {totalPrice.toLocaleString()} VNĐ</h3>
    </div>
  );
};

export default Cart;
