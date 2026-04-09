import React, { useState, useEffect } from 'react';
import { Share2, Settings, Save, Edit3, X, Check, User, LogOut, GitFork, Copy, Code, Eye, Play, Flame, Clock, Image as ImageIcon, Upload, Menu } from 'lucide-react';
import LangSelector from './LangSelector';
import ExpiryMenu from './ExpiryMenu';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ id, onIdChange, language, onLangChange, expiry, maxViews, onExpiryChange, onSave, saving, onFork, onEmbed, onRun, users, isSyncing, timeLeft, socket, onShowUploads, uploadCount }) {
  const [editingId, setEditingId] = useState(false);
  const [newId, setNewId] = useState(id);
  const [idAvailable, setIdAvailable] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/snippets/check/${val}`);
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
    e.target.value = null;
  };

  return (
    <nav className="h-16 flex items-center justify-between px-4 md:px-6 bg-[#0d1117] border-b border-white/5 text-white z-[100] sticky top-0 shadow-lg">
      <div className="flex items-center gap-2 md:gap-4">
        <Link to="/" className="text-xl md:text-2xl font-bold text-white hover:opacity-80 transition-all flex items-center gap-2" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
          SnIPPETX
        </Link>
        <div className="h-6 w-px bg-white/10 hidden sm:block mx-1" />

        {editingId ? (
          <div className="flex items-center gap-2 bg-[#161b22] border border-white/10 rounded-lg px-2 py-1">
            <span className="text-gray-500 text-sm">/</span>
            <input
              autoFocus
              className={`bg-transparent outline-none text-sm font-mono w-24 md:w-32 ${idAvailable ? 'text-green-400' : 'text-red-400'}`}
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
              className="group flex items-center gap-2 text-sm font-mono text-gray-500 cursor-pointer hover:text-white transition-colors"
            >
              <span className="max-w-[80px] md:max-w-none truncate font-medium">/{id}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
            </div>
            {maxViews === 1 && (
              <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/50 rounded text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse hidden sm:flex">
                <Flame className="w-3 h-3" />
                BURN
              </div>
            )}
            {timeLeft !== null && timeLeft < 86400 && (
              <div className={`px-2 py-0.5 bg-orange-500/10 border rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors hidden sm:flex ${timeLeft < 60 ? 'text-red-400 border-red-500/50 animate-pulse' : 'text-orange-400 border-orange-500/50'}`}>
                <Clock className={`w-3 h-3 ${timeLeft < 60 ? 'animate-spin-slow' : ''}`} />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Menu */}
      <div className="hidden xl:flex items-center gap-3">
        {id !== "profile" && (
          <>
            <LangSelector current={language} onChange={onLangChange} />
            <ExpiryMenu current={expiry} onChange={onExpiryChange} />
            <div className="h-6 w-px bg-white/10 mx-1" />
            
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

            <button
              onClick={onEmbed}
              title="Embed Code"
              className="p-2.5 hover:bg-[#1f242c] rounded-xl transition-all bg-[#161b22] border border-white/5 group"
            >
              <Code className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={copyLink}
              title="Copy Link"
              className="p-2.5 hover:bg-[#1f242c] rounded-xl transition-all bg-[#161b22] border border-white/5 group"
            >
              <Share2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={onFork}
              title="Fork Snippet"
              className="px-4 py-2 flex items-center gap-2 bg-[#161b22] hover:bg-[#1f242c] border border-white/5 rounded-xl text-sm font-bold transition-all group"
            >
              <GitFork className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              Fork
            </button>

            <div className="h-6 w-px bg-white/10 mx-1" />

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
                  className="p-2.5 hover:bg-[#1f242c] rounded-xl transition-all bg-[#161b22] border border-white/5 group cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </label>
              </>
            )}

            <button
              onClick={onShowUploads}
              title="View Shared Assets"
              className="relative p-2.5 hover:bg-[#1f242c] rounded-xl transition-all bg-[#161b22] border border-white/5 group"
            >
              <ImageIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              {uploadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#161b22] animate-in zoom-in duration-300">
                  {uploadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-white/10 mx-1" />

            <button
              onClick={onRun}
              className="px-5 py-2 flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-[#0d1117] border border-emerald-500/30 hover:border-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 group"
            >
              <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
              Run
            </button>

            <button
              onClick={onSave}
              disabled={saving}
              className={`px-5 py-2 flex items-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg ${saving ? 'bg-[#161b22] text-zinc-600 border border-white/5 cursor-not-allowed' : 'bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/30 hover:border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.05)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] active:scale-95'}`}
            >
              <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Syncing' : 'Save'}
            </button>
          </>
        )}

        <div className="h-6 w-px bg-white/10 mx-1" />

        {currentUser ? (
          <div className="flex items-center gap-3 ml-2">
            <Link
              to={`/profile/${currentUser.username}`}
              className="w-10 h-10 rounded-[14px] flex items-center justify-center text-xs font-black border-2 border-white/5 hover:border-blue-500/50 transition-all hover:scale-110 active:scale-95 shadow-xl overflow-hidden"
              style={{ backgroundColor: currentUser.avatarColor, color: '#0d1117' }}
              title={`View ${currentUser.username}'s profile`}
            >
              {(currentUser.username || '??').slice(0, 2).toUpperCase()}
            </Link>
            <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 rounded-xl text-red-500/70 hover:text-red-500 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-xl"
          >
            <User className="w-4 h-4" />
            Login
          </Link>
        )}
      </div>

      {/* Mobile Actions */}
      <div className="flex items-center gap-2 xl:hidden">
        {id !== "profile" && (
           <button
            onClick={onRun}
            className="p-3.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-95"
          >
            <Play size={18} className="fill-current" />
          </button>
        )}
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3.5 hover:bg-[#1f242c] rounded-xl text-zinc-400 hover:text-white transition-all bg-[#161b22] border border-white/5 shadow-lg"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 top-16 bg-[#0d1117] z-[150] xl:hidden overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-8 overflow-y-auto h-full custom-scrollbar">
              
              {id !== "profile" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 gap-4"
                >
                   <button
                    onClick={() => { onSave(); setMobileMenuOpen(false); }}
                    disabled={saving}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[28px] font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-xl active:scale-95 ${saving ? 'bg-[#161b22] text-zinc-600 border border-white/5' : 'bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 shadow-blue-500/10'}`}
                  >
                    <Save size={24} className={saving ? 'animate-spin' : ''} /> {saving ? 'Syncing' : 'Save Node'}
                  </button>
                  <button
                    onClick={() => { onFork(); setMobileMenuOpen(false); }}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-[#161b22] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 rounded-[28px] font-black uppercase tracking-widest text-[10px] transition-all duration-300 text-purple-400 active:scale-95"
                  >
                    <GitFork size={24} /> Fork Protocol
                  </button>
                </motion.div>
              )}

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Environment Setup</h3>
                <div className="bg-[#161b22] border border-white/5 rounded-[28px] p-6 space-y-5">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compiler & Timeout</p>
                    <div className="flex flex-col gap-3">
                      <LangSelector current={language} onChange={onLangChange} />
                      <div className="h-px bg-white/5 mx-2" />
                      <ExpiryMenu current={expiry} onChange={onExpiryChange} />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Collaboration Tools</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { copyLink(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 bg-[#161b22] hover:bg-blue-500/5 border border-white/5 hover:border-blue-500/20 rounded-[28px] transition-all group">
                     <Share2 size={24} className="text-blue-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Share Link</span>
                  </button>
                  <button onClick={() => { onEmbed(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 bg-[#161b22] hover:bg-orange-500/5 border border-white/5 hover:border-orange-500/20 rounded-[28px] transition-all">
                     <Code size={24} className="text-orange-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Embed JS</span>
                  </button>
                  <button onClick={() => { onShowUploads(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 bg-[#161b22] hover:bg-blue-500/5 border border-white/5 hover:border-blue-500/20 rounded-[28px] transition-all">
                     <div className="relative">
                      <ImageIcon size={24} className="text-blue-500" />
                      {uploadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-[#161b22]" />}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Assets</span>
                  </button>
                  {currentUser && (
                    <label htmlFor="image-upload-mobile" className="flex flex-col items-center gap-3 p-6 bg-[#161b22] hover:bg-emerald-500/5 border border-white/5 hover:border-emerald-500/20 rounded-[28px] transition-all cursor-pointer">
                      <input type="file" id="image-upload-mobile" className="hidden" onChange={(e) => { handleFileUpload(e); setMobileMenuOpen(false); }} />
                      <Upload size={24} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                    </label>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pt-8 border-t border-white/5"
              >
                {currentUser ? (
                  <div className="flex flex-col gap-4">
                    <Link 
                      to={`/profile/${currentUser.username}`} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-5 p-5 bg-[#161b22] border border-white/5 rounded-[28px] hover:bg-[#1f242c] transition-all"
                    >
                      <div className="w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-[#0d1117] shadow-xl" style={{ backgroundColor: currentUser.avatarColor }}>
                        {(currentUser.username || '??').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight">{currentUser.username}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Member Profile</span>
                      </div>
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="w-full p-5 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-[28px] font-black uppercase tracking-widest text-xs transition-all border border-red-500/10 flex items-center justify-center gap-3"
                    >
                      <LogOut size={18} /> Logout Session
                    </button>
                  </div>
                ) : (
                   <Link 
                    to="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full p-6 bg-white text-black rounded-[30px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
                  >
                    <User size={20} /> Authorize Identity
                  </Link>
                )}
                
                <div className="mt-8 text-center pb-8">
                   <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em]">SnippetX © 2026 Protocol Access</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
