import express from "express";
import cors from "cors";
import { sequelize } from "./src/config/database.js";
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import menuRoutes from "./src/routes/menu.route.js";
import productRoutes from "./src/routes/product.route.js";

import "./src/models/associations.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api", menuRoutes); // 👈 thêm dòng này
app.use("/api", productRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

console.log("✅ Models synchronized!");

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
