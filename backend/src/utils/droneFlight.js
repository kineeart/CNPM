// src/utils/droneFlight.js
import DroneDelivery from "../models/DroneDelivery.js";
import { Order } from "../models/order.model.js";

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371, toRad = d => (d*Math.PI)/180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export const updateDronePositions = async () => {
  const flyingDrones = await DroneDelivery.findAll({ where:{status:"FLYING"} });
  for(const drone of flyingDrones){
    const order = await Order.findByPk(drone.orderId, { include:["Store"] });
    if(!order||!order.Store) continue;

    const distanceKm = haversine(order.Store.latitude, order.Store.longitude, order.latitude, order.longitude);
    const etaMs = (Number(drone.estimatedTime)||1)*60*1000;
    const startedAt = new Date(drone.updatedAt).getTime();
    const progress = Math.min((Date.now() - startedAt)/etaMs, 1);

    const curLat = order.Store.latitude + (order.latitude - order.Store.latitude)*progress;
    const curLon = order.Store.longitude + (order.longitude - order.Store.longitude)*progress;

    await drone.update({ location:`${curLat},${curLon}` });

    if(progress>=1){
      await drone.update({ status:"RETURNING", orderId:null });
      await order.update({ status:"success" });
    }
  }
};

// Sử dụng setInterval trong server.js hoặc app.js
setInterval(updateDronePositions, 5000);
