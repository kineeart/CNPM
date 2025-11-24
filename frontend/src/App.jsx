// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ==== PAGES ====
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import StoreDetail from "./pages/StoreDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomerOrder from "./pages/CustomerOrder";

// ==== ADMIN PAGES ====
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Store from "./pages/Store";
import MapDrone from "./pages/MapDrone";

// ⭐ Thêm trang quản lý drone
import Drone from "./pages/Drone";   // <--- THÊM DÒNG NÀY

function App() {
  return (
    <Router>
      <Routes>

        {/* ==== AUTH ==== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==== USER ==== */}
        <Route path="/home" element={<Home />} />
        <Route path="/store/:id" element={<StoreDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* ⭐ Đơn hàng của khách */}
        <Route path="/my-orders" element={<CustomerOrder />} />

        {/* ==== ADMIN ==== */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stores" element={<Store />} />

        {/* ⭐ THÊM ROUTE DRONE */}
        <Route path="/drone" element={<Drone />} />   {/* <--- ROUTE MỚI */}
              <Route path="/map" element={<MapDrone />} />


      </Routes>
    </Router>
  );
}

export default App;
