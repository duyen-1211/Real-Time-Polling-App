import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PollCreator from '../components/PollCreator';

const Home = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sửa thành URL Render khi deploy
    const API_URL = "http://localhost:5000/api/polls"; 

    // Hàm lấy danh sách Polls hiện có
    const fetchPolls = async () => {
        try {
            const res = await axios.get(API_URL);
            setPolls(res.data);
        } catch (err) {
            console.error('Failed to fetch polls:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm gọi API tạo Poll
    const handlePollCreated = async (pollData) => {
        try {
            const res = await axios.post(API_URL, pollData);
            alert(`🎉 Poll "${res.data.question}" đã được tạo thành công!`);
            // Sau khi tạo thành công, cập nhật lại danh sách
            setPolls([res.data, ...polls]); 
        } catch (err) {
            alert('❌ Lỗi khi tạo Poll. Kiểm tra server.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    return (
        <div>
            <PollCreator onPollCreated={handlePollCreated} />
            
            <h2>Các cuộc thăm dò hiện có</h2>
            {loading ? (
                <p>Đang tải danh sách...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {polls.map((poll) => (
                        <div key={poll._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                            <h4>{poll.question}</h4>
                            <p>Lựa chọn: {poll.options.length}</p>
                            {/* Link đến trang chi tiết Poll để bỏ phiếu */}
                            <a href={`/poll/${poll._id}`} style={{ textDecoration: 'none', color: '#1a73e8', fontWeight: 'bold' }}>
                                Xem Chi tiết & Bầu chọn →
                            </a>
                        </div>
                    ))}
                    {polls.length === 0 && <p>Chưa có cuộc thăm dò nào được tạo.</p>}
                </div>
            )}
        </div>
    );
};

export default Home;