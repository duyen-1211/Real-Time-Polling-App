// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Lưu các Poll mà người dùng đã thích (để tạo trang My Likes)
    likedPolls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poll' }], 
    createdAt: { type: Date, default: Date.now }
});

// Middleware: Băm (Hash) mật khẩu trước khi lưu vào DB
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Phương thức: So sánh mật khẩu (dùng khi đăng nhập)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);