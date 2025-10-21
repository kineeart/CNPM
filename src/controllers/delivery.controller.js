import DroneDelivery from "../models/droneDelivery.model.js";
import Order from "../models/order.model.js";

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location } = req.body;

    // Tìm đơn giao hàng theo orderId
    const delivery = await DroneDelivery.findOne({ where: { orderId } });
    if (!delivery) {
      return res.status(404).json({ message: "Không tìm thấy đơn giao hàng" });
    }

    // Cập nhật trạng thái và vị trí
    delivery.status = status || delivery.status;
    if (location) delivery.location = location;
    await delivery.save();

    // Cập nhật trạng thái Order nếu cần
    const order = await Order.findByPk(orderId);
    if (order) {
      switch (status) {
        case "FLYING":
          order.status = "delivering";
          break;
        case "DELIVERED":
          order.status = "success";
          break;
        case "RETURNING":
          order.status = "failed";
          break;
      }
      await order.save();
    }

    // ✅ (Tuỳ chọn) Gửi real-time notification tới người dùng
    // emitSocketEvent("delivery:update", { orderId, status, location });

    res.json({
      message: "Cập nhật trạng thái giao hàng thành công",
      delivery
    });
  } catch (error) {
    console.error("❌ Lỗi cập nhật trạng thái drone:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái" });
  }
};
