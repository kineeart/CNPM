import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:3000/api/users/login", { email, password });

    if (!res.data || !res.data.token) {
      console.error("❌ Không nhận được token từ server", res.data);
      return;
    }

    const { token } = res.data;

    // Giải mã token
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userId = payload?.id;
    const userEmail = payload?.email;
    const userRole = payload?.role;

    // Lưu vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ id: userId, email: userEmail, role: userRole }));

    console.log("✅ Đăng nhập thành công!");
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);
    console.log("User Role:", userRole);

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
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Đăng nhập</button>
    </form>
  );
};

export default Login;
