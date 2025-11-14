import React, { useState } from "react";
import axios from "axios";
import "../css/Register.css"; // nhớ import CSS

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/users/register", {
        name,
        email,
        password,
        phone,
      });
      console.log("Register Success:", res.data);
      alert("Đăng ký thành công!");
    } catch (err) {
      console.error("Register Error:", err);
      alert("Đăng ký thất bại: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="register-background">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>

        <input
          type="text"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <input
          type="text"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}
