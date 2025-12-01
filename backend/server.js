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
import addressRoutes from "./src/routes/address.routes.js";
import geocodeRouter from "./src/routes/geocode.js";
import droneDeliveryRoutes from "./src/routes/droneDeliveryRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS: cho phép tất cả frontend (hoặc IP cụ thể)
const allowedOrigins = [
  "http://localhost:5173",      // máy gốc
  "http://10.112.28.37:5173"   // máy 2 (LAN)
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = '❌ The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
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
app.use("/api/address", addressRoutes);
app.use("/api/geocode", geocodeRouter);
app.use("/api/drones", droneDeliveryRoutes);

// ✅ Test server
app.get("/ping", (req, res) => {
  res.json({ message: "🏓 Server vẫn sống!", time: new Date().toISOString() });
});

// ✅ Chạy server, bind tất cả IP để máy khác truy cập
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("🚀 Backend FastFood Drone Delivery đang chạy!");
});
