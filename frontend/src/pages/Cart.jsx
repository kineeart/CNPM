import React, { useEffect, useState } from "react";

const CartPage = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Cập nhật localStorage
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // Tăng số lượng
  const increaseQty = (id) => {
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    updateCart(newCart);
  };

  // Giảm số lượng
  const decreaseQty = (id) => {
    const newCart = cart
      .map(item =>
        item.id === id ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) } : item
      );
    updateCart(newCart);
  };

  // Xóa sản phẩm
  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    updateCart(newCart);
  };

  // Tổng tiền và tổng số lượng
  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Giỏ hàng của bạn</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống 😢</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item.id} style={{ marginBottom: "15px" }}>
                <img src={item.imageUrl} alt={item.name} width="80" style={{ marginRight: "10px" }} />
                <strong>{item.name}</strong> — {item.price} VNĐ
                <div>
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span style={{ margin: "0 8px" }}>{item.quantity || 1}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                  <button onClick={() => removeItem(item.id)} style={{ marginLeft: "10px" }}>Xóa</button>
                </div>
                <p>Thành tiền: {(item.price * (item.quantity || 1)).toLocaleString()} VNĐ</p>
              </li>
            ))}
          </ul>
          <h3>Tổng số lượng: {totalQuantity}</h3>
          <h3>Tổng tiền: {totalPrice.toLocaleString()} VNĐ</h3>
        </>
      )}
    </div>
  );
};

export default CartPage;
