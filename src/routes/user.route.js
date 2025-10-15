import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = express.Router();

// Đăng ký
router.post("/register", registerUser);

// Đăng nhập
router.post("/login", loginUser);

export default router;
