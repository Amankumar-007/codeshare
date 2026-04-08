import axios from 'axios';

const testPiston = async () => {
  try {
    const { data } = await axios.post('https://piston.pydis.com/api/v2/execute', {
      language: 'python',
      version: '*',
      files: [{ content: "print('hello from pydis')" }]
    });
    console.log('Success:', data.run.output);
  } catch (err) {
    console.error('Failed:', err.response?.data || err.message);
  }
};

testPiston();
