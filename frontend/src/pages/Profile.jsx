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
        // Initialize edit form
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

      // Update localStorage if current user changed
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
      <span className="font-mono text-sm uppercase tracking-[0.2em] animate-pulse text-zinc-500 z-10">Compiling Environment...</span>
    </div>
  );

  if (!profile) return (
    <div className="h-screen bg-[#09090B] flex flex-col items-center justify-center gap-6 text-white text-center p-6">
      <AlertTriangle size={48} className="text-red-500 mb-4 opacity-80" />
      <h1 className="text-3xl font-bold tracking-tight">404: Null Reference</h1>
      <p className="text-zinc-500 text-sm max-w-xs mx-auto">This developer environment does not exist or has been decommissioned.</p>
      <Link to="/" className="mt-4 bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors">Return to Base</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-emerald-500/30 pb-32 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none blur-3xl"></div>

      <Navbar id="profile" users={[]} />

      <main className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 px-4 md:px-8 mt-12 relative z-10">

        {/* Left Column: Sticky Profile Sidebar */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-8 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#121214] border border-white/5 rounded-[32px] p-8 relative overflow-hidden shadow-2xl group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="relative mb-8">
                <div
                  className="w-32 h-32 rounded-[28px] flex items-center justify-center text-5xl font-black shadow-xl relative z-10 border-4 border-[#09090B]"
                  style={{ backgroundColor: profile.avatarColor || '#10B981', color: '#09090B' }}
                >
                  {profile.username.slice(0, 2).toUpperCase()}
                </div>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-2 z-30">
                    {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'].map(color => (
                      <button
                        key={color}
                        onClick={() => setEditForm({ ...editForm, avatarColor: color })}
                        className={`w-6 h-6 rounded-full border-2 ${editForm.avatarColor === color ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-2 left-28 w-5 h-5 bg-emerald-500 border-4 border-[#121214] rounded-full z-20"></div>
              </div>

              {isEditing ? (
                <div className="space-y-4 relative z-10">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Username</label>
                    <input
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-colors"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Bio</label>
                    <textarea
                      className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-colors h-24 resize-none"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2 relative z-10 flex items-center gap-3">
                    {profile.username}
                    <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-400">PRO</span>
                  </h1>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-8 relative z-10">
                    {profile.bio || "Full-stack architect building real-time collaboration tools."}
                  </p>
                </>
              )}

              <div className="space-y-4 relative z-10 border-t border-white/5 pt-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Location</label>
                        <input
                          className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-colors"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Website</label>
                        <input
                          className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-colors"
                          value={editForm.website}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Skills (comma separated)</label>
                      <input
                        className="w-full bg-[#09090B] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none transition-colors"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                        placeholder="React, Node.js, TypeScript"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                      <MapPin size={16} className="text-zinc-600" /> {profile.location || 'Remote'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                      <Calendar size={16} className="text-zinc-600" /> Joined {new Date(profile.createdAt).getFullYear()}
                    </div>
                    {profile.website && (
                      <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                        <Globe size={16} className="text-zinc-600" /> <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">{profile.website.replace(/(^\w+:|^)\/\//, '')}</a>
                      </div>
                    )}
                    {isOwner && (
                      <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium pt-2 border-t border-white/5 opacity-60">
                        <UserIcon size={14} className="text-zinc-700" /> {profile.email}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8 relative z-10">
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"><Globe size={18} /></button>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"><Share2 size={18} /></button>
              </div>

              {isOwner && (
                <div className="mt-6 flex gap-3 relative z-10">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#09090B] py-3.5 rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center"
                      >
                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Save Setup'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#09090B] py-3.5 rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-[#121214] border border-white/5 rounded-[32px] p-8"
            >
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Workspaces</p>
                  <p className="text-4xl font-black text-white">{snippets.length}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Activity size={24} />
                </div>
              </div>

              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Cpu size={14} /> Dev Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills && profile.skills.length > 0 ? profile.skills : ['TypeScript', 'React', 'Node.js']).map((tech) => (
                    <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs font-mono text-zinc-300 hover:bg-white/10 transition-colors cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Scrollable Workspaces */}
        <div className="flex-1 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#121214] border border-white/5 rounded-[24px] p-4 px-6 flex items-center justify-between sticky top-8 z-20 backdrop-blur-xl bg-[#121214]/80 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold">
                {isOwner ? 'My Repositories' : 'Public Buffers'}
              </h2>
            </div>
            {isOwner && (
              <Link to="/" className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors tracking-wide">
                + New Buffer
              </Link>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {snippets.length > 0 ? snippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="bg-[#121214] border border-white/5 rounded-[32px] p-6 flex flex-col group hover:border-emerald-500/40 hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.15)] transition-all h-[320px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none"></div>

                  <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#09090B] border border-white/10 rounded-lg shadow-inner">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                        {snippet.language}
                      </span>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => { setEditingId(snippet.id); setNewTitle(snippet.title); }}
                            className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingId(snippet.id)}
                            className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-colors backdrop-blur-sm border border-transparent"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-5 relative z-10">
                    {editingId === snippet.id ? (
                      <div className="flex items-center gap-2 bg-[#09090B] py-1 px-3 rounded-xl border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <input
                          autoFocus
                          className="bg-transparent border-none outline-none text-sm font-bold flex-1 text-white placeholder-zinc-600"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(snippet.id)}
                        />
                        <button onClick={() => handleRename(snippet.id)} className="text-emerald-500 p-1 hover:scale-110 transition-transform"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="text-zinc-500 p-1 hover:scale-110 transition-transform"><X size={16} /></button>
                      </div>
                    ) : (
                      <Link to={`/${snippet.id}`} className="text-xl font-bold tracking-tight hover:text-emerald-400 transition-colors line-clamp-1">
                        {snippet.title || "Untitled Buffer"}
                      </Link>
                    )}
                  </div>

                  <div className="flex-1 bg-[#09090B] border border-white/5 rounded-2xl p-4 relative overflow-hidden group-hover:border-white/10 transition-colors shadow-inner">
                    <div className="flex gap-1.5 mb-3 opacity-50">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <p className="text-zinc-400 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words line-clamp-4 relative z-10">
                      {snippet.content ? snippet.content.split('\n').map((line, i) => (
                        <span key={i} className="block">
                          <span className="text-zinc-700 mr-3 select-none">{i + 1}</span>
                          {line}
                        </span>
                      )) : <span className="italic text-zinc-600">No content available...</span>}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#09090B] to-transparent z-20"></div>
                  </div>

                  <div className="flex items-center justify-between mt-5 relative z-10">
                    <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <GitBranch size={12} />
                      <span>{snippet.id.substring(0, 8)}</span>
                    </div>
                    <Link
                      to={`/${snippet.id}`}
                      className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-[#09090B] transition-colors border border-emerald-500/20 group-hover:border-emerald-500/50"
                    >
                      <ExternalLink size={16} strokeWidth={2.5} />
                    </Link>
                  </div>
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="md:col-span-2 bg-[#121214] border border-dashed border-white/10 rounded-[32px] p-16 flex flex-col items-center justify-center text-center h-[400px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Terminal size={300} />
                  </div>
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-zinc-500 mb-6 relative z-10">
                    <Code2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 relative z-10 tracking-tight">No Active Buffers</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8 relative z-10">
                    This sector is empty. Initialize a new coding session to populate this repository.
                  </p>
                  {isOwner && (
                    <Link to="/" className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors relative z-10 shadow-xl">
                      Initialize Workspace
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-[#09090B]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[32px] p-8 shadow-2xl text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]"></div>

              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Erase Repository?</h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Permanent deletion of buffer <span className="text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">/{deletingId.substring(0, 6)}</span>. This logic cannot be recovered.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors text-sm border border-white/5"
                >
                  Abort
                </button>
                <button
                  onClick={() => handleDelete(deletingId)} disabled={isUpdating}
                  className="px-4 py-3.5 bg-red-500 hover:bg-red-400 text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Deletion'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}