import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const goToCart = () => {
    if (!userId) {
      alert("Bạn cần đăng nhập để xem giỏ hàng!");
      navigate("/"); // chưa login → về trang Login
      return;
    }
    navigate("/cart");
  };

  const toggleAccountMenu = () => {
    if (!userId) {
      navigate("/"); // chưa login → về trang Login
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const goToOrders = () => {
    setIsDropdownOpen(false);
    navigate("/my-orders");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/"); // logout → về trang Login
    window.location.reload();
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/home")}>
        {/* Thay chữ MyFoodApp bằng logo */}
        <img 
          src="/icons/logostore.png" 
          alt="Logo" 
          style={{  cursor: "pointer" }} 
        />
      </div>

      <div className="nav-actions">
        <button onClick={goToCart}>🛒 Giỏ hàng</button>

        <div className="account-container">
          <button className="account-btn" onClick={toggleAccountMenu}>
            👤 {userId ? user.name : "Tài khoản"}
          </button>

          {isDropdownOpen && userId && (
            <div className="dropdown-menu">
              <button onClick={goToOrders}>📦 Đơn hàng</button>
              <button onClick={handleLogout}>🚪 Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
