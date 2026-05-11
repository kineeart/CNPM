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
import zalopayRoutes from "./src/routes/zalopay.route.js";
import addressRoutes from "./src/routes/address.routes.js";
import geocodeRouter from "./src/routes/geocode.js";

import droneDeliveryRoutes from "./src/routes/droneDeliveryRoutes.js";  // ✅ chỉ import 1 lần

import "./src/models/associations.js";
import { startDeliveryCron } from "./src/cron/deliveryCron.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// CORS
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// ROUTES
// ================================
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/zalopay", zalopayRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/geocode", geocodeRouter);
app.use("/api/drone-delivery", droneDeliveryRoutes);

// 🚀 DÙNG ĐÚNG 1 LẦN
app.use("/api", droneDeliveryRoutes);

// =================================
app.get("/ping", (req, res) => res.json({ message: "🏓 Server sống!" }));
app.get("/", (req, res) => res.send("🚀 Backend FastFood Drone Delivery đang chạy!"));

// Database connection and server startup
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server chạy tại http://0.0.0.0:${PORT}`);
      console.log(`📡 Backend URL: http://localhost:${PORT}`);
    });
    
    startDeliveryCron();
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
})();
