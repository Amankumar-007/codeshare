import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Code, ExternalLink, User as UserIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username || username === 'undefined') return;
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/users/${username}`);
        setProfile(data.user);
        setSnippets(data.snippets);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div className="h-screen bg-[#0d1117] flex items-center justify-center text-white font-mono animate-pulse">Loading Profile...</div>;
  if (!profile) return <div className="h-screen bg-[#0d1117] flex items-center justify-center text-white font-mono">User not found</div>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar id="profile" users={[]} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-gray-800"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold mb-2">@{profile.username}</h1>
            <p className="text-gray-400 mb-4 max-w-lg">{profile.bio || "No bio yet."}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Code className="w-3 h-3" /> {snippets.length} Snippets</span>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            Recent Snippets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.length > 0 ? snippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                whileHover={{ y: -5 }}
                className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    {snippet.language}
                  </span>
                  <Link to={`/${snippet.id}`} className="text-gray-500 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  {snippet.title || "Untitled Snippet"}
                </h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-mono">
                  {snippet.content.slice(0, 100) || "Empty snippet..."}
                </p>
                <Link
                  to={`/${snippet.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  View Code <span className="text-lg">→</span>
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-600 font-mono">
                This user has no public snippets yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
