import React from "react";
import "../css/Footer.css"; // 👈 Nhập CSS cho Footer

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content-container">
        <div className="footer-section about">
          <h3>Về chúng tôi</h3>
          <p>Nền tảng thương mại điện tử kết nối các cửa hàng và khách hàng địa phương.</p>
        </div>

        <div className="footer-section links">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Sản phẩm</a></li>
            <li><a href="#">Cửa hàng</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Liên hệ</h3>
          <p><i className="fas fa-map-marker-alt"></i> 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p><i className="fas fa-phone"></i> +84 901 234 567</p>
          <p><i className="fas fa-envelope"></i> support@example.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Tên Ứng Dụng | Bảo lưu mọi quyền
      </div>
    </footer>
  );
};

export default Footer;