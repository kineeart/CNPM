import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:3000/api/users/login", {
      email,
      password,
    });

    const { token } = res.data;

    // Giải mã token để lấy id, email, role
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;
    const userEmail = payload.email;
    const userRole = payload.role;

    // Lưu token và user vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({
      id: userId,
      email: userEmail,
      role: userRole,
    }));

    console.log("✅ Đăng nhập thành công!");
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);
    console.log("User Role:", userRole);
    console.log("Token:", token);

    // Chuyển đến trang Home
    navigate("/home");
  } catch (err) {
    console.error("❌ Đăng nhập thất bại:", err.response?.data || err.message);
  }
};


  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Đăng nhập</button>
    </form>
  );
};

export default Login;
