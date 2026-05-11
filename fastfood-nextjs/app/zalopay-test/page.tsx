"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function ZalopayTestContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "35";
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/proxy/orders/${orderId}/detail`, { cache: "no-store" });
        const data = await response.json();
        if (response.ok) {
          setOrder(data.order || null);
        }
      } catch (error) {
        console.error("Lỗi tải thông tin đơn hàng:", error);
      }
    };

    fetchOrder();
  }, [orderId]);

  const demoOrder = {
    orderId: String(orderId),
    items: [
      { productName: "Burger", quantity: 2, productPrice: 50000 },
      { productName: "Fries", quantity: 1, productPrice: 20000 },
    ],
    totalPrice: 120000,
  };

  const orderItems = order?.items?.length
    ? order.items.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        productPrice: item.productPrice,
      }))
    : demoOrder.items;

  const totalPrice = order?.totalPrice || demoOrder.totalPrice;

  const cardStyle = {
    flex: 1,
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    margin: "5px",
  };

  const inputStyle = {
    flex: 1,
    marginRight: "5px",
    padding: "5px",
    backgroundColor: "#fff",
    color: "#999",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const buttonStyle = {
    padding: "5px 10px",
    backgroundColor: "#fff",
    color: "#999",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "40px",
        backgroundColor: "#ffffffff",
        minHeight: "100vh",
      }}
    >
      <span className="csr-note">CSR</span>
      <p className="csr-description">Browser fetch → Next API route → backend payment handoff data</p>

      <img src="/icons/logo.png" alt="Logo" style={{ width: "140px", marginBottom: "30px" }} />

      <div style={{ display: "flex", justifyContent: "flex-start", width: "100%", maxWidth: "900px" }}>
        <div style={cardStyle}>
          <h2>Thông tin đơn hàng</h2>
          <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <p><strong>Tên sản phẩm:</strong> {orderItems.map((item: any) => item.productName).join(", ")}</p>
            <p><strong>Giá trị đơn hàng:</strong> <strong>{totalPrice.toLocaleString()} VNĐ</strong></p>
            <p><strong>Số tiền thanh toán:</strong> <strong>{totalPrice.toLocaleString()} VNĐ</strong></p>
            <p><strong>Mã giao dịch:</strong> <strong>24129_17956324525</strong></p>
            <p><strong>Nội dung:</strong> ZaloPay demo</p>
            <p><strong>Mã khuyến mãi</strong></p>
            <div style={{ display: "flex", marginTop: "5px" }}>
              <input type="text" placeholder="Nhập mã khuyến mãi" style={inputStyle} />
              <button style={buttonStyle}>Áp dụng</button>
            </div>
            <p><small>Áp dụng khi quét QR bằng ứng dụng ngân hàng</small></p>
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Quét QR để thanh toán</h2>
          <img
            src="/icons/qr.jpg"
            alt="QR Code"
            style={{
              width: "250px",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <p>Mở ứng dụng có VietQR để thanh toán đơn hàng</p>
        </div>
      </div>
    </div>
  );
}

export default function ZalopayTestPage() {
  return (
    <Suspense fallback={<div className="csr-description">Đang tải thanh toán...</div>}>
      <ZalopayTestContent />
    </Suspense>
  );
}
