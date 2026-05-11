"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const phoneRegex = /^(0[1-9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      setError("Số điện thoại không hợp lệ. Phải có 10 số và bắt đầu bằng 0.");
      return;
    }

    try {
      const response = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Đăng ký thất bại");
      }

      console.log("Register Success:", data);
      alert("Đăng ký thành công!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng ký thất bại";
      console.error("Register Error:", message);
      setError(message);
      alert("Đăng ký thất bại: " + message);
    }
  };

  return (
    <div className="register-background">
      <form className="register-form" onSubmit={handleSubmit}>
        <span className="auth-rendering-badge">CSR</span>
        <h2>Đăng ký</h2>
        <p className="auth-rendering-note">Browser fetch → Next API route → backend auth endpoint</p>

        <input type="text" placeholder="Họ và tên" value={name} onChange={(event) => setName(event.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <input type="tel" placeholder="Số điện thoại" value={phone} onChange={(event) => setPhone(event.target.value)} required />

        {error ? <p className="error-message">{error}</p> : null}

        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}
