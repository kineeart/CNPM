import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cart.controller.js";

const router = express.Router();

// ❌ Bỏ verifyToken, chỉ gọi controller trực tiếp
router.get("/:userId", getCart);
router.post("/add", addToCart);
router.put("/update/:id", updateCartItem);
router.delete("/remove/:id", removeCartItem);

export default router;
