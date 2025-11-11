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
      item.productName = product.name;    // cập nhật tên sản phẩm
      item.productPrice = product.price;  // cập nhật giá sản phẩm
      await item.save();
    } else {
      item = await CartItem.create({
        cartId: cart.id,
        productId,
        productName: product.name,   // lưu tên sản phẩm
        productPrice: product.price, // lưu giá sản phẩm
        quantity,
        totalItemPrice: quantity * product.price,
      });
    }

    // Cập nhật tổng tiền và tổng số lượng giỏ
    const cartItems = await CartItem.findAll({ where: { cartId: cart.id } });
    cart.totalQuantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    cart.totalPrice = cartItems.reduce((sum, i) => sum + i.totalItemPrice, 0);
    await cart.save();

    res.status(200).json({ message: "✅ Thêm vào giỏ thành công", cart, item });
  } catch (error) {
    console.error("❌ Lỗi addToCart:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
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

export const getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "cartitems",
          include: [
            {
              model: Product,
              attributes: ["name", "price"], // chỉ lấy name và price
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    // Map cartitems để tính tổngItemPrice nếu chưa có
    const items = cart.cartitems.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      productName: item.Product?.name || item.productName,
      productPrice: item.Product?.price || item.productPrice,
      quantity: item.quantity,
      totalItemPrice: item.totalItemPrice || item.quantity * (item.Product?.price || 0),
    }));

    res.status(200).json({
      cartId: cart.id,
      totalPrice: cart.totalPrice,
      cartitems: items,
    });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



