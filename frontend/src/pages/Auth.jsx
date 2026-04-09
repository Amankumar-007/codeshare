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
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, formData);
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
    <div ref={containerRef} className="min-h-screen w-full bg-[#09090B] flex items-center justify-center p-4 md:p-10 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="auth-card w-full max-w-[1100px] grid lg:grid-cols-2 bg-[#18181B] border border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] relative z-10">

        {/* Visual Pane */}
        <div className={`hidden lg:flex flex-col justify-between p-16 relative overflow-hidden transition-all duration-700 ${isLogin ? 'order-1 border-r' : 'order-2 border-l'} border-white/5 bg-[#0E0E11]`}>
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-3xl font-bold text-white mb-16" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
              SnIPPETX
            </Link>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-visual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">
                    Secure access to your <span className="text-emerald-500">Workspace</span>.
                  </h2>
                  <p className="text-zinc-500 text-lg font-medium leading-relaxed">Your scripts, your team, all in one high-performance environment.</p>

                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-1.5 rounded-full bg-emerald-500/10" />
                    ))}
                    <div className="w-12 h-1.5 rounded-full bg-emerald-500/40" />
                  </div>

                  <div className="float-element bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 font-mono text-sm mt-12 shadow-2xl">
                    <div className="flex gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                    </div>
                    <div className="space-y-3 text-zinc-400">
                      <div className="flex gap-3"><span className="text-emerald-500 font-bold">➜</span> <span>codeshare login --user "aman"</span></div>
                      <div className="text-zinc-600 animate-pulse">Authenticating with SnIPPETX cloud...</div>
                      <div className="flex gap-3 text-emerald-400 font-bold"><CheckCircle2 size={18} className="shrink-0" /> <span>Session granted.</span></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-visual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">
                    Start coding with the <span className="text-blue-500">World</span>.
                  </h2>
                  <p className="text-zinc-500 text-lg font-medium leading-relaxed">Join 10,000+ developers sharing and collaborating on code globally.</p>

                  <div className="flex flex-col gap-4 mt-10">
                    <button className="flex items-center gap-4 bg-white hover:bg-zinc-100 text-black px-10 py-5 rounded-[24px] font-black transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/5 group w-fit">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Get started with Google</span>
                    </button>
                  </div>

                  <div className="float-element grid grid-cols-2 gap-5 mt-12">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[32px] flex flex-col gap-4 hover:bg-emerald-500/10 transition-all cursor-default group">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><Users size={24} /></div>
                      <div className="font-black text-white">Live Pairs</div>
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Collaborative</div>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[32px] flex flex-col gap-4 hover:bg-blue-500/10 transition-all cursor-default group">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Sparkles size={24} /></div>
                      <div className="font-black text-white">Pro Tools</div>
                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Native Cloud</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
            <Globe size={14} /> <span>Trusted by developers worldwide</span>
          </div>

          <div className="absolute right-[-20%] bottom-[-20%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Form Pane */}
        <div className={`p-8 md:p-20 flex flex-col transition-all duration-700 ${isLogin ? 'order-2' : 'order-1'} bg-[#18181B] relative`}>
          
          <div className="max-w-md mx-auto w-full my-auto">
            <div className="lg:hidden mb-12 flex justify-center">
              <Link to="/" className="text-2xl font-black text-white" style={{ fontFamily: "'Comfortaa', sans-serif", letterSpacing: '-0.03em' }}>
                SnIPPETX
              </Link>
            </div>

            <div className="stagger-item flex bg-black/40 p-1.5 rounded-[24px] border border-white/5 mb-10 w-full shadow-inner">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/20' : 'text-zinc-500 hover:text-emerald-400'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/20' : 'text-zinc-500 hover:text-emerald-400'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="stagger-item mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black text-white mb-3 tracking-tighter leading-none">
                {isLogin ? 'Welcome Back' : 'Join the Hub'}
              </h1>
              <p className="text-zinc-500 text-sm font-medium">
                {isLogin ? 'Securely access your development environment.' : 'Start sharing code with the global community.'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-5 bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse outline outline-4 outline-red-500/20" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="stagger-item space-y-2.5"
                  >
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        required={!isLogin}
                        className="w-full bg-[#0E0E11] border border-white/5 rounded-[22px] py-5 pl-14 pr-6 outline-none focus:border-emerald-500/30 focus:ring-[6px] focus:ring-emerald-500/5 transition-all text-white text-sm font-medium placeholder:text-zinc-700 shadow-inner"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="stagger-item space-y-2.5">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type="email"
                    className="w-full bg-[#0E0E11] border border-white/5 rounded-[22px] py-5 pl-14 pr-6 outline-none focus:border-emerald-500/30 focus:ring-[6px] focus:ring-emerald-500/5 transition-all text-white text-sm font-medium placeholder:text-zinc-700 shadow-inner"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="stagger-item space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Password</label>
                  {isLogin && <button type="button" className="text-[10px] text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest transition-colors">Recover</button>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    required
                    type="password"
                    className="w-full bg-[#0E0E11] border border-white/5 rounded-[22px] py-5 pl-14 pr-6 outline-none focus:border-emerald-500/30 focus:ring-[6px] focus:ring-emerald-500/5 transition-all text-white text-sm font-medium placeholder:text-zinc-700 shadow-inner"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="stagger-item pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-5 rounded-[24px] font-black flex items-center justify-center gap-3 group transition-all active:scale-[0.98] shadow-2xl shadow-emerald-500/20"
                >
                  <span className="uppercase tracking-widest text-xs">{loading ? 'Processing...' : (isLogin ? 'Authorize Session' : 'Create Identity')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            <div className="stagger-item mt-10 text-center">
               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-loose">
                  By continuing, you agree to our <br/>
                  <span className="text-zinc-400 hover:text-white cursor-pointer underline underline-offset-4">Terms of Service</span> and <span className="text-zinc-400 hover:text-white cursor-pointer underline underline-offset-4">Privacy Policy</span>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}