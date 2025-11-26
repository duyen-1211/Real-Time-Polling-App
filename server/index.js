require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const Poll = require('./models/Poll'); 

const authRoutes = require('./routes/authRoutes');

// 🛑 1. IMPORT ROUTES (Module exports a function)
const pollRoutes = require('./routes/pollRoutes'); 

const app = express();
app.use(cors());
app.use(express.json());

// 1. Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

// 2. Thiết lập HTTP Server và Socket.IO
const server = http.createServer(app); 
const io = new Server(server, { cors: { origin: '*' } }); 

// Bắt đầu lắng nghe kết nối Socket
io.on('connection', (socket) => {
    console.log(`📡 New client connected: ${socket.id}`);
    
    // Lắng nghe sự kiện Client muốn tham gia vào phòng (room) của một cuộc thăm dò cụ thể
    socket.on('join_poll', (pollId) => {
        socket.join(pollId);
        console.log(`User ${socket.id} joined room: ${pollId}`);
    });
});

// 3. Khai báo API Routes
app.use('/api/polls', pollRoutes(io)); 
app.use('/api/auth', authRoutes); // <-- KẾT NỐI AUTH ROUTES Ở ĐÂY

app.get('/', (req, res) => res.send('Polling Server is Ready!'));

// 4. Khởi động Server (Dùng server.listen thay vì app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`)); 
