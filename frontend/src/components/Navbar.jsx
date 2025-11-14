import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div class="navbar">
  <div class="logo">🚀 MyFoodApp</div>
  <div class="nav-actions">
    <button>🛒 Giỏ hàng</button>
    <button>👤 Tài khoản</button>
  </div>
</div>

  );
};

export default Navbar;
