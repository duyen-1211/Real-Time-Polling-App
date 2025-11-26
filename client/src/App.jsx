import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PollDetail from './pages/PollDetail';
import './App.css'; // Giữ lại CSS nếu bạn muốn dùng style mặc định

function App() {
  return (
    // Bọc toàn bộ ứng dụng trong Router
    <Router>
      <div className="container" style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#1a73e8' }}>
          Real-Time Polling App 🚀
        </h1>
        <Routes>
          {/* Trang chủ: Hiển thị danh sách thăm dò và form tạo mới */}
          <Route path="/" element={<Home />} /> 
          
          {/* Trang chi tiết: Hiển thị biểu đồ và nút bỏ phiếu */}
          <Route path="/poll/:id" element={<PollDetail />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;