import React from "react";

const ZalopayTest = () => {
  // Dữ liệu tĩnh giả lập
  const order = {
    orderId: "35",
    items: [
      { productName: "Burger", quantity: 2, productPrice: 50000 },
      { productName: "Fries", quantity: 1, productPrice: 20000 }
    ],
    totalPrice: 120000
  };

  const cardStyle = {
    flex: 1,
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    margin: "5px"
  };

  const inputStyle = {
    flex: 1,
    marginRight: "5px",
    padding: "5px",
    backgroundColor: "#fff",
    color: "#999",
    border: "1px solid #ccc",
    borderRadius: "4px"
  };

  const buttonStyle = {
    padding: "5px 10px",
    backgroundColor: "#fff",
    color: "#999",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer"
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "40px",
        backgroundColor: "#ffffffff",
        minHeight: "100vh"
      }}
    >
      {/* Logo trên đầu, căn trái */}
      <img
        src="/icons/logo.png"
        alt="Logo"
        style={{ width: "140px", marginBottom: "30px" }}
      />

      <div style={{ display: "flex", justifyContent: "flex-start", width: "100%", maxWidth: "900px" }}>
        {/* LEFT - thông tin đơn hàng */}
        <div style={cardStyle}>
          <h2>Thông tin đơn hàng</h2>
          <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <p><strong>Tên sản phẩm:</strong> {order.items.map(i => i.productName).join(", ")}</p>
            <p><strong>Giá trị đơn hàng:</strong> <strong>{order.totalPrice.toLocaleString()} VNĐ</strong></p>
            <p><strong>Số tiền thanh toán:</strong> <strong>{order.totalPrice.toLocaleString()} VNĐ</strong></p>
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

        {/* RIGHT - QR Code */}
        <div style={{ 
          ...cardStyle, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "flex-start"
        }}>
          <h2 style={{ marginBottom: "20px" }}>Quét QR để thanh toán</h2>
          <img
            src="/icons/qr.jpg"
            alt="QR Code"
            style={{
              width: "250px",
              height: "auto",
              objectFit: "contain"
            }}
          />
          <p>Mở ứng dụng có VietQR để thanh toán đơn hàng</p>
        </div>
      </div>
    </div>
  );
};

export default ZalopayTest;
