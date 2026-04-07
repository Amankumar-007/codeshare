import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, ArrowRight, Globe, CheckCircle2, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    // Entrance animations for the main bento container
    gsap.from('.auth-card', {
      scale: 0.98,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out'
    });

    gsap.from('.stagger-item', {
      y: 15,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: 'power4.out',
      delay: 0.4
    });

    // Subtle floating effect for the visual pane elements
    gsap.to('.float-element', {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.5
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#09090B] flex items-center justify-center p-4 md:p-6 font-sans selection:bg-emerald-500/30 overflow-hidden fixed inset-0">
      {/* Decorative Background Glows - Clipped by parent */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="auth-card w-full max-w-[1100px] max-h-[min(95vh,800px)] grid lg:grid-cols-2 bg-[#18181B] border border-zinc-800 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-700">

        {/* Visual Pane (Changes side based on state for "little different" feel) */}
        <div className={`hidden lg:flex flex-col justify-between p-12 relative overflow-hidden transition-all duration-700 ${isLogin ? 'order-1 border-r' : 'order-2 border-l'} border-zinc-800 bg-[#121214]`}>
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-12" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
              SnIPPETX
            </Link>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-visual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-white leading-tight">
                    Secure access to your <span className="text-emerald-500">Workspace</span>.
                  </h2>
                  <p className="text-zinc-400 text-lg">Your scripts, your team, all in one high-performance environment.</p>

                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-1 rounded-full bg-emerald-500/20" />
                    ))}
                    <div className="w-12 h-1 rounded-full bg-emerald-500/50" />
                  </div>

                  {/* Simulated Terminal for Login Visual */}
                  <div className="float-element bg-[#09090B] border border-zinc-800 rounded-2xl p-6 font-mono text-sm mt-10 shadow-xl overflow-hidden group">
                    <div className="flex gap-1.5 mb-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
                    </div>
                    <div className="space-y-2 text-zinc-300">
                      <div className="flex gap-2"><span className="text-emerald-500">➜</span> <span>codeshare login --user "aman"</span></div>
                      <div className="text-zinc-500 animate-pulse">Authenticating with SnIPPETX cloud...</div>
                      <div className="flex gap-2 text-emerald-400 font-bold"><CheckCircle2 size={16} className="mt-0.5" /> <span>Session granted. Redirecting to workspace.</span></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-visual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-bold text-white leading-tight">
                    Start coding with the <span className="text-blue-500">World</span>.
                  </h2>
                  <p className="text-zinc-400 text-lg">Join 10,000+ developers sharing and collaborating on code globally.</p>

                  <div className="flex flex-col gap-4 mt-8">
                    <button className="flex items-center gap-3 bg-white hover:bg-zinc-100 text-black px-8 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5 group w-fit">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Get started with Google</span>
                    </button>
                  </div>

                  {/* Collaboration Visual for Signup */}
                  <div className="float-element grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-4 hover:bg-emerald-500/10 transition-colors cursor-default">
                      <Users className="text-emerald-500" size={32} />
                      <div className="font-bold text-white">Live Pairs</div>
                      <div className="text-xs text-zinc-500">Unrestricted collaborative sessions.</div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex flex-col gap-4 hover:bg-blue-500/10 transition-colors cursor-default">
                      <Sparkles className="text-blue-500" size={32} />
                      <div className="font-bold text-white">Pro Tools</div>
                      <div className="text-xs text-zinc-500">LSP and cloud execution.</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-zinc-500 text-sm">
            <Globe size={16} /> <span>Trusted by developers worldwide</span>
          </div>

          {/* Background decorative element */}
          <div className="absolute right-[-20%] bottom-[-20%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Form Pane - Removed justify-center, added overflow-y-auto to fix clipping */}
        <div className={`p-8 md:p-16 flex flex-col overflow-y-auto transition-all duration-700 ${isLogin ? 'order-2' : 'order-1'} bg-[#18181B]`}>

          {/* Added my-auto so it naturally centers itself vertically ONLY when there is safe space */}
          <div className="max-w-md mx-auto w-full my-auto">

            <div className="lg:hidden mb-12">
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
                SnIPPETX
              </Link>
            </div>

            {/* Dual State Toggle */}
            <div className="stagger-item flex bg-[#09090B] p-1.5 rounded-2xl border border-zinc-800 mb-10 w-full">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isLogin ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-emerald-400'}`}
              >
                <Lock size={16} /> Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isLogin ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-emerald-400'}`}
              >
                <User size={16} /> Create Account
              </button>
            </div>

            <div className="stagger-item mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-zinc-400 text-sm">
                {isLogin ? 'Please enter your details to sign in.' : 'Fill in the information below to get started.'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="stagger-item"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          required={!isLogin}
                          className="w-full bg-[#09090B] border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-white text-sm"
                          placeholder="johndoe"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="stagger-item space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type="email"
                    className="w-full bg-[#09090B] border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-white text-sm"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="stagger-item space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                  {isLogin && <button type="button" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">Forgot?</button>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type="password"
                    className="w-full bg-[#09090B] border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-white text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* FIX: The button is separated into a div wrapper for the GSAP stagger. */}
              {/* This stops GSAP from conflicting with Tailwind's "transition-all" class */}
              <div className="stagger-item mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {isLogin && (
              <div className="stagger-item mt-6 pt-6 border-t border-zinc-800/50 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-600"><span className="bg-[#18181B] px-3">Quick Connect</span></div>
                </div>

                <div className="flex justify-center">
                  <button className="flex items-center gap-3 bg-white hover:bg-zinc-100 text-black px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5 group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}