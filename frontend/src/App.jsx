import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ==== USER AUTH ====
import Login from "./pages/Login";
import Register from "./pages/Register";

// ==== USER PAGES ====
import Home from "./pages/Home";
import StoreDetail from "./pages/StoreDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomerOrder from "./pages/CustomerOrder";

// ==== STORE ADMIN ====
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Store from "./pages/Store";
import Drone from "./pages/Drone";

// ==== BIG ADMIN ====
import DashboardBigAdmin from "./pages/DashboardBigAdmin";
import OrderBigAdmin from "./pages/OrderBigAdmin";
import ZalopayTest from "./pages/Zalopaytest";

// Backend URL
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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
        <Route path="/my-orders" element={<CustomerOrder />} />

        {/* ==== STORE ADMIN ==== */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stores" element={<Store />} />
        <Route path="/drone" element={<Drone />} />
        <Route path="/zalopay-test" element={<ZalopayTest />} />

        {/* ==== BIG ADMIN ==== */}
        <Route path="/dashboard-bigadmin" element={<DashboardBigAdmin />} />
        <Route path="/orders-bigadmin" element={<OrderBigAdmin />} />

      </Routes>
    </Router>
  );
}

export default App;
