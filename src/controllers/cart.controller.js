import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Product } from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: "Thiếu thông tin userId, productId hoặc quantity" });
    }

    // 🔎 Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // 🔎 Tìm giỏ hàng đang có của user (mỗi user 1 giỏ)
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId, totalQuantity: 0, totalPrice: 0 });
    }

    // 🔎 Kiểm tra xem sản phẩm đã có trong giỏ chưa
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    if (cartItem) {
      // Nếu có rồi thì tăng số lượng
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Nếu chưa có thì thêm mới
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity
      });
    }

    // 🔢 Cập nhật tổng số lượng & tổng giá
    const allItems = await CartItem.findAll({ where: { cartId: cart.id } });
    const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = allItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(201).json({
      message: "🛒 Đã thêm vào giỏ hàng thành công!",
      cart,
      cartItem
    });
  } catch (error) {
    console.error("🔥 Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
