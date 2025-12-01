import React from "react";
import "../css/Notification.css";

export default function Notification({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
}
