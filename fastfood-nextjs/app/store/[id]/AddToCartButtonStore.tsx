"use client";

import React, { useState } from "react";

interface AddToCartButtonStoreProps {
  productId: number;
}

export default function AddToCartButtonStore({ productId }: AddToCartButtonStoreProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    if (!userId) {
      alert("Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      await fetch("/api/proxy/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId,
          quantity: 1,
        }),
      });

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("Lỗi khi thêm vào giỏ hàng!");
    }
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        style={{
          padding: "8px 12px",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          marginTop: "8px",
          transition: "0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#43a047")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
      >
        Thêm vào giỏ
      </button>

      {/* Popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            padding: "15px 25px",
            backgroundColor: "#4caf50",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 9999,
            animation: "fadeInOut 2s forwards",
          }}
        >
          Thêm sản phẩm vào giỏ hàng thành công!
        </div>
      )}

      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(20px); }
          }
        `}
      </style>
    </>
  );
}
