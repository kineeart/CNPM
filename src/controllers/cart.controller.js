import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Product } from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const {
      userId,
      storeId,
      productId,
      quantity,
      note,
      deliveryAddress,
      contactPhone
    } = req.body;

    if (!userId || !storeId || !productId || !quantity) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // 🔹 Kiểm tra sản phẩm
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // 🔹 Tìm Order pending của user + store
    let order = await Order.findOne({ where: { userId, storeId, status: "pending" } });

    // 🔹 Nếu chưa có Order, tạo mới
    if (!order) {
      order = await Order.create({
        userId,
        storeId,
        status: "pending",
        totalPrice: 0,
        note: note || "",
        deliveryAddress: deliveryAddress || "",
        contactPhone: contactPhone || ""
      });
    }

    // 🔹 Kiểm tra OrderItem đã có chưa
    let item = await OrderItem.findOne({ where: { orderId: order.id, productId } });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      await OrderItem.create({
        orderId: order.id,
        productId,
        productName: product.name,
        productPrice: product.price,
        quantity
      });
    }

    // 🔹 Cập nhật tổng tiền
    const items = await OrderItem.findAll({ where: { orderId: order.id } });
    const totalPrice = items.reduce((sum, i) => sum + i.productPrice * i.quantity, 0);
    order.totalPrice = totalPrice;
    await order.save();

    res.status(201).json({ message: "🛒 Đã thêm vào giỏ hàng", order, totalPrice });
  } catch (error) {
    console.error("🔥 Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
