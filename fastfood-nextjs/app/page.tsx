"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Đăng nhập thất bại");
      }

      const user = data.user;

      if (!user) {
        throw new Error("Không nhận được thông tin user từ backend");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
        })
      );

      if (user.role === "ADMIN") {
        router.push("/dashboard-bigadmin");
      } else if (user.role === "STORE_ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/home");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sai email hoặc mật khẩu!";
      console.error("❌ Đăng nhập thất bại:", message);
      alert("Sai email hoặc mật khẩu!");
    }
  };

  return (
    <div className="login-background">
      <form className="login-form" onSubmit={handleLogin}>
        <span className="auth-rendering-badge">CSR</span>
        <h2>Đăng nhập</h2>
        <p className="auth-rendering-note">Browser fetch → Next API route → backend auth endpoint</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Đăng nhập</button>

        <p className="register-link">
          Chưa có tài khoản? <span onClick={() => router.push("/register")}>Đăng ký ngay</span>
        </p>
      </form>
    </div>
  );
}
