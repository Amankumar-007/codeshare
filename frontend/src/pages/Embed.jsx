import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

export default function Embed() {
  const { id } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/snippets/${id}`);
        setContent(data.content);
      } catch (err) {
        console.error('Embed load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippet();
  }, [id]);

  if (loading) return null;

  return (
    <div className="h-screen bg-[#0d1117] overflow-hidden">
      <CodeMirror
        value={content}
        height="100vh"
        theme={oneDark}
        extensions={[javascript({ jsx: true })]}
        readOnly={true}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
        }}
      />
      <div className="absolute bottom-2 right-4 text-[10px] text-gray-500 font-mono pointer-events-none opacity-50">
        Shared via TextDrop
      </div>
    </div>
  );
}
