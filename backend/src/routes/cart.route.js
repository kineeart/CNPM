import express from "express";
// ❌ Xóa getCartByUser vì nó không tồn tại
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  getCartByUserId
} from "../controllers/cart.controller.js";

const router = express.Router();

// Các route giỏ hàng
router.get("/:userId", getCart);               // Lấy giỏ hàng theo ID cart
router.post("/add", addToCart);                // Thêm sản phẩm
router.put("/update/:id", updateCartItem);     // Cập nhật số lượng
router.delete("/remove/:id", removeCartItem);  // Xóa sản phẩm
router.get("/user/:userId", getCartByUserId);  // ✅ Lấy giỏ hàng theo userId

export default router;
