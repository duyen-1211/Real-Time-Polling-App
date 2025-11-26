// client/src/pages/PollDetail.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'http://localhost:5000/api/polls';
const SOCKET_URL = 'http://localhost:5000';

function PollDetail() {
    const { id } = useParams();
    const [poll, setPoll] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [error, setError] = useState('');
    const socketRef = useRef(null);
    const chartRef = useRef(null);

    // Kiểm tra trạng thái vote từ localStorage
    const checkUserVoteStatus = useCallback(() => {
        const votedStatus = localStorage.getItem(`voted_${id}`);
        if (votedStatus === 'true') setHasVoted(true);
    }, [id]);

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await axios.get(`${API_URL}/${id}`);
                setPoll(res.data);
            } catch (err) {
                console.error(err);
                setError('Không tìm thấy cuộc thăm dò này.');
            }
        };

        fetchPoll();
        checkUserVoteStatus();

        // Socket.IO
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL);
            socketRef.current.on('connect', () => {
                console.log('Socket connected', socketRef.current.id);
                socketRef.current.emit('join_poll', id);
            });
            socketRef.current.on('poll_update', (updatedPoll) => {
                setPoll(updatedPoll);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_poll', id);
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [id, checkUserVoteStatus]);

    // Bỏ phiếu
    const handleVote = async (optionIndex) => {
        if (hasVoted) {
            setError('Bạn đã bỏ phiếu cho cuộc thăm dò này rồi.');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/${id}/vote`, { optionIndex });
            setPoll(res.data);
            setHasVoted(true);
            localStorage.setItem(`voted_${id}`, 'true');
            setError('');
        } catch (err) {
            if (err.response && err.response.status === 400 && err.response.data.error) {
                setError(err.response.data.error);
                setHasVoted(true);
                localStorage.setItem(`voted_${id}`, 'true');
            } else {
                setError('Lỗi khi bỏ phiếu. Vui lòng thử lại.');
                console.error(err);
            }
        }
    };

    // Like poll
    const handleLike = async () => {
        try {
            const res = await axios.post(`${API_URL}/${id}/like`);
            setPoll(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Share poll
    const shareUrl = window.location.href;
    const shareText = `Hãy tham gia bình chọn: ${poll?.question || ''}`;
    const handleShare = (platform) => {
        let url = '';
        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
                break;
            default: return;
        }
        window.open(url, '_blank', 'width=600,height=400');
    };

    // Download biểu đồ
    const handleDownload = () => {
        if (chartRef.current) {
            const link = document.createElement('a');
            link.download = `ket-qua-tham-do-${id}.png`;
            link.href = chartRef.current.toBase64Image();
            link.click();
        }
    };

    if (!poll) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu...</div>;

    const chartData = {
        labels: poll.options.map(opt => opt.text),
        datasets: [
            {
                label: 'Số phiếu bầu',
                data: poll.options.map(opt => opt.votes),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: poll.question } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Số phiếu' } } },
    };

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h1 style={{ color: '#333' }}>{poll.question}</h1>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={handleLike} style={{ padding: '8px 15px', background: '#ff4757', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    ❤️ Like Poll ({poll.likes})
                </button>
                <span style={{ fontSize: '14px', color: '#666' }}>ID: {id}</span>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {/* Cột vote */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🗳️ Bình chọn của bạn</h3>
                    {hasVoted ? (
                        <div style={{ padding: '15px', background: '#dff9fb', color: '#130f40', borderRadius: '5px' }}>
                            ✅ Cảm ơn bạn đã bỏ phiếu! Kết quả đang được hiển thị bên cạnh.
                        </div>
                    ) : (
                        poll.options.map((opt, index) => (
                            <button
                                key={index}
                                onClick={() => handleVote(index)}
                                style={{
                                    display: 'block',
                                    margin: '10px 0',
                                    padding: '12px',
                                    width: '100%',
                                    background: '#f1f2f6',
                                    border: '1px solid #ced6e0',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: '0.2s',
                                }}
                                onMouseOver={(e) => (e.target.style.background = '#eccc68')}
                                onMouseOut={(e) => (e.target.style.background = '#f1f2f6')}
                            >
                                {opt.text}
                            </button>
                        ))
                    )}
                </div>

                {/* Cột biểu đồ */}
                <div style={{ flex: 1.5, minWidth: '300px' }}>
                    <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📊 Kết quả trực tiếp</h3>
                    <div style={{ background: '#fff', padding: '10px' }}>
                        <Bar ref={chartRef} data={chartData} options={chartOptions} />
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h4>Công cụ:</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={handleDownload} style={{ padding: '8px', background: '#2ed573', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                📥 Tải biểu đồ
                            </button>
                            <button onClick={() => handleShare('facebook')} style={{ padding: '8px', background: '#3b5998', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Facebook
                            </button>
                            <button onClick={() => handleShare('twitter')} style={{ padding: '8px', background: '#1DA1F2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Twitter
                            </button>
                            <button onClick={() => handleShare('linkedin')} style={{ padding: '8px', background: '#0077b5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                LinkedIn
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
        </div>
    );
}

export default PollDetail;
