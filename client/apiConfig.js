// client/src/apiConfig.js

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Tự động chọn link dựa trên môi trường
export const API_URL = isLocal 
  ? "http://localhost:5000"  // Link khi chạy ở máy nhà
  : "https://polling-app-h32c.onrender.com"; // Link khi đưa lên mạng (Thay link Render của bạn vào đây)