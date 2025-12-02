import React, { useState } from "react";
import axios from "axios";
import "../css/Register.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(""); // State để hiển thị lỗi

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ

    // Kiểm tra SĐT ở frontend
    const phoneRegex = /^(0[1-9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      setError("Số điện thoại không hợp lệ. Phải có 10 số và bắt đầu bằng 0.");
      return;
    }

    try {
      // ✅ Sửa lại URL cho đúng với backend
      const res = await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        password,
        phone,
      });

      console.log("Register Success:", res.data);
      alert("Đăng ký thành công!");
      // Chuyển hướng về trang đăng nhập (tùy chọn)
      // window.location.href = '/login';
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error("Register Error:", errorMessage);
      setError(errorMessage); // Hiển thị lỗi từ server
      alert("Đăng ký thất bại: " + errorMessage);
    }
  };

  return (
    <div className="register-background">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>

        <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />

        {/* Hiển thị lỗi nếu có */}
        {error && <p className="error-message">{error}</p>}

        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}
