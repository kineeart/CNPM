import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home"; // 👈 THÊM DÒNG NÀY
import StoreDetail from "./pages/StoreDetail"; // 👈 thêm dòng này
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} /> {/* 👈 Trang sau đăng nhập */}
                <Route path="/store/:id" element={<StoreDetail />} /> {/* ✅ */}
<Route path="/product/:id" element={<ProductDetail />} />
<Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

      </Routes>
    </Router>
  );
}

export default App;
