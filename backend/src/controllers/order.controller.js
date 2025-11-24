import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Product } from "../models/product.model.js";

import axios from "axios";

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

    // ✅ Geocode địa chỉ
    let lat = null, lng = null;
    if (deliveryAddress) {
      const geo = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: deliveryAddress, format: "json", limit: 1 }
      });
      if (geo.data.length > 0) {
        lat = parseFloat(geo.data[0].lat);
        lng = parseFloat(geo.data[0].lon);
      }
    }

    const order = await Order.create({
      userId,
      storeId: 1,
      status: "pending",
      totalPrice: cart.totalPrice,
      note: note || "",
      deliveryAddress: deliveryAddress || "",
      contactPhone: contactPhone || "",
      latitude: lat,
      longitude: lng
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


export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Cập nhật thành công", order });
  } catch (err) {
    console.error("❌ Lỗi update:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

