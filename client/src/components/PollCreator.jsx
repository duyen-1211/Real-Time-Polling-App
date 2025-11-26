import React, { useState } from 'react';

const PollCreator = ({ onPollCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); 

  // Xử lý thêm/xóa lựa chọn
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Lọc bỏ các lựa chọn trống và chuẩn bị dữ liệu
    const validOptions = options
      .filter(opt => opt.trim() !== '')
      .map(opt => ({ text: opt })); 

    if (question.trim() === '' || validOptions.length < 2) {
      alert('Vui lòng nhập câu hỏi và ít nhất 2 lựa chọn.');
      return;
    }
    
    const newPollData = { question, options: validOptions };
    onPollCreated(newPollData); // Gửi dữ liệu về Home.jsx để gọi API
    
    // Reset form sau khi tạo poll
    setQuestion('');
    setOptions(['', '']);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '30px' }}>
      <h3>Tạo Thăm dò mới</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Câu hỏi của bạn là gì?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
        />

        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={`Lựa chọn ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            {options.length > 2 && (
              <button 
                type="button" 
                onClick={() => removeOption(index)} 
                style={{ marginLeft: '10px', padding: '0 10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                X
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addOption} style={{ padding: '8px 15px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', marginRight: '10px' }}>
          + Thêm Lựa chọn
        </button>
        <button type="submit" style={{ padding: '8px 15px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px' }}>
          Tạo Poll
        </button>
      </form>
    </div>
  );
};

export default PollCreator;