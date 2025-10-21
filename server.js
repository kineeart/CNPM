import express from "express";
import cors from "cors";
import { sequelize } from "./src/config/database.js";
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import menuRoutes from "./src/routes/menu.route.js";
import productRoutes from "./src/routes/product.route.js";
import cartRoutes from "./src/routes/cart.route.js";
import orderRoutes from "./src/routes/order.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";

import "./src/models/associations.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api", menuRoutes); // 👈 thêm dòng này
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "🏓 Server vẫn sống!", time: new Date().toISOString() });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
