import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; // dùng named export
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = "secret_key"; // Nên lưu .env

// Đăng ký
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra trùng email
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({ message: "Đăng ký thành công", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Đăng nhập
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
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
