import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Terminal, Copy, Play, Users, GitFork, Share2, Code2, CheckCircle2, Menu, X } from 'lucide-react';
import SectionModal from '../components/SectionModal';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CodeShareBento() {
  const containerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const handleStartSession = async () => {
    if (currentUser) {
      setIsModalOpen(true);
    } else {
      try {
        const { data } = await axios.post(`${API_BASE}/snippets`, {
          title: 'Guest Session'
        });
        navigate(`/${data.id}`);
      } catch (err) {
        console.error('Error creating guest session:', err);
      }
    }
  };

  useGSAP(() => {
    gsap.from('.bento-item', {
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    });

    const codeLines = gsap.utils.toArray('.code-line');
    gsap.set(codeLines, { opacity: 0, x: -10 });

    gsap.to(codeLines, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      stagger: 0.15,
      ease: 'power1.out',
      delay: 1,
    });

    gsap.to('.live-cursor', {
      y: -5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.5
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#09090B] text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30 overflow-x-hidden">

      {/* Navbar */}
      <nav className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto bento-item relative z-[100]">
        <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
          SnIPPETX
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-emerald-400 transition-colors">Snippets</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Workspaces</a>
          {currentUser && (
            <Link to={`/profile/${currentUser.username}`} className="hover:text-emerald-400 transition-colors">Profile</Link>
          )}
          <a href="#" className="hover:text-emerald-400 transition-colors">Docs</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <Link
                  to={`/profile/${currentUser.username}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border border-zinc-800 hover:border-emerald-500 transition-all hover:scale-105 shadow-lg shadow-emerald-500/10"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {(currentUser.username || '??').slice(0, 2).toUpperCase()}
                </Link>
                <button
                  onClick={handleStartSession}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                >
                  New Workspace
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm font-medium text-zinc-300 hover:text-white"
                >
                  Log in
                </button>
                <button
                  onClick={handleStartSession}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                >
                  New Workspace
                </button>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-zinc-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:hidden shadow-2xl flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-4 text-sm font-medium text-zinc-400">
              <a href="#" className="hover:text-emerald-400">Snippets</a>
              <a href="#" className="hover:text-emerald-400">Workspaces</a>
              {currentUser && (
                <Link to={`/profile/${currentUser.username}`} className="hover:text-emerald-400">Profile</Link>
              )}
              <a href="#" className="hover:text-emerald-400">Docs</a>
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="flex flex-col gap-3">
              {currentUser ? (
                <button
                  onClick={() => { handleStartSession(); setMobileMenuOpen(false); }}
                  className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <Play size={18} /> New Workspace
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-bold"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { handleStartSession(); setMobileMenuOpen(false); }}
                    className="w-full bg-white text-black py-4 rounded-2xl font-bold"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Bento Grid */}
      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">

        {/* Top Hero Section (Simulated IDE) - spans 11 cols */}
        <div className="bento-item lg:col-span-11 bg-[#18181B] border border-zinc-800 rounded-[32px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">

          {/* Hero Text Area */}
          <div className="p-8 md:p-12 lg:w-5/12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-800 relative z-10 bg-[#18181B]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Multiplayer enabled
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white leading-tight">
              Share code.<br />
              <span className="text-zinc-500">In real-time.</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base mb-8">
              A high-performance environment for technical interviews, pair programming, and rapid prototyping.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleStartSession}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-emerald-500/10"
              >
                <Play size={18} /> Start Session
              </button>
            </div>
          </div>

          {/* Simulated Code Editor Area */}
          <div className="lg:w-7/12 bg-[#0E0E11] p-6 lg:p-8 relative font-mono text-[10px] md:text-sm overflow-hidden min-h-[300px]">
            {/* Window Controls */}
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-4 text-xs text-zinc-600">server.js</span>
            </div>

            {/* Code Content */}
            <div className="space-y-1 relative">
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">1</span><span className="text-blue-400">import</span> <span className="text-zinc-300">&#123; createServer &#125;</span> <span className="text-blue-400">from</span> <span className="text-emerald-400">'http'</span>;</div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">2</span><span className="text-blue-400">import</span> <span className="text-zinc-300">&#123; Server &#125;</span> <span className="text-blue-400">from</span> <span className="text-emerald-400">'socket.io'</span>;</div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">3</span></div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">4</span><span className="text-violet-400">const</span> <span className="text-zinc-300">httpServer =</span> <span className="text-blue-300">createServer</span><span className="text-zinc-300">();</span></div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">5</span><span className="text-violet-400">const</span> <span className="text-zinc-300">io =</span> <span className="text-blue-400">new</span> <span className="text-blue-300">Server</span><span className="text-zinc-300">(httpServer, &#123;</span></div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">6</span>&nbsp;&nbsp;<span className="text-zinc-300">cors: &#123; origin:</span> <span className="text-emerald-400">'*'</span> <span className="text-zinc-300">&#125;</span></div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">7</span><span className="text-zinc-300">&#125;);</span></div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">8</span></div>
              <div className="code-line flex"><span className="w-8 text-zinc-700 select-none">9</span><span className="text-zinc-300">io.</span><span className="text-blue-300">on</span><span className="text-zinc-300">(</span><span className="text-emerald-400">'connection'</span><span className="text-zinc-300">, (socket) </span><span className="text-blue-400">=&gt;</span> <span className="text-zinc-300">&#123;</span></div>
              <div className="code-line flex hidden md:flex"><span className="w-8 text-zinc-700 select-none">10</span>&nbsp;&nbsp;<span className="text-zinc-300">socket.</span><span className="text-blue-300">join</span><span className="text-zinc-300">(</span><span className="text-emerald-400">'workspace-01'</span><span className="text-zinc-300">);</span></div>
              <div className="code-line flex hidden md:flex"><span className="w-8 text-zinc-700 select-none">11</span><span className="text-zinc-300">&#125;);</span></div>

              {/* Fake Live Cursor 1 */}
              <div className="live-cursor absolute top-[60px] md:top-[100px] left-[120px] md:left-[180px] w-0.5 h-4 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-20">
                <div className="absolute top-0 left-0 -mt-5 -ml-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-bold shadow-lg">Alex</div>
              </div>
              {/* Fake Live Cursor 2 */}
              <div className="live-cursor absolute top-[140px] md:top-[210px] left-[160px] md:left-[240px] w-0.5 h-4 bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)] z-20" style={{ animationDelay: '0.5s' }}>
                <div className="absolute top-0 left-0 -mt-5 -ml-1 bg-fuchsia-500 text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-bold shadow-lg">Sarah</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical CTA Button - spans 1 col */}
        <div
          onClick={handleStartSession}
          className="bento-item hidden lg:flex lg:col-span-1 bg-zinc-800 border border-zinc-700 rounded-[32px] flex-col items-center justify-between py-10 cursor-pointer hover:bg-emerald-500 hover:border-emerald-400 transition-colors group active:scale-95"
        >
          <Code2 size={24} className="text-zinc-400 group-hover:text-black transition-colors" />
          <span className="text-zinc-400 group-hover:text-black font-bold tracking-widest uppercase text-sm transition-colors" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            New Snippet
          </span>
        </div>

        {/* Middle Left: Languages - spans 5 cols */}
        <div className="bento-item lg:col-span-5 bg-[#18181B] border border-zinc-800 rounded-[32px] p-8 md:p-10 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Terminal size={20} className="text-blue-400" /> Environment Support
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Full LSP features, auto-complete, and native execution for 40+ environments.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {['React', 'Node.js', 'Python', 'Rust', 'Go', 'C++', 'Java', 'Ruby'].map((lang, i) => (
              <div key={i} className="bg-[#0E0E11] border border-zinc-800 rounded-2xl py-4 flex items-center justify-center text-xs font-mono font-bold text-zinc-500 hover:border-emerald-500/50 hover:text-white cursor-pointer transition-all">
                {lang}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Right: Collaboration - spans 7 cols */}
        <div className="bento-item lg:col-span-7 bg-white text-black rounded-[32px] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[350px]">
          <div className="relative z-10">
            <span className="bg-black text-white rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
              Live Presence
            </span>
            <p className="text-2xl md:text-4xl font-black mt-8 md:mt-10 max-w-md leading-[1.1] tracking-tighter">
              See exactly who is typing, <span className="text-emerald-600">where they are typing.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-12 gap-6 relative z-10">
            <div className="bg-zinc-100 px-5 py-3 rounded-2xl flex items-center gap-4 font-mono text-xs border border-zinc-200/50 w-full sm:w-auto overflow-hidden">
              <span className="text-zinc-400 shrink-0">Link:</span>
              <span className="font-bold truncate">snippetx.co/w/ab89-xyz</span>
              <button className="bg-white p-2 rounded-xl shadow-md hover:scale-105 transition-transform shrink-0"><Copy size={14} /></button>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center font-black text-blue-600 text-xs z-30 shadow-lg">AL</div>
                <div className="w-12 h-12 rounded-full border-4 border-white bg-fuchsia-100 flex items-center justify-center font-black text-fuchsia-600 text-xs z-20 shadow-lg">SR</div>
                <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-xs z-10 shadow-lg">+3</div>
              </div>
            </div>
          </div>

          <div className="absolute right-[-10%] top-[-10%] w-[350px] h-[350px] bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        </div>

        {/* Bottom Left: Terminal/Stats - spans 5 cols */}
        <div className="bento-item lg:col-span-5 bg-emerald-500 text-black rounded-[32px] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} />
            <span className="font-black text-xs uppercase tracking-widest">Zero Configuration</span>
          </div>
          <div className="mt-12">
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none">Ready to run.</h3>
            <p className="text-sm font-bold opacity-70 max-w-[280px] leading-relaxed">
              No local setup required. Instantly spin up containers to execute your code safely in the cloud.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-black/10 rounded-[40px] rotate-12 flex flex-col p-6">
            <div className="w-12 h-2.5 bg-black/20 rounded-full mb-3"></div>
            <div className="w-32 h-2.5 bg-black/20 rounded-full mb-3"></div>
            <div className="w-20 h-2.5 bg-black/20 rounded-full"></div>
          </div>
        </div>

        {/* Bottom Right: Activity Feed - spans 7 cols */}
        <div className="bento-item lg:col-span-7 flex flex-col gap-4">

          <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 md:p-6 flex items-center justify-between hover:border-zinc-600 transition-all cursor-pointer group active:scale-[0.98]">
            <div className="flex items-center gap-5">
              <div className="bg-blue-500/10 text-blue-400 p-3 rounded-2xl"><GitFork size={20} /></div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">Forked "Auth Middleware"</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest opacity-60">backend-utils</p>
              </div>
            </div>
            <span className="text-zinc-600 text-[10px] md:text-xs font-mono font-bold shrink-0">2m ago</span>
          </div>

          <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 md:p-6 flex items-center justify-between hover:border-zinc-600 transition-all cursor-pointer group active:scale-[0.98]">
            <div className="flex items-center gap-5">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl"><Users size={20} /></div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">Joined "Tech Interview #12"</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest opacity-60">3 active participants</p>
              </div>
            </div>
            <span className="text-zinc-600 text-[10px] md:text-xs font-mono font-bold shrink-0">15m ago</span>
          </div>

          <div className="bg-[#18181B] border border-zinc-800 rounded-3xl p-5 md:p-6 flex items-center justify-between hover:border-zinc-600 transition-all cursor-pointer group active:scale-[0.98]">
            <div className="flex items-center gap-5">
              <div className="bg-violet-500/10 text-violet-400 p-3 rounded-2xl"><Share2 size={20} /></div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold text-white group-hover:text-violet-400 transition-colors truncate">Published "React setup"</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest opacity-60">Public Snippet</p>
              </div>
            </div>
            <span className="text-zinc-600 text-[10px] md:text-xs font-mono font-bold shrink-0">1h ago</span>
          </div>

        </div>

      </main>

      <SectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
      />
      
      <footer className="max-w-[1400px] mx-auto py-12 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="text-zinc-600 text-xs font-bold uppercase tracking-widest">© 2026 SnippetX Inc.</div>
        <div className="flex gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest transition-colors">
          <a href="#" className="hover:text-white">Status</a>
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">GitHub</a>
          <a href="#" className="hover:text-white">Privacy</a>
        </div>
      </footer>
    </div>
  );
}