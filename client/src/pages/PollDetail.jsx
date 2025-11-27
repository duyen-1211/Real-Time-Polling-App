// polldetail.jsx (CẬP NHẬT)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import PollChart from '../components/PollChart';

// Import file CSS mới
import './PollDetail.css'; 

// URL API và Socket
const API_BASE = "https://real-time-polling-app-3.onrender.com/api/polls"; 
const SOCKET_SERVER_URL = "https://real-time-polling-app-3.onrender.com";

const PollDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    
    const chartRef = useRef(null); 

    const handleBackToHome = () => {
        navigate('/'); 
    };

    // 1. Hàm xử lý bỏ phiếu (giữ nguyên)
    const handleVote = async (optionIndex) => {
        try {
            await axios.post(`${API_BASE}/${id}/vote`, { optionIndex });
        } catch (err) {
            alert('Lỗi bỏ phiếu. Bạn có thể đã bỏ phiếu rồi.');
        }
    };
    
    // 2. Hàm xử lý Thích (Like) (giữ nguyên)
    const handleLike = async () => {
        try {
            await axios.post(`${API_BASE}/${id}/like`);
        } catch (err) {
            alert('❌ Lỗi khi thích Poll.');
        }
    };

    // 3. Hàm xử lý Tải xuống Biểu đồ (Export PNG) (giữ nguyên)
    const handleDownloadChart = () => {
        if (!chartRef.current) return alert("Không tìm thấy biểu đồ!");

        const imageURL = chartRef.current.toBase64Image(); 
        
        const a = document.createElement('a');
        a.href = imageURL;
        a.download = `poll_results_${poll.question.substring(0, 15).replace(/[^a-z0-9]/gi, '_')}.png`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("Đã tải xuống biểu đồ kết quả.");
    };

    // 4. Hàm xử lý Chia sẻ Mạng xã hội (giữ nguyên)
    const handleShare = (platform) => {
        const pollUrl = window.location.href; 
        const text = `📊 Hãy tham gia thăm dò ý kiến về "${poll.question}" của tôi!`;
        let shareLink = '';

        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pollUrl)}`;
                break;
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pollUrl)}&title=${encodeURIComponent(poll.question)}`;
                break;
            default:
                return;
        }

        window.open(shareLink, '_blank', 'width=600,height=400');
    };
    
    // ⭐ 5. HÀM XỬ LÝ XÓA POLL MỚI ⭐
    const handleDeletePoll = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa cuộc thăm dò này? Hành động này không thể hoàn tác.")) {
            try {
                // Gửi yêu cầu DELETE đến API
                await axios.delete(`${API_BASE}/${id}`);
                alert("✅ Đã xóa cuộc thăm dò thành công!");
                // Điều hướng về trang chủ sau khi xóa
                navigate('/'); 
            } catch (err) {
                console.error("Lỗi khi xóa Poll:", err);
                alert('❌ Lỗi khi xóa Poll. Vui lòng thử lại.');
            }
        }
    };

    // 6. Hàm kết nối và lắng nghe Socket (giữ nguyên)
    const setupSocketConnection = useCallback((pollId) => {
        const newSocket = io(SOCKET_SERVER_URL);
        
        newSocket.emit('join_poll', pollId);
        
        newSocket.on('poll_update', (newResults) => {
            console.log('Vote update received!', newResults);
            setPoll(newResults); 
        });

        newSocket.on('poll_like_update', (data) => {
            console.log('Like update received!', data);
            setPoll(prevPoll => ({ ...prevPoll, likes: data.likes }));
        });

        setSocket(newSocket);
        return newSocket;
    }, []);

    // 7. Lấy dữ liệu Poll ban đầu và thiết lập Socket (giữ nguyên)
    useEffect(() => {
        const fetchAndConnect = async () => {
            try {
                const res = await axios.get(`${API_BASE}/${id}`);
                setPoll(res.data);
                
                const currentSocket = setupSocketConnection(id);
                
                return () => {
                    if (currentSocket) currentSocket.disconnect();
                };

            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndConnect();
    }, [id, setupSocketConnection]);

    
    if (loading) return <h2 className="loading-message">Đang tải chi tiết thăm dò...</h2>;
    if (!poll) return <h2 className="error-message">Thăm dò không tồn tại.</h2>;

    return (
        <div className="poll-detail-container">
            
            <div className="top-actions"> {/* Thêm div bọc để căn chỉnh */}
                {/* NÚT QUAY LẠI TRANG CHỦ */}
                <button 
                    onClick={handleBackToHome} 
                    className="back-button" 
                >
                    {"<"} Về Trang chủ
                </button> 
                
                {/* ⭐ NÚT XÓA POLL MỚI ⭐ */}
                <button
                    onClick={handleDeletePoll}
                    className="delete-button"
                >
                    Xóa cuộc bình chọn
                </button>
            </div>
            {/* ------------------------------------ */}

            <h2>{poll.question}</h2>
            
            {/* VỊ TRÍ NÚT THÍCH VÀ SỐ LƯỢT THÍCH */}
            <div className="like-section">
                <button
                    onClick={handleLike}
                    className="like-button"
                >
                    Thích Poll ❤️
                </button>
                <span className="like-count">{poll.likes || 0} Lượt thích</span>
            </div>
            
            {/* Layout 2 cột chính */}
            <div className="content-layout"> 
                
                {/* Cột trái: Biểu đồ kết quả Real-Time */}
                <div className="chart-area">
                    <h3 className="chart-title">
                        Kết quả Real-Time
                    </h3>
                    <PollChart ref={chartRef} poll={poll} />
                    
                    {/* KHU VỰC NÚT HÀNH ĐỘNG: TẢI XUỐNG & CHIA SẺ */}
                    <div className="action-buttons">
                        
                        {/* Nút TẢI XUỐNG */}
                        <button 
                            onClick={handleDownloadChart}
                            className="download-button"
                        >
                            Tải xuống Biểu đồ ⬇️
                        </button>
                        
                        {/* NÚT CHIA SẺ */}
                        <button onClick={() => handleShare('twitter')} className="share-twitter">Twitter</button>
                        <button onClick={() => handleShare('facebook')} className="share-facebook">Facebook</button>
                    </div>

                </div>
                
                {/* Cột phải: Nút bỏ phiếu */}
                <div className="voting-options-area">
                    <h3 className="vote-title">Bỏ phiếu của bạn</h3>
                    {poll.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleVote(index)}
                            className="vote-button"
                        >
                            {option.text}
                        </button>
                    ))}
                    <p className="total-votes-count">Tổng phiếu: {poll.totalVotes}</p>
                </div>
            </div>
        </div>
    );
};

export default PollDetail;