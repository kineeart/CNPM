import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";

export const createPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({ message: "Thiếu thông tin orderId hoặc method" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // 🔹 Giả lập thanh toán (online hoặc COD)
    let paymentStatus = "SUCCESS";
    let orderStatus = "success";
    let transactionId = null;

    if (method === "CASH") {
      orderStatus = "delivering";
      transactionId = `COD-${Date.now()}`;
    } else {
      transactionId = `TXN-${Date.now()}`;
    }

    // 🔹 Tạo bản ghi thanh toán
    const payment = await Payment.create({
      orderId,
      method,
      amount: order.totalPrice,
      status: paymentStatus,
      transactionId
    });

    // 🔹 Cập nhật trạng thái đơn
    order.status = orderStatus;
    await order.save();

    res.status(201).json({
      message: "💳 Thanh toán thành công!",
      payment,
      orderStatus: order.status
    });
  } catch (error) {
    console.error("🔥 Lỗi khi thanh toán:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
