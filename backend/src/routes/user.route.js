import express from "express";
const router = express.Router();

import {
  loginUser,
  getUsers,
  registerUser,      // dùng registerUser cho frontend tạo user
  updateUser,
  adminCreateUser,deleteUser,    // dùng adminCreateUser cho admin tạo user
} from "../controllers/user.controller.js";

// Lấy danh sách user
router.get("/", getUsers);
router.post("/login", loginUser);

// Tạo user từ frontend
router.post("/", registerUser);

// Tạo user từ admin
router.post("/admin", adminCreateUser);

// Cập nhật user
router.put("/:id", updateUser);

router.delete("/:id", deleteUser);


export default router;
