import express from "express";
import { createOrder, getOrdersByUser } from "../controllers/order.controller.js";

const router = express.Router();

// 🧾 Tạo đơn hàng
// POST /api/orders
router.post("/", createOrder);

// 📜 Xem danh sách đơn hàng theo user
// GET /api/orders/user/:id
router.get("/user/:id", getOrdersByUser);

export default router;
