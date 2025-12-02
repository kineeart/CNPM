import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${BACKEND_URL}/users/login`, {
      email,
      password,
    });

    const user = res.data.user;

    if (!user) {
      throw new Error("Không nhận được thông tin user từ backend");
    }

    // Lưu user vào localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
      })
    );

    // Điều hướng theo quyền
    if (user.role === "ADMIN") {
      navigate("/dashboard-bigadmin");
    } else if (user.role === "STORE_ADMIN") {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
  } catch (err) {
    console.error("❌ Đăng nhập thất bại:", err.response?.data || err.message);
    alert("Sai email hoặc mật khẩu!");
  }
};
  

  return (
    <div className="login-background">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Đăng nhập</button>

        <p className="register-link">
          Chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>Đăng ký ngay</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
