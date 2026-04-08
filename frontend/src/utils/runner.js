import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const executeCode = async (language, files) => {
  try {
    const content = Array.isArray(files) ? files[0].content : files;
    
    // We send to our own backend which acts as a robust proxy/balancer
    const { data } = await axios.post(`${API_BASE}/execute`, {
      language,
      content,
      files: Array.isArray(files) ? files : undefined
    });

    return data;
  } catch (err) {
    console.error('Execution Error:', err.response?.data || err.message);
    const errorMsg = err.response?.data?.error || err.message || 'Execution failed';
    throw new Error(errorMsg);
  }
};
