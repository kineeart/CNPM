import express from "express";
import { createPayment, confirmPayment } from "../controllers/payment.controller.js";

const router = express.Router();

// POST /api/payments  -> tạo bản ghi thanh toán (CARD, CASH, WALLET, BANK_TRANSFER)
router.post("/", createPayment);

// POST /api/payments/confirm -> xác nhận thanh toán (bank callback hoặc manual)
router.post("/confirm", confirmPayment);

export default router;
