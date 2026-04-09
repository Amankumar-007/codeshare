import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, Code, Calendar, ChevronRight, Loader2, Zap } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SectionModal({ isOpen, onClose, user }) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchSnippets();
    }
  }, [isOpen, user]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${user.username}`);
      setSnippets(data.snippets || []);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/snippets`, {
        author: user.id || user._id,
        title: 'New Snippet'
      });
      navigate(`/${data.id}`);
      onClose();
    } catch (err) {
      console.error('Error creating snippet:', err);
    }
  };

  const filteredSnippets = snippets.filter(s => 
    (s.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-[#161b22]/80 border border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Zap size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Your Workspaces</h2>
                  <p className="text-zinc-500 text-sm">Select an existing session or start fresh</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="px-8 py-4 bg-zinc-900/30 border-b border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-zinc-300 outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>
              
              <button 
                onClick={handleCreateNew}
                className="w-full md:w-auto bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5 active:scale-95"
              >
                <Plus size={18} /> New Workspace
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                  <p className="text-zinc-500 font-medium animate-pulse">Loading your work...</p>
                </div>
              ) : filteredSnippets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNew}
                    className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group h-40"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                      <Plus size={24} />
                    </div>
                    <span className="text-sm font-bold text-zinc-400 group-hover:text-emerald-400">Start Blank Session</span>
                  </motion.div>

                  {filteredSnippets.map((snippet, idx) => (
                    <motion.div
                      layout
                      key={snippet.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate(`/${snippet.id}`);
                        onClose();
                      }}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/30 hover:bg-zinc-800/80 transition-all group flex flex-col justify-between h-40 shadow-lg hover:shadow-emerald-500/5"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <Code size={16} />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{snippet.language || 'text'}</span>
                        </div>
                        <h3 className="font-bold text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">{snippet.title || 'Untitled Snippet'}</h3>
                        <p className="text-xs text-zinc-500 font-mono mt-1">/{snippet.id}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 mt-auto">
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <Calendar size={12} />
                          <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                        </div>
                        <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mb-6 border border-zinc-800">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No workspaces found</h3>
                  <p className="text-zinc-500 text-sm mb-8">
                    {searchQuery ? `We couldn't find any results for "${searchQuery}"` : "You haven't created any workspaces yet. Start with a new one!"}
                  </p>
                  <button 
                    onClick={handleCreateNew}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    Create Your First Session
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">DEV-SYNC v2.0 • ALL DATA ENCRYPTED</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
