import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";

export const createOrder = async (req, res) => {
  try {
    const { cartId } = req.body;
    if (!cartId) return res.status(400).json({ message: "Thiếu cartId" });

    // 🔍 Lấy giỏ hàng
    const cart = await Cart.findByPk(cartId, { include: [CartItem] });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    if (cart.CartItems.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });

    // 🧾 Tạo đơn hàng
    const order = await Order.create({
      userId: cart.userId,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
      status: "pending"
    });

    // 🧩 Tạo các item cho đơn hàng
    const orderItems = await Promise.all(
      cart.CartItems.map(item =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity
        })
      )
    );

    // 🧹 Xóa giỏ hàng sau khi đặt
    await CartItem.destroy({ where: { cartId } });
    cart.totalQuantity = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      message: "✅ Đã tạo đơn hàng thành công!",
      order,
      orderItems
    });
  } catch (error) {
    console.error("🔥 Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
