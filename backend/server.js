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
import statisticsRoutes from "./src/routes/statistics.routes.js";
import storeRoutes from "./src/routes/store.route.js";
import dashboardRouter from "./src/routes/dashboard.route.js";
import droneRoutes from "./src/routes/droneDeliveryRoutes.js";
import zalopayRoutes from "./src/routes/zalopay.route.js";

import "./src/models/associations.js";

// ✅ Tạo app trước khi dùng
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Dùng middleware sau khi khởi tạo
app.use(cors());
app.use(express.json());

// ✅ Đăng ký routes
  
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", droneRoutes);
app.use("/api/zalopay", zalopayRoutes);

// ✅ Test server
app.get("/ping", (req, res) => {
  res.json({ message: "🏓 Server vẫn sống!", time: new Date().toISOString() });
});

// ✅ Chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
