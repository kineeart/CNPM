import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Modal.css";

const SelectDroneModal = ({ orderId, onClose, onSelect }) => {
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/drones/waiting");
        setDrones(res.data);
      } catch (err) {
        console.error("❌ Lỗi lấy drone:", err);
      }
    };
    fetchDrones();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🚁 Chọn Drone giao đơn #{orderId}</h3>

        {drones.length === 0 ? (
          <p>Không có drone nào đang rảnh.</p>
        ) : (
          <ul className="drone-list">
            {drones.map((d) => (
              <li key={d.id} className="drone-item">
                <span>Drone #{d.id} – Pin: {d.battery}%</span>
                <button onClick={() => onSelect(d.id)}>Chọn</button>
              </li>
            ))}
          </ul>
        )}

        <button className="close-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default SelectDroneModal;
