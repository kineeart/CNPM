"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const userId = user?.id;

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/proxy/cart/${userId}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Không thể tải giỏ hàng");
      }
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("❌ Lỗi khi tải giỏ hàng:", error);
      setCart({ cartitems: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }
    fetchCart();
  }, [userId]);

  const increaseQty = async (cartItemId: number) => {
    try {
      await fetch(`/api/proxy/cart/update/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1, action: "increase" }),
      });
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const decreaseQty = async (cartItemId: number) => {
    try {
      await fetch(`/api/proxy/cart/update/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1, action: "decrease" }),
      });
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await fetch(`/api/proxy/cart/remove/${cartItemId}`, { method: "DELETE" });
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const goToCheckout = () => router.push("/checkout");

  if (loading) {
    return <p className="csr-description">Đang tải giỏ hàng...</p>;
  }

  if (!cart || !cart.cartitems || cart.cartitems.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-box">
          <span className="csr-note">CSR</span>
          <h2>Giỏ hàng trống</h2>
          <p className="csr-description">Browser fetch → Next API route → backend giỏ hàng</p>
          <button onClick={() => router.push("/home")} className="back-home-btn">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const cartItems = cart.cartitems;
  const getProduct = (item: any) => item.product || item.Product || {};
  const totalQuantity = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum: number, item: any) => sum + item.quantity * Number(getProduct(item).price || item.productPrice || 0),
    0
  );

  return (
    <div className="cart-container">
      <span className="csr-note">CSR</span>
      <p className="csr-description">Browser fetch → Next API route → backend giỏ hàng</p>

      <div className="cart-items-wrapper">
        <div className="cart-items">
          {cartItems.map((item: any) => {
            const product = getProduct(item);
            const productName = product.name || item.productName || "Sản phẩm";
            const productPrice = Number(product.price || item.productPrice || 0);
            const imageUrl = product.imageUrl || item.imageUrl || "/icons/logostore.png";

            return (
              <div key={item.id} className="cart-item">
                <img src={imageUrl} alt={productName} className="cart-item-image" />
                <div className="cart-item-info">
                  <span className="cart-item-name">{productName}</span>
                  <span className="cart-item-price">{productPrice.toLocaleString()} VNĐ</span>
                  <div className="cart-item-controls">
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                    <span className="cart-item-total">
                      {(item.quantity * productPrice).toLocaleString()} VNĐ
                    </span>
                    <button onClick={() => removeItem(item.id)} className="remove-btn">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cart-summary">
        <h2>Tổng giỏ hàng</h2>
        <div className="summary-container">
          <div className="summary-details">
            <p>
              Tổng số lượng: <strong>{totalQuantity}</strong>
            </p>
            <p>
              Tổng tiền: <strong>{totalPrice.toLocaleString()} VNĐ</strong>
            </p>
          </div>

          <div className="summary-actions">
            <button className="checkout-btn" onClick={goToCheckout}>
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
