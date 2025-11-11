import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Product } from "../models/product.model.js";

// 🛒 Lấy giỏ hàng theo userId
export const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, as: "items", include: [{ model: Product }] }],
    });

    res.json(cart || { message: "Giỏ hàng trống" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

// ➕ Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) cart = await Cart.create({ userId });

    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    res.json({ message: "✅ Thêm vào giỏ hàng thành công", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm vào giỏ hàng" });
  }
};

// ⚙️ Giữ nguyên các hàm update và remove
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });
    item.quantity = quantity;
    await item.save();
    res.json({ message: "Cập nhật thành công", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi cập nhật giỏ hàng" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });
    await item.destroy();
    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
};
