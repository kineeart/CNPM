🛒 FastFood Drone Delivery System

Website đặt đồ ăn nhanh và giao hàng bằng drone 🚀 — xây dựng bằng React + Node.js + MySQL

📖 Giới thiệu

Dự án là một hệ thống đặt món ăn trực tuyến, nơi người dùng có thể:

Xem danh sách cửa hàng và menu món ăn 🍔

Thêm món vào giỏ hàng 🛍️

Tạo đơn hàng và theo dõi trạng thái giao hàng bằng drone 🚁

Quản lý người dùng, cửa hàng và sản phẩm (phía admin)

Hệ thống gồm 2 phần chính:

Frontend: React (hiển thị giao diện người dùng)

Backend: Node.js + Express + MySQL (xử lý API và dữ liệu)

⚙️ Công nghệ sử dụng
🧩 Frontend:

React.js (Vite)

React Router DOM

Axios

TailwindCSS (hoặc CSS thuần)

🧠 Backend:

Node.js + Express.js

MySQL (hoặc XAMPP, MariaDB)

Sequelize ORM (nếu có)

JWT (xác thực người dùng)

Bcrypt (mã hóa mật khẩu)

🗂️ Cấu trúc thư mục
Source code/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config/
│   │   └── server.js
│   └── package.json
│
├── frontend-react/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
│
└── README.md

🧰 Cài đặt và chạy dự án
1️⃣ Cài đặt cơ sở dữ liệu

Tạo database trong MySQL, ví dụ: fastfood_db

Import file SQL (nếu có):

fastfood_db.sql


Cấu hình file kết nối MySQL trong:

backend/src/config/db.js

export const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "fastfood_db",
};

2️⃣ Cài đặt Backend
cd backend
npm install
npm run dev


Server mặc định chạy tại:
🖥️ http://localhost:3000

3️⃣ Cài đặt Frontend
cd frontend-react
npm install
npm run dev


Ứng dụng React chạy tại:
🌐 http://localhost:5173 (hoặc cổng Vite hiển thị)

🔗 Kết nối Frontend ↔ Backend

Trong file frontend (ví dụ /src/api.js hoặc nơi gọi API), đảm bảo:

const API_URL = "http://localhost:3000/api";

💡 Các tính năng chính
👤 Người dùng:

Đăng ký / Đăng nhập

Xem danh sách cửa hàng

Xem menu từng cửa hàng

Thêm món vào giỏ hàng

Cập nhật số lượng, xóa sản phẩm

Tạo đơn hàng

🏪 Quản lý cửa hàng (Admin):

Thêm / sửa / xóa cửa hàng

Thêm / chỉnh sửa sản phẩm

Quản lý đơn hàng

🧑‍💻 Các API chính
Phương thức	Endpoint	Mô tả
POST	/api/auth/register	Đăng ký tài khoản
POST	/api/auth/login	Đăng nhập
GET	/api/stores	Danh sách cửa hàng
GET	/api/menu/:storeId	Menu của cửa hàng
GET	/api/cart/:userId	Xem giỏ hàng
PUT	/api/cart/update	Cập nhật số lượng
POST	/api/order/create	Tạo đơn hàng
