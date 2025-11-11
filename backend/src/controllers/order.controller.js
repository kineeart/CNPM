import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Product } from "../models/product.model.js";

export const createOrder = async (req, res) => {
  try {
    const { userId, cartId, note, deliveryAddress, contactPhone } = req.body;

    if (!cartId || !userId) {
      return res.status(400).json({ message: "Thiếu thông tin cartId hoặc userId" });
    }

    const cart = await Cart.findOne({ where: { id: cartId, userId } });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const items = await CartItem.findAll({ where: { cartId } });
    if (!items.length) return res.status(400).json({ message: "Giỏ hàng trống" });

    const order = await Order.create({
      userId,            // ✅ dùng userId từ frontend
      storeId: 1,
      status: "pending",
      totalPrice: cart.totalPrice,
      note: note || "",
      deliveryAddress: deliveryAddress || "",
      contactPhone: contactPhone || "",
    });

    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
      });
    }

    // Xoá giỏ hàng sau khi tạo order
    await CartItem.destroy({ where: { cartId } });
    await cart.destroy();

    res.status(201).json({ orderId: order.id, total: order.totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// 📜 Lấy danh sách đơn hàng của user
export const getOrdersByUser = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await Order.findAll({
      where: { userId: id },
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: ["productName", "productPrice", "quantity"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!orders.length) {
      return res.status(404).json({ message: "Không có đơn hàng nào" });
    }

    res.status(200).json({
      message: "📦 Danh sách đơn hàng của người dùng",
      orders,
    });
  } catch (error) {
    console.error("❌ Lỗi getOrdersByUser:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
