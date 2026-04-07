import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Navbar from '../components/Navbar';
import Editor from '../components/Editor';
import TabBar from '../components/TabBar';
import EmbedModal from '../components/EmbedModal';
import OutputPanel from '../components/OutputPanel';
import { executeCode } from '../utils/runner';
import { Flame, AlertTriangle } from 'lucide-react';
import { nanoid } from 'nanoid';

const API_BASE = 'http://localhost:5000/api';

export default function Snippet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([{ id: nanoid(5), name: 'main.js', content: '', language: 'javascript' }]);
  const [activeTabId, setActiveTabId] = useState(null);
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
  const [isNotFound, setIsNotFound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Live Countdown Logic
  useEffect(() => {
    if (!expiresAt || isBurned) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiryDate = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiryDate - now) / 1000));

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
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const { data } = await axios.get(`${API_BASE}/snippets/${id}`, {
          headers: { 'x-viewer-id': user?.id }
        });
        if (isMounted) {
          setExpiresAt(data.expiresAt);
          setMaxViews(data.maxViews || 0);
          deriveExpiryFromData(data);
        }
      } catch (e) {
        if (e.response?.status === 404) {
          if (isMounted) {
            setIsNotFound(true);
            setLoading(false);
          }
        } else {
          console.error('Error fetching snippet:', e);
        }
      }
    };

    const connect = () => {
      if (!isMounted) return;
      ws = new WebSocket(`ws://localhost:5000/${id}`);
      setSocket(ws);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          setTabs(data.files);
          setActiveTabId(data.files[0].id);
          setLoading(false);
        } else if (data.type === 'op') {
          setTabs(prev => prev.map(t => t.id === data.fileId ? { ...t, content: data.content } : t));
        } else if (data.type === 'tab_sync') {
          if (data.action === 'create') {
            setTabs(prev => [...prev, data.tab]);
          } else if (data.action === 'delete') {
            setTabs(prev => {
              const newTabs = prev.filter(t => t.id !== data.tabId);
              setActiveTabId(currentId => {
                if (currentId === data.tabId) return newTabs[0]?.id;
                return currentId;
              });
              return newTabs;
            });
          } else if (data.action === 'rename') {
            setTabs(prev => prev.map(t => t.id === data.tabId ? { ...t, name: data.newName } : t));
          } else if (data.action === 'lang_change') {
            setTabs(prev => prev.map(t => t.id === data.tabId ? { ...t, language: data.newLang } : t));
          }
        } else if (data.type === 'presence') {
          setUsers(data.users);
        } else if (data.type === 'burned') {
          setIsBurned(true);
          setTabs([]);
        } else if (data.type === 'meta') {
          setExpiresAt(data.expiresAt);
          setMaxViews(data.maxViews || 0);
          deriveExpiryFromData(data);
        }
      };

      ws.onerror = (err) => console.error('WebSocket Error:', err);

      ws.onclose = () => {
        if (isMounted) setTimeout(connect, 2000);
      };
    };

    fetchSnippetDetails();
    connect();
    return () => {
      isMounted = false;
      if (ws) {
        ws.onclose = null; // Prevent reconnect on intentional close
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    };
  }, [id]);

  // Tab Operations
  const handleTabAdd = () => {
    const newTab = { id: nanoid(5), name: `file-${tabs.length + 1}.js`, content: '', language: 'javascript' };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    socket?.send(JSON.stringify({ type: 'tab_action', action: 'create', tab: newTab }));
    saveSnippet({ files: [...tabs, newTab] }, true);
  };

  const handleTabClose = (tabId) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) setActiveTabId(newTabs[0].id);
    socket?.send(JSON.stringify({ type: 'tab_action', action: 'delete', tabId }));
    saveSnippet({ files: newTabs }, true);
  };

  const handleTabRename = (tabId, newName) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, name: newName } : t));
    socket?.send(JSON.stringify({ type: 'tab_action', action: 'rename', tabId, newName }));
    saveSnippet({ files: tabs.map(t => t.id === tabId ? { ...t, name: newName } : t) }, true);
  };

  const handleTabLangChange = (tabId, newLang) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, language: newLang } : t));
    socket?.send(JSON.stringify({ type: 'tab_action', action: 'lang_change', tabId, newLang }));
    saveSnippet({ files: tabs.map(t => t.id === tabId ? { ...t, language: newLang } : t) }, true);
  };

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleTabAdd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, expiresAt]);

  const broadcastOp = useRef(
    debounce((newContent, tabId, ws) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'op', fileId: tabId, content: newContent }));
      }
    }, 100)
  ).current;

  const autoSave = useRef(
    debounce((currentTabs) => {
      saveSnippet({ files: currentTabs }, true); // Silent auto-save
    }, 3000)
  ).current;

  const handleEditorChange = (newContent) => {
    const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, content: newContent } : t);
    setTabs(updatedTabs);
    broadcastOp(newContent, activeTabId, socket);
    autoSave(updatedTabs);
  };

  const handleRun = async () => {
    if (['html', 'css'].includes(activeTab.language)) {
      setShowOutput(true);
      return;
    }

    try {
      setShowOutput(true);
      setIsRunning(true);
      const res = await executeCode(activeTab.language, activeTab.content);
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
      const payload = { id: newId, files: tabs, expiresAt };
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

      const payload = { expiresAt, maxViews, files: tabs, ...metadata };
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
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

  if (loading) return (
    <div className="h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <span className="font-mono text-xs text-gray-500 animate-pulse uppercase tracking-widest">Bridging Connection...</span>
    </div>
  );

  if (isNotFound) return (
    <div className="h-screen bg-[#0d1117] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent">
      <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center backdrop-blur-xl shadow-2xl">
        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-zinc-700">
          <AlertTriangle size={40} className="text-zinc-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tighter">Workspace Missing</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-medium">
          The workspace <span className="text-blue-400 font-mono">/{id}</span> could not be found. It may have expired, been deleted, or never existed in this dimension.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-white/5"
        >
          Return to Hub
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      <EmbedModal id={id} isOpen={showEmbed} onClose={() => setShowEmbed(false)} />
      <Navbar
        id={id}
        onIdChange={handleIdChange}
        language={activeTab.language}
        onLangChange={(l) => { handleTabLangChange(activeTabId, l); }}
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

      <div className="flex flex-col flex-1 overflow-hidden">
        <TabBar 
          tabs={tabs} 
          activeTabId={activeTabId} 
          onTabSelect={setActiveTabId}
          onTabAdd={handleTabAdd}
          onTabClose={handleTabClose}
          onTabRename={handleTabRename}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 transition-all duration-300 ${showOutput ? 'w-1/2' : 'w-full'}`}>
            <Editor value={activeTab.content} language={activeTab.language} onChange={handleEditorChange} />
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
                type={activeTab.language}
                content={activeTab.content}
                output={output}
                isRunning={isRunning}
                onClose={() => setShowOutput(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
