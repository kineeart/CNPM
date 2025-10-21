import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";

export const createOrder = async (req, res) => {
  try {
    const { cartId, note, deliveryAddress, contactPhone } = req.body;

    if (!cartId) {
      return res.status(400).json({ message: "Thiếu thông tin cartId" });
    }

    // 🔎 Tìm giỏ hàng
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    // 🔎 Lấy tất cả item trong giỏ
    const items = await CartItem.findAll({ where: { cartId } });
    if (items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống, không thể tạo đơn" });
    }

    // 🧾 Tạo đơn hàng mới
    const order = await Order.create({
      userId: cart.userId,
      storeId: 1, // ví dụ tạm, có thể truyền động từ client
      status: "pending",
      totalPrice: cart.totalPrice,
      note: note || "Tạo tự động từ giỏ hàng",
      deliveryAddress: deliveryAddress || "Chưa cập nhật",
      contactPhone: contactPhone || "Chưa cập nhật",
    });

    // 🛒 Thêm từng món từ giỏ vào OrderItem
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
      });
    }

    // 🧹 (Tuỳ chọn) Xoá giỏ hàng sau khi đặt
    await CartItem.destroy({ where: { cartId } });
    await cart.destroy();

    res.status(201).json({
      message: "🧾 Đơn hàng đã được tạo thành công!",
      orderId: order.id,
      total: order.totalPrice,
    });
  } catch (error) {
    console.error("🔥 Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
