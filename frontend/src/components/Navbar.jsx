import React, { useState, useEffect } from 'react';
import { Share2, Settings, Save, Edit3, X, Check, User, LogOut, GitFork, Copy, Code, Eye, Play, Flame, Clock, Image as ImageIcon, Upload } from 'lucide-react';
import LangSelector from './LangSelector';
import ExpiryMenu from './ExpiryMenu';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Navbar({ id, onIdChange, language, onLangChange, expiry, maxViews, onExpiryChange, onSave, saving, onFork, onEmbed, onRun, users, isSyncing, timeLeft, socket, onShowUploads, uploadCount }) {
  const [editingId, setEditingId] = useState(false);
  const [newId, setNewId] = useState(id);
  const [idAvailable, setIdAvailable] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const checkId = async (val) => {
    setNewId(val);
    if (val === id) return setIdAvailable(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/snippets/check/${val}`);
      setIdAvailable(data.available);
    } catch (e) { setIdAvailable(false); }
  };

  const handleIdSubmit = () => {
    if (idAvailable && newId !== id) onIdChange(newId);
    setEditingId(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      const token = localStorage.getItem('token');
      
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'image_upload',
          token,
          imageData: base64Data,
          name: file.name
        }));
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = null;
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0d1117] text-white z-50 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-bold text-white hover:opacity-90 transition-opacity flex items-center gap-2" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
          SnIPPETX
        </Link>
        <div className="h-6 w-px bg-gray-700 mx-1" />

        {editingId ? (
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1">
            <span className="text-gray-500 text-sm">/</span>
            <input
              autoFocus
              className={`bg-transparent outline-none text-sm font-mono w-32 ${idAvailable ? 'text-green-400' : 'text-red-400'}`}
              value={newId}
              onChange={(e) => checkId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIdSubmit()}
            />
            <button onClick={handleIdSubmit} className="hover:text-green-400"><Check className="w-4 h-4" /></button>
            <button onClick={() => setEditingId(false)} className="hover:text-red-400"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              onClick={() => setEditingId(true)}
              className="group flex items-center gap-2 text-sm font-mono text-gray-400 cursor-pointer hover:text-white transition-colors"
            >
              <span>/{id}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {maxViews === 1 && (
              <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/50 rounded text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3" />
                SELF-DESTRUCT ACTIVE
              </div>
            )}
            {timeLeft !== null && timeLeft < 86400 && (
              <div className={`px-2 py-0.5 bg-orange-500/10 border rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors ${timeLeft < 60 ? 'text-red-400 border-red-500/50 animate-pulse' : 'text-orange-400 border-orange-500/50'}`}>
                <Clock className={`w-3 h-3 ${timeLeft < 60 ? 'animate-spin-slow' : ''}`} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {id !== "profile" && (
          <>
            <LangSelector current={language} onChange={onLangChange} />
            <ExpiryMenu current={expiry} onChange={onExpiryChange} />
          </>
        )}

        <div className="h-6 w-px bg-gray-700 mx-1" />

        {id !== "profile" && (
          <>
            <div className="flex -space-x-2 mr-2">
              {users?.map(u => (
                <div
                  key={u.id}
                  className="w-8 h-8 rounded-full border-2 border-[#0d1117] flex items-center justify-center text-[10px] font-bold shadow-lg ring-2 ring-blue-500/10 cursor-help"
                  style={{ backgroundColor: u.color }}
                  title={u.username}
                >
                  {(u.username || '??').slice(-2).toUpperCase()}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1 mr-2 min-w-[80px]">
              {isSyncing ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 animate-pulse">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  SYNCING...
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                  <div className="w-1 h-1 bg-gray-600 rounded-full" />
                  SAVED
                </div>
              )}
            </div>

            <button
              onClick={onEmbed}
              title="Embed Code"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors bg-gray-800/50 border border-gray-700/50 group"
            >
              <Code className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={copyLink}
              title="Copy Link"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors bg-gray-800/50 border border-gray-700/50 group"
            >
              <Share2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={onFork}
              title="Fork Snippet"
              className="px-3 py-2 flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg text-sm font-medium transition-all group"
            >
              <GitFork className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              Fork
            </button>

            <div className="h-6 w-px bg-gray-700 mx-1" />

            {currentUser && (
              <>
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="image-upload"
                  title="Upload Image Asset"
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-all bg-zinc-800/50 border border-zinc-700/50 group cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </label>
              </>
            )}

            <button
              onClick={onShowUploads}
              title="View Shared Assets"
              className="relative p-2 hover:bg-zinc-800 rounded-lg transition-all bg-zinc-800/50 border border-zinc-700/50 group"
            >
              <ImageIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              {uploadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-[9px] font-black rounded-full flex items-center justify-center border border-[#0d1117] animate-in zoom-in duration-300">
                  {uploadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-gray-700 mx-1" />

            <button
              onClick={onRun}
              className="px-4 py-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              Run
            </button>

            <button
              onClick={onSave}
              disabled={saving}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium transition-all shadow-lg ${saving ? 'bg-gray-700 border border-gray-600 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-95'}`}
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}

        <div className="h-6 w-px bg-gray-700 mx-1" />

        {currentUser ? (
          <div className="flex items-center gap-3 ml-2">
            <Link
              to={`/profile/${currentUser.username}`}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700 hover:border-blue-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/10"
              style={{ backgroundColor: currentUser.avatarColor }}
              title={`View ${currentUser.username}'s profile`}
            >
              {(currentUser.username || '??').slice(0, 2).toUpperCase()}
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border border-gray-700/50 hover:border-blue-400/50 active:scale-95"
          >
            <User className="w-4 h-4 text-gray-400" />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
