import React from 'react'; // 🛑 Cần import React
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần Chart.js cần thiết
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Sửa lại PollChart thành forwardRef để nhận tham chiếu
const PollChart = React.forwardRef(({ poll }, ref) => { // 🛑 THÊM ref
  // Lấy nhãn (tên lựa chọn) và dữ liệu (số phiếu)
  const labels = poll.options.map(opt => opt.text);
  const dataCounts = poll.options.map(opt => opt.voters.length);
  const totalVotes = poll.totalVotes;

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Số phiếu bầu',
        data: dataCounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', 
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: false, // Tắt animation để cập nhật real-time mượt hơn
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tổng số phiếu: ${totalVotes}`,
      },
      tooltip: {
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                const value = context.parsed.y;
                const percentage = totalVotes > 0 ? ((value / totalVotes) * 100).toFixed(1) : 0;
                return `${label} ${value} phiếu (${percentage}%)`;
            }
        }
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                // Đảm bảo trục y hiển thị số nguyên
                callback: function(value) { if (value % 1 === 0) { return value; } }
            }
        }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* 🛑 TRUYỀN ref VÀO COMPONENT BAR */}
      <Bar ref={ref} data={chartData} options={options} /> 
    </div>
  );
});

export default PollChart;