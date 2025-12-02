import DroneDelivery from "../models/DroneDelivery.js";
import { Order } from "../models/order.model.js";

export function startDeliveryCron() {
  setInterval(async () => {
    try {
      const flying = await DroneDelivery.findAll({ where: { status: "FLYING" } });
      const now = Date.now();

      for (const d of flying) {
        const startedAt = new Date(d.updatedAt).getTime();
        const etaMs = Number(d.estimatedTime || 0) * 60 * 1000;
        if (etaMs > 0 && now - startedAt >= etaMs) {
          const order = await Order.findByPk(d.orderId);
          if (order && order.status === "delivering") {
            await order.update({ status: "success" });
          }
          await d.update({ status: "WAITING", orderId: null });
        }
      }
    } catch (e) {
      console.error("❌ Cron delivery error:", e);
    }
  }, 30_000); // 30s
}