import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../apiConfig';

function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); // Mặc định 2 lựa chọn
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Lọc bỏ các option rỗng
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (!question || validOptions.length < 2) return alert("Cần câu hỏi và ít nhất 2 lựa chọn!");

    await axios.post(`${API_URL}/api/polls`, {
      question,
      options: validOptions
    });
    navigate('/');
  };

  return (
    <div>
      <h2>Create a Poll</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Question: </label>
          <input 
            type="text" 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            required 
            style={{ width: '300px' }}
          />
        </div>
        {options.map((opt, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <label>Option {index + 1}: </label>
            <input 
              type="text" 
              value={opt} 
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addOption}>+ Add Option</button>
        <br /><br />
        <button type="submit">Create Poll</button>
      </form>
    </div>
  );
}

export default CreatePoll;