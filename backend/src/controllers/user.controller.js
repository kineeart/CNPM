import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Address } from "../models/address.model.js"; // nếu có model
import { v4 as uuidv4 } from "uuid";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js"
const JWT_SECRET = "secret_key"; 

// =========================== REGISTER =============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "user",
      status: "active",
    });

    res.status(201).json({ message: "Đăng ký thành công", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =========================== LOGIN =============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

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


// =========================== GET ALL USERS =============================
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [["id", "ASC"]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =========================== GET USER BY ID =============================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🟡 Cập nhật user
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    await User.update(req.body, { where: { id } });

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Xóa user hoặc vô hiệu hóa user
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    // 1️⃣ Kiểm tra xem user có đơn hàng không
    const orders = await Order.findAll({ where: { userId: id } });

    if (orders.length > 0) {
      // Nếu có đơn → không xoá, chỉ vô hiệu hóa
      await User.update(
        { status: "inactive" },
        { where: { id } }
      );

      return res.json({
        message: "User có đơn hàng → đã chuyển sang trạng thái ngưng hoạt động (inactive).",
      });
    }

    // 2️⃣ Xóa giỏ hàng nếu có
    await Cart.destroy({ where: { userId: id } });

    // 3️⃣ Xóa các địa chỉ liên quan
    await Address.destroy({ where: { userId: id } });

    // 4️⃣ Xóa user
    await User.destroy({ where: { id } });

    res.json({ message: "Xóa user thành công." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



