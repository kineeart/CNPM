import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ✅ POST /api/cart/add
// cart.route.js
router.post("/add", authenticate, addToCart);
router.get("/:userId", authenticate, getCart);
router.put("/:id", authenticate, updateCartItem);
router.delete("/:id", authenticate, removeCartItem);

export default router;
