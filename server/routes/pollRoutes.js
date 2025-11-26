const express = require('express');
const mongoose = require('mongoose'); 
const Poll = require('../models/Poll');

// 🛑 EXPORT MỘT HÀM NHẬN VÀO IO 🛑
module.exports = (io) => {
    const router = express.Router();

    // @route   POST /api/polls
    // @desc    Tạo một cuộc thăm dò mới
    router.post('/', async (req, res) => {
        const { question, options } = req.body; 
        const pollOptions = options.map(opt => ({ text: opt.text })); 

        try {
            const newPoll = new Poll({ question, options: pollOptions });
            const poll = await newPoll.save();
            
            io.emit('new_poll_created', poll); 
            res.status(201).json(poll);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   GET /api/polls
    // @desc    Lấy tất cả các cuộc thăm dò
    router.get('/', async (req, res) => {
        try {
            const polls = await Poll.find().sort({ createdAt: -1 });
            res.json(polls);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   GET /api/polls/:pollId
    // @desc    Lấy chi tiết một cuộc thăm dò
    router.get('/:pollId', async (req, res) => {
        try {
            const poll = await Poll.findById(req.params.pollId);
            if (!poll) return res.status(404).send('Poll not found');
            res.json(poll);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    // @route   POST /api/polls/:pollId/vote
    // @desc    Xử lý bỏ phiếu AN TOÀN bằng IP Tracking
    router.post('/:pollId/vote', async (req, res) => {
        const { optionIndex } = req.body;
        const pollId = req.params.pollId;
        const voterId = req.ip; // 🛑 SỬ DỤNG IP ADDRESS LÀM ID NGƯỜI BỎ PHIẾU

        try {
            const poll = await Poll.findById(pollId);
            if (!poll) return res.status(404).send('Poll not found');
            if (!poll.options[optionIndex]) return res.status(400).send('Invalid option');
            
            // 1. KIỂM TRA GIAN LẬN: Xem IP đã bỏ phiếu cho Poll này chưa
            // (Vì Schema đã được sửa thành String để lưu IP, ta kiểm tra trực tiếp)
            const hasVoted = poll.options.some(option => 
                option.voters.includes(voterId)
            );

            if (hasVoted) {
                return res.status(400).json({ msg: 'Bạn đã bỏ phiếu cho cuộc thăm dò này' });
            }

            // 2. Cập nhật DB: Tăng totalVotes và push IP người dùng
            poll.totalVotes += 1;
            poll.options[optionIndex].voters.push(voterId); // LƯU IP
            
            await poll.save();

            // PHÁT SÓNG REAL-TIME
            io.to(pollId).emit('poll_update', poll); 
            
            res.status(200).json(poll);

        } catch (err) {
            console.error("Lỗi khi bỏ phiếu:", err);
            res.status(500).send('Server Error');
        }
    });

    // @route   POST /api/polls/:pollId/like
    // @desc    Xử lý Thích/Bỏ Thích (Không có Auth, chỉ tăng số lượng)
    router.post('/:pollId/like', async (req, res) => {
        const pollId = req.params.pollId;

        try {
            const poll = await Poll.findById(pollId);
            if (!poll) return res.status(404).send('Poll not found');

            // Tạm thời chỉ tăng số lượt thích (vì không cần lưu User ID)
            poll.likes = (poll.likes || 0) + 1;
            
            await poll.save();

            // PHÁT SÓNG REAL-TIME
            io.to(pollId).emit('poll_like_update', { likes: poll.likes }); 
            
            res.status(200).json({ likes: poll.likes });

        } catch (err) {
            console.error("Lỗi khi thích poll:", err);
            res.status(500).send('Server Error');
        }
    });

    // @route   DELETE /api/polls/:pollId
    // @desc    Xóa một cuộc thăm dò
    router.delete('/:pollId', async (req, res) => {
        try {
            const poll = await Poll.findByIdAndDelete(req.params.pollId);

            if (!poll) {
                return res.status(404).json({ msg: 'Poll not found' });
            }

            // Tùy chọn: Phát sóng để các client khác biết poll đã bị xóa (và chuyển hướng họ)
            io.emit('poll_deleted', req.params.pollId); 

            res.json({ msg: 'Poll deleted successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    return router; // Trả về Router
};