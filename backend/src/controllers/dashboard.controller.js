import {User} from "../models/user.model.js";
import {Product} from "../models/product.model.js";
import {Store} from "../models/store.model.js";
import { Order } from "../models/order.model.js";

export const getStats = async (req, res) => {
  try {
    const orders = await Order.count();
    const users = await User.count();
    const products = await Product.count();
    const store = await Store.count();

    res.json({ orders, users, products, store });
  } catch (err) {
    console.error("Lỗi dashboard:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

