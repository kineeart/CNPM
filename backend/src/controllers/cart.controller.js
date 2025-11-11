import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cartItem.model.js";
import { Product } from "../models/product.model.js";

// 🛒 Lấy giỏ hàng theo userId
export const getCart = async (req, res) => {
  try {
    
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

  let cart = await Cart.findOne({
  where: { userId },
  include: [
    {
      model: CartItem,
      as: "cartitems", // 🔑 đúng alias
      include: [{ model: Product }],
    },
  ],
});


    // Nếu chưa có cart, trả về rỗng
    if (!cart) cart = { id: null, userId, items: [] };

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity)
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) cart = await Cart.create({ userId, totalQuantity: 0, totalPrice: 0 });

    // Lấy giá sản phẩm từ Product
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (item) {
      item.quantity += quantity;
      item.totalItemPrice = item.quantity * product.price;
      await item.save();
    } else {
      item = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        totalItemPrice: quantity * product.price,
      });
    }

    // Cập nhật tổng giỏ hàng
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    cart.totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cartItems.reduce((sum, i) => sum + i.totalItemPrice, 0);
    await cart.save();

    res.json({ message: "✅ Thêm vào giỏ hàng thành công", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm vào giỏ hàng" });
  }
};



export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cartItem id
    const { quantity, action } = req.body;

    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });

    // Lấy giá sản phẩm từ bảng Product
    const product = await Product.findByPk(item.productId);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    // Tăng/giảm số lượng
    if (action === "increase") item.quantity += quantity;
    else if (action === "decrease") item.quantity = Math.max(item.quantity - quantity, 1);
    else item.quantity = quantity;

    // Cập nhật totalItemPrice dựa trên giá Product
    item.totalItemPrice = item.quantity * product.price;

    await item.save();

    // Cập nhật tổng giỏ hàng
    const cart = await Cart.findByPk(item.cartId, { include: { model: CartItem, as: "cartitems" } });
    cart.totalQuantity = cart.cartitems.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cart.cartitems.reduce((sum, i) => sum + i.totalItemPrice, 0);
    await cart.save();

    res.json({ message: "Cập nhật thành công", item, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi cập nhật giỏ hàng" });
  }
};



// ⚙️ Xóa sản phẩm khỏi giỏ
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });

    await item.destroy();
    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
};
