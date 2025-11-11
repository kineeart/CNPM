import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = "secret_key"; // ⚠️ Nên để trong .env nếu dùng thật

// 🟢 Đăng ký (không hash)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra email trùng
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email đã tồn tại" });

    // ❌ Không thêm id, DB tự tăng
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({ message: "Đăng ký thành công", user });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🟢 Đăng nhập (so sánh chuỗi bình thường)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

    // ✅ So sánh trực tiếp
    if (password !== user.password)
      return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Đăng nhập thành công", token });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
