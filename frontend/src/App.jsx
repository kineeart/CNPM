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

// ==== ADMIN PAGES ====
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Products from "./pages/Products";

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

        {/* ==== ADMIN ==== */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </Router>
  );
}

export default App;
