import axios from "axios";
import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Store } from "../models/store.model.js";
import { sequelize } from "../config/database.js"; // Import sequelize để dùng transaction

export const createOrder = async (req, res) => {
  // ✅ Bọc toàn bộ logic trong một transaction
  const t = await sequelize.transaction();

  try {
    const { userId, note, deliveryAddress, contactPhone, latitude, longitude } = req.body;

    const cart = await Cart.findOne({ where: { userId }, include: "cartitems" });
    if (!cart || cart.cartitems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // ✅ Kiểm tra và trừ kho
    for (const item of cart.cartitems) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Sản phẩm ID ${item.productId} không tồn tại.` });
      }
      if (product.inventory < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Sản phẩm "${product.name}" không đủ hàng.` });
      }
      // Trừ kho
      product.inventory -= item.quantity;
      await product.save({ transaction: t });
    }

    // 2) Lấy items + Product
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, as: "product", attributes: ["id", "storeId", "price", "name"] }],
    });

    if (items.length === 0) return res.status(400).json({ message: "Giỏ hàng trống" });

    const storeIds = [...new Set(items.map(i => Number(i.product?.storeId)))];
    if (storeIds.includes(NaN)) return res.status(400).json({ message: "Thiếu product.storeId trong giỏ" });
    if (storeIds.length !== 1) {
      return res.status(400).json({ message: "Giỏ hàng chứa sản phẩm từ nhiều cửa hàng" });
    }
    const storeId = storeIds[0];

    const totalPrice = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.product?.price || 0), 0);

    // 5) Tạo order
    const order = await Order.create({
      userId,
      storeId,
      totalPrice,
      note,
      deliveryAddress,
      contactPhone,
      latitude,
      longitude,
      status: "pending",
    }, { transaction: t });

    // 6) Tạo order items
    await Promise.all(items.map(i =>
      OrderItem.create({
        orderId: order.id,
        productId: i.productId,
        quantity: i.quantity,
        price: i.product.price,
      }, { transaction: t })
    ));

    // 7) (Tuỳ chọn) Xoá giỏ sau khi tạo đơn
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    // ✅ Commit transaction nếu mọi thứ thành công
    await t.commit();

    console.log("✅ Created order", { orderId: order.id, storeId, totalPrice, items: items.length });
    return res.status(201).json({ orderId: order.id });

  } catch (error) {
    // ✅ Rollback transaction nếu có lỗi
    await t.rollback();
    console.error("❌ Lỗi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
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
        {
          model: Store,
          attributes: ["name", "address", "ward", "district", "province", "latitude", "longitude"]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "📦 Danh sách đơn hàng của người dùng",
      orders,
    });
  } catch (err) {
    console.error("❌ Lỗi getOrdersByUser:", err);
    res.status(500).json({ message: "Lỗi server" });
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

export const getOrderDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: ["productName", "productPrice", "quantity"],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Lấy info store
    const store = await Store.findByPk(order.storeId);
    
    res.json({
      order,
      store,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};