import { Order } from "../models/order.model.js";
import { Store } from "../models/store.model.js";
import { Op, fn, col, literal } from "sequelize";

// 📊 GET /api/statistics/restaurant/:id?period=month|day
export const getRestaurantStatistics = async (req, res) => {
  try {
    const { id } = req.params; // id của store
    const { period = "month" } = req.query; // có thể truyền ?period=day

    // kiểm tra store tồn tại
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({ message: "❌ Không tìm thấy nhà hàng" });
    }

    // group theo ngày hoặc tháng
    const groupFormat =
      period === "day"
        ? fn("DATE", col("createdAt"))
        : fn("DATE_FORMAT", col("createdAt"), "%Y-%m");

    const stats = await Order.findAll({
      where: { storeId: id, status: "success" },
      attributes: [
        [groupFormat, "time"],
        [fn("COUNT", col("id")), "totalOrders"],
        [fn("SUM", col("totalPrice")), "totalRevenue"],
      ],
      group: ["time"],
      order: [[literal("time"), "ASC"]],
    });

    res.json({
      storeId: id,
      period,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Lỗi getRestaurantStatistics:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê doanh thu" });
  }
};
