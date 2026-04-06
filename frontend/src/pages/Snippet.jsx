import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Navbar from '../components/Navbar';
import Editor from '../components/Editor';
import EmbedModal from '../components/EmbedModal';
import OutputPanel from '../components/OutputPanel';
import { executeCode } from '../utils/runner';
import { Flame } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Snippet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [expiry, setExpiry] = useState('30d');
  const [expiresAt, setExpiresAt] = useState(null);
  const [maxViews, setMaxViews] = useState(0);
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBurned, setIsBurned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Live Countdown Logic
  useEffect(() => {
    if (!expiresAt || isBurned) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));

      setTimeLeft(diff);

      if (diff <= 0) {
        setIsBurned(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isBurned]);

  useEffect(() => {
    if (id?.startsWith('@')) return;
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));

    let ws;
    let isMounted = true;

    const deriveExpiryFromData = (data) => {
      if (data.maxViews === 1) setExpiry('1v');
      else if (data.expiresAt) {
        const diff = new Date(data.expiresAt).getTime() - new Date(data.createdAt).getTime();
        if (diff <= 3 * 60 * 1000) setExpiry('2m');
        else if (diff <= 11 * 60 * 1000) setExpiry('10m');
        else if (diff <= 61 * 60 * 1000) setExpiry('1h');
        else if (diff <= 25 * 60 * 60 * 1000) setExpiry('24h');
      } else setExpiry('never');
    };

    const fetchSnippetDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const { data } = await axios.get(`${API_BASE}/snippets/${id}`, {
          headers: { 'x-viewer-id': user?.id }
        });
        if (isMounted) {
          setLanguage(data.language || 'javascript');
          setExpiresAt(data.expiresAt);
          setMaxViews(data.maxViews || 0);
          deriveExpiryFromData(data);
        }
      } catch (e) {
        if (e.response?.status !== 404) console.error('Error fetching snippet:', e);
      }
    };

    const connect = () => {
      if (!isMounted) return;
      ws = new WebSocket(`ws://localhost:5000/${id}`);
      setSocket(ws);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          setContent(data.content);
          setLoading(false);
          fetchSnippetDetails();
        } else if (data.type === 'op') {
          setContent(data.content);
        } else if (data.type === 'presence') {
          setUsers(data.users);
        } else if (data.type === 'burned') {
          setIsBurned(true);
          setContent('');
        } else if (data.type === 'meta') {
          setExpiresAt(data.expiresAt);
          setMaxViews(data.maxViews || 0);
          deriveExpiryFromData(data);
        }
      };

      ws.onclose = () => {
        if (isMounted) setTimeout(connect, 2000);
      };
    };

    connect();
    return () => {
      isMounted = false;
      if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [id]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSnippet();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, language, expiresAt]);

  const broadcastOp = useRef(
    debounce((newContent, ws) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'op', content: newContent }));
      }
    }, 100)
  ).current;

  const autoSave = useRef(
    debounce((content) => {
      saveSnippet({ content }, true); // Silent auto-save
    }, 3000)
  ).current;

  const handleEditorChange = (newContent) => {
    setContent(newContent);
    broadcastOp(newContent, socket);
    autoSave(newContent);
  };

  const handleRun = async () => {
    if (['html', 'css'].includes(language)) {
      setShowOutput(true);
      return;
    }

    try {
      setShowOutput(true);
      setIsRunning(true);
      const res = await executeCode(language, content);
      setOutput(res);
    } catch (err) {
      setOutput({ stderr: err.message, code: 1 });
    } finally {
      setIsRunning(false);
    }
  };

  const handleIdChange = async (newId) => {
    try {
      setSaving(true);
      const payload = { id: newId, content, language, expiresAt };
      if (currentUser?.id) payload.author = currentUser.id;
      await axios.patch(`${API_BASE}/snippets/${id}`, payload);
      navigate(`/${newId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update URL');
    } finally {
      setSaving(false);
    }
  };

  const handleFork = async () => {
    try {
      setSaving(true);
      const payload = {};
      if (currentUser?.id) payload.authorId = currentUser.id;
      const { data } = await axios.post(`${API_BASE}/snippets/${id}/fork`, payload);
      navigate(`/${data.id}`);
    } catch (err) {
      alert('Failed to fork snippet');
    } finally {
      setSaving(false);
    }
  };

  const saveSnippet = async (metadata = {}, silent = false) => {
    try {
      if (!silent) setSaving(true);
      else setIsSyncing(true);

      const payload = { content, language, expiresAt, maxViews, ...metadata };
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) payload.author = user.id;

      await axios.patch(`${API_BASE}/snippets/${id}`, payload);
      if (metadata.id) navigate(`/${metadata.id}`);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      if (!silent) setSaving(false);
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      <EmbedModal id={id} isOpen={showEmbed} onClose={() => setShowEmbed(false)} />
      <Navbar
        id={id}
        onIdChange={handleIdChange}
        language={language}
        onLangChange={(l) => { setLanguage(l); saveSnippet({ language: l }); }}
        expiry={expiry}
        maxViews={maxViews}
        onExpiryChange={(e, date, mv) => {
          setExpiry(e);
          setExpiresAt(date);
          setMaxViews(mv);
          saveSnippet({ expiresAt: date, maxViews: mv });
        }}
        users={users}
        onSave={() => saveSnippet()}
        onFork={handleFork}
        onEmbed={() => setShowEmbed(true)}
        onRun={handleRun}
        saving={saving}
        isSyncing={isSyncing}
        timeLeft={timeLeft}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 transition-all duration-300 ${showOutput ? 'w-1/2' : 'w-full'}`}>
          <Editor value={content} language={language} onChange={handleEditorChange} />
        </div>

        {isBurned && (
          <div className="fixed inset-0 z-[100] bg-[#0d1117]/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-red-500/10 border border-red-500/50 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/10 scale-in-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
                <Flame className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Snippet Burned</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                This snippet has been securely and permanently deleted from our servers.
                Zero traces remain in memory or on disk.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all active:scale-95"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {showOutput && (
          <div className="w-1/2 animate-in slide-in-from-right duration-300">
            <OutputPanel
              type={language}
              content={content}
              output={output}
              isRunning={isRunning}
              onClose={() => setShowOutput(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
