import axios from 'axios';

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

const languageMap = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  rust: { language: 'rust', version: '1.68.2' },
  java: { language: 'java', version: '15.0.2' },
  php: { language: 'php', version: '8.2.3' },
  sql: { language: 'sql', version: '3.36.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
};

export const executeCode = async (language, content) => {
  const config = languageMap[language];
  if (!config) throw new Error('Language not supported for execution');

  try {
    const { data } = await axios.post(PISTON_API, {
      language: config.language,
      version: config.version,
      files: [{ content }],
    });
    return data.run;
  } catch (err) {
    console.error('Piston API Error:', err);
    throw new Error('Failed to execute code');
  }
};
