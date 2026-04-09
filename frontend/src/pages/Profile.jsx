import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, Code2, ExternalLink, User as UserIcon, Trash2, Edit2,
  Check, X, Loader2, AlertTriangle, Terminal, GitBranch, MapPin,
  Globe, Cpu, Activity, Share2, Box
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Actions State
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    skills: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    avatarColor: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    if (!username || username === 'undefined') return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}/users/${username}`);
        setProfile(data.user);
        setSnippets(data.snippets);
        setEditForm({
          username: data.user.username,
          bio: data.user.bio || '',
          skills: (data.user.skills || []).join(', '),
          location: data.user.location || '',
          website: data.user.website || '',
          github: data.user.github || '',
          twitter: data.user.twitter || '',
          avatarColor: data.user.avatarColor || '#10B981'
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const isOwner = currentUser?.username === profile?.username;

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(`${API_BASE}/users/${username}`, {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(data.user);
      setIsEditing(false);

      if (currentUser.username === profile.username) {
        const updatedUser = { ...currentUser, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        if (data.user.username !== username) {
          navigate(`/profile/${data.user.username}`);
        }
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRename = async (id) => {
    if (!newTitle.trim()) return setEditingId(null);
    try {
      setIsUpdating(true);
      await axios.patch(`${API_BASE}/snippets/${id}`, { title: newTitle });
      setSnippets(snippets.map(s => s.id === id ? { ...s, title: newTitle } : s));
      setEditingId(null);
    } catch (err) {
      console.error('Rename failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsUpdating(true);
      await axios.delete(`${API_BASE}/snippets/${id}`);
      setSnippets(snippets.filter(s => s.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center gap-4 text-emerald-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <Loader2 className="w-10 h-10 animate-spin z-10" />
      <span className="font-mono text-[10px] uppercase font-black tracking-[0.3em] animate-pulse text-zinc-500 z-10">Compiling Profile...</span>
    </div>
  );

  if (!profile) return (
    <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center gap-6 text-white text-center p-6">
      <AlertTriangle size={48} className="text-red-500 mb-4 opacity-80 shadow-[0_0_30px_rgba(239,68,68,0.2)]" />
      <h1 className="text-3xl font-black tracking-tighter uppercase">404: Null Reference</h1>
      <p className="text-zinc-500 text-sm max-w-xs mx-auto font-medium">This developer environment does not exist or has been decommissioned.</p>
      <Link to="/" className="mt-4 bg-white text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">Return to Hub</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-emerald-500/30 pb-20 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none blur-3xl"></div>

      <Navbar id="profile" users={[]} />

      <main className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 px-4 md:px-8 mt-8 md:mt-16 relative z-10">

        {/* Left Column: Sticky Profile Sidebar */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-2xl group border border-white/5"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000 pointer-events-none" />

              <div className="relative mb-10 flex justify-center lg:justify-start">
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[35px] flex items-center justify-center text-4xl md:text-5xl font-black shadow-2xl relative z-10 border-4 border-[#09090B] transform hover:rotate-3 transition-transform duration-500"
                  style={{ backgroundColor: profile.avatarColor || '#10B981', color: '#09090B' }}
                >
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
                {isEditing && (
                  <div className="absolute bottom-0 inset-x-0 flex justify-center gap-2 z-30 bg-[#09090B]/80 backdrop-blur-md py-2 rounded-full border border-white/5 shadow-xl scale-75 md:scale-100">
                    {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'].map(color => (
                      <button
                        key={color}
                        onClick={() => setEditForm({ ...editForm, avatarColor: color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${editForm.avatarColor === color ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Username</label>
                    <input
                      className="w-full bg-[#09090B] border border-white/10 rounded-[20px] px-5 py-4 text-sm font-bold focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Bio</label>
                    <textarea
                      className="w-full bg-[#09090B] border border-white/10 rounded-[20px] px-5 py-4 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all h-32 resize-none shadow-inner"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell the world what you're building..."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3 relative z-10 flex items-center justify-center lg:justify-start gap-3">
                    {profile.username}
                    <span className="px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-500">PRO</span>
                  </h1>

                  <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed mb-10 relative z-10">
                    {profile.bio || "Full-stack architect building real-time collaboration tools."}
                  </p>
                </div>
              )}

              <div className="space-y-4 relative z-10 border-t border-white/5 pt-8">
                {isEditing ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Location</label>
                        <input
                          className="w-full bg-[#09090B] border border-white/10 rounded-[18px] px-5 py-3.5 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Website</label>
                        <input
                          className="w-full bg-[#09090B] border border-white/10 rounded-[18px] px-5 py-3.5 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all"
                          value={editForm.website}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Skills (comma separated)</label>
                      <input
                        className="w-full bg-[#09090B] border border-white/10 rounded-[18px] px-5 py-3.5 text-sm font-mono focus:border-emerald-500/50 outline-none transition-all"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                        placeholder="React, Node.js, C++..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-zinc-400 font-bold group/item">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover/item:text-emerald-500 transition-colors"><MapPin size={14} /></div>
                      <span>{profile.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-zinc-400 font-bold group/item">
                       <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover/item:text-emerald-500 transition-colors"><Calendar size={14} /></div>
                       <span>Joined {new Date(profile.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    {profile.website && (
                      <div className="flex items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-zinc-400 font-bold group/item">
                         <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover/item:text-emerald-500 transition-colors"><Globe size={14} /></div>
                         <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-emerald-500/30">{profile.website.replace(/(^\w+:|^)\/\//, '')}</a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="mt-10 flex flex-col sm:flex-row gap-3 relative z-10 w-full">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#09090B] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                      >
                        {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Apply Sync'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#09090B] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] active:scale-95"
                    >
                      Update Identity
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-dark border border-white/5 rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
            >
               <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5 relative z-10">
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sync Nodes</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{snippets.length}</p>
                </div>
                <div className="w-16 h-16 rounded-[22px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                  <Activity size={28} />
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <Cpu size={14} className="text-emerald-500" /> Technology Stack
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(profile.skills && profile.skills.length > 0 ? profile.skills : ['TypeScript', 'React', 'Node.js', 'Go', 'Rust']).map((tech) => (
                    <span key={tech} className="px-4 py-2 bg-black border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-default shadow-inner">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Scrollable Workspaces */}
        <div className="flex-1 flex flex-col gap-8 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-[28px] p-3 px-6 flex items-center justify-between sticky top-20 z-[40] shadow-2xl border border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner"><Terminal size={20} /></div>
              <h2 className="text-sm md:text-base font-black uppercase tracking-widest">
                {isOwner ? 'Your Repositories' : 'Available Buffers'}
              </h2>
            </div>
            {isOwner && (
              <Link to="/" className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                + New Node
              </Link>
            )}
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {snippets.length > 0 ? snippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                  className="glass-dark border border-white/5 rounded-[40px] p-8 flex flex-col group hover:border-emerald-500/30 hover:shadow-[0_0_60px_-20px_rgba(16,185,129,0.2)] transition-all h-[380px] relative overflow-hidden active:scale-[0.99]"
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-black/40 border border-white/5 rounded-xl shadow-inner group-hover:border-emerald-500/20 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                        {snippet.language}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => { setEditingId(snippet.id); setNewTitle(snippet.title); }}
                            className="p-2.5 bg-black hover:bg-blue-600/10 rounded-xl text-zinc-500 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingId(snippet.id)}
                            className="p-2.5 bg-black hover:bg-red-600/10 rounded-xl text-zinc-500 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-6 relative z-10 px-1">
                    {editingId === snippet.id ? (
                      <div className="flex items-center gap-3 bg-black py-2 px-4 rounded-[20px] border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
                        <input
                          autoFocus
                          className="bg-transparent border-none outline-none text-sm font-black flex-1 text-white uppercase tracking-widest placeholder:text-zinc-800"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(snippet.id)}
                        />
                        <button onClick={() => handleRename(snippet.id)} className="text-emerald-500 p-1 hover:scale-125 transition-transform"><Check size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="text-zinc-600 p-1 hover:scale-125 transition-transform"><X size={18} /></button>
                      </div>
                    ) : (
                      <Link to={`/${snippet.id}`} className="text-xl md:text-2xl font-black tracking-tight text-white hover:text-emerald-400 transition-all line-clamp-1 group-hover:translate-x-1 duration-300 uppercase">
                        {snippet.title || "Unknown Buffer"}
                      </Link>
                    )}
                  </div>

                  <div className="flex-1 bg-black/60 border border-white/5 rounded-[28px] p-6 relative overflow-hidden group-hover:border-white/10 transition-all shadow-inner font-mono text-[11px] leading-relaxed">
                    <div className="flex gap-2 mb-5 opacity-30">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                    </div>
                    <div className="text-zinc-500 space-y-1 relative z-10 transition-colors group-hover:text-zinc-400">
                      {snippet.content ? snippet.content.split('\n').slice(0, 5).map((line, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-zinc-800 select-none font-bold w-4 text-right shrink-0">{i + 1}</span>
                          <span className="truncate">{line || ' '}</span>
                        </div>
                      )) : <p className="italic text-zinc-800 py-2">Buffer currently null state...</p>}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent z-20" />
                  </div>

                  <div className="flex items-center justify-between mt-8 relative z-10 px-1">
                    <div className="flex items-center gap-3 text-zinc-600 font-mono text-[10px] font-black uppercase tracking-[0.2em] bg-black px-4 py-2 rounded-xl border border-white/5">
                      <GitBranch size={12} className="text-zinc-700" />
                      <span>{snippet.id.substring(0, 8)}</span>
                    </div>
                    <Link
                      to={`/${snippet.id}`}
                      className="w-12 h-12 bg-white/5 hover:bg-emerald-500 text-zinc-400 hover:text-black rounded-2xl flex items-center justify-center transition-all border border-white/5 hover:border-emerald-500 active:scale-90 shadow-lg"
                    >
                      <ExternalLink size={18} strokeWidth={3} />
                    </Link>
                  </div>
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="sm:col-span-2 glass-dark border border-dashed border-white/10 rounded-[40px] p-16 flex flex-col items-center justify-center text-center h-[450px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none rotate-12">
                    <Terminal size={400} />
                  </div>
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[35px] flex items-center justify-center text-zinc-700 mb-8 relative z-10 shadow-inner">
                    <Box size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tighter uppercase uppercase">Repository Empty</h3>
                  <p className="text-zinc-600 text-sm max-w-sm mx-auto mb-10 relative z-10 font-medium leading-relaxed">
                    This development sector is currently inactive. Initialize a new sync node to populate this repository.
                  </p>
                  {isOwner && (
                    <Link to="/" className="bg-emerald-500 text-[#09090B] px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all relative z-10 shadow-2xl shadow-emerald-500/20 active:scale-95">
                      Initialize Session
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[45px] p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600 shadow-[0_0_30px_rgba(239,68,68,1)]" />

              <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertTriangle size={42} />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Decommission Buffer?</h3>
              <p className="text-zinc-500 text-sm mb-10 font-medium leading-relaxed">
                Full erasure protocol for buffer <span className="text-red-400 font-mono bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">/{deletingId.substring(0, 8)}</span>. All logic will be permanently purged.
              </p>
              <div className="flex flex-col gap-3">
                 <button
                  onClick={() => handleDelete(deletingId)} disabled={isUpdating}
                  className="w-full py-5 bg-red-500 hover:bg-red-400 text-black rounded-[24px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-500/20 active:scale-95 order-1"
                >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Purge'}
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-[24px] font-black uppercase tracking-widest transition-all border border-white/5 order-2"
                >
                  Abort Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}