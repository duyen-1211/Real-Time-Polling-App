const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        // 🛑 ĐÃ SỬA: Lưu IP Address (String) thay vì ID người dùng 
        voters: [{ type: String }] 
    }],
    totalVotes: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', PollSchema);