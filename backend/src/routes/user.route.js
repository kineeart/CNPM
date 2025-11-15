import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Đăng ký
router.post("/register", registerUser);

// Đăng nhập
router.post("/login", loginUser);

// Lấy danh sách user
router.get("/", getUsers);

// Cập nhật user
router.put("/:id", updateUser);

// Xóa user
router.delete("/:id", deleteUser);

router.post("/", registerUser);   // 👈 Thêm dòng này

export default router;
