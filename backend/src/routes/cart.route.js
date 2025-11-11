import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cart.controller.js";

const router = express.Router();

// ❌ Không dùng verifyToken
router.get("/:userId", getCart);        // Lấy giỏ hàng
router.post("/add", addToCart);         // Thêm sản phẩm
router.put("/update/:id", updateCartItem); // Cập nhật số lượng
router.delete("/remove/:id", removeCartItem); // Xóa sản phẩm

export default router;
