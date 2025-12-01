import React, { useState } from "react";
import axios from "axios";
import "../css/Register.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/users/register`, {
        name,
        email,
        password,
        phone,
        address,
        ward,
        district,
        province,
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

        <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="text" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="text" placeholder="Địa chỉ (số nhà, đường...)" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <input type="text" placeholder="Phường/Xã" value={ward} onChange={(e) => setWard(e.target.value)} required />
        <input type="text" placeholder="Quận/Huyện" value={district} onChange={(e) => setDistrict(e.target.value)} required />
        <input type="text" placeholder="Tỉnh/Thành phố" value={province} onChange={(e) => setProvince(e.target.value)} required />

        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}
