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

    // Xử lý các phương thức thanh toán khác nhau
    let paymentStatus = "SUCCESS";
    let orderStatus = order.status; // giữ trạng thái hiện tại nếu payment PENDING
    let transactionId = null;

    if (method === "CASH") {
      // Thanh toán khi nhận hàng: đơn chuyển sang delivering
      paymentStatus = "SUCCESS";
      orderStatus = "delivering";
      transactionId = `COD-${Date.now()}`;
    } else if (method === "BANK_TRANSFER") {
      // Chuyển khoản ngân hàng: khởi tạo payment ở trạng thái PENDING
      paymentStatus = "PENDING";
      orderStatus = order.status || "pending";
      transactionId = `BANK-${Date.now()}`;
    } else {
      // Ví dụ: CARD, WALLET - xử lý giả lập thành công ngay
      paymentStatus = "SUCCESS";
      orderStatus = "success";
      transactionId = `TXN-${Date.now()}`;
    }

    // Tạo bản ghi thanh toán
    const payment = await Payment.create({
      orderId,
      method,
      amount: order.totalPrice,
      status: paymentStatus,
      transactionId,
    });

    // Nếu thanh toán đã SUCCESS thì cập nhật trạng thái đơn
    if (paymentStatus === "SUCCESS") {
      order.status = orderStatus;
      await order.save();
    }

    res.status(201).json({
      message: "💳 Tạo bản ghi thanh toán",
      payment,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("🔥 Lỗi khi thanh toán:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xác nhận thanh toán (ví dụ: callback từ ngân hàng hoặc hành động manual)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;

    if (!paymentId && !transactionId) {
      return res.status(400).json({ message: "Cần cung cấp paymentId hoặc transactionId để xác nhận" });
    }

    const payment = await Payment.findOne({
      where: paymentId ? { id: paymentId } : { transactionId },
    });

    if (!payment) return res.status(404).json({ message: "Không tìm thấy bản ghi thanh toán" });

    // Cập nhật trạng thái thanh toán
    payment.status = "SUCCESS";
    await payment.save();

    // Cập nhật trạng thái đơn tương ứng
    const order = await Order.findByPk(payment.orderId);
    if (order) {
      order.status = "success";
      await order.save();
    }

    res.status(200).json({ message: "Thanh toán được xác nhận", payment, orderStatus: order?.status });
  } catch (error) {
    console.error("🔥 Lỗi xác nhận thanh toán:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
