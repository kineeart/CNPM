"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
  const userId = user?.id;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const goToCart = () => {
    if (!userId) {
      alert("Bạn cần đăng nhập để xem giỏ hàng!");
      router.push("/");
      return;
    }
    router.push("/cart");
  };

  const toggleAccountMenu = () => {
    if (!userId) {
      router.push("/");
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const goToOrders = () => {
    setIsDropdownOpen(false);
    router.push("/my-orders");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("user");
    setIsDropdownOpen(false);
    router.push("/");
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="navbar">
     <div
  className="logo-text"
  onClick={() => router.push("/home")}
>
  Master Chef
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
