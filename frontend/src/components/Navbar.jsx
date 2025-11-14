import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Lấy userId từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const goToCart = () => {
    if (!userId) {
      alert("Bạn cần đăng nhập để xem giỏ hàng!");
      return;
    }
    navigate(`/cart`); // Hoặc `/cart/${userId}` nếu backend yêu cầu
  };

  const goToAccount = () => {
    navigate("/account"); // Trang quản lý tài khoản
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/home")}>🚀 MyFoodApp</div>
      <div className="nav-actions">
        <button onClick={goToCart}>🛒 Giỏ hàng</button>
        <button onClick={goToAccount}>👤 Tài khoản</button>
      </div>
    </div>
  );
};

export default Navbar;
