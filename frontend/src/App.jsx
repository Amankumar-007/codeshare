import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Snippet = lazy(() => import('./pages/Snippet'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Embed = lazy(() => import('./pages/Embed'));

const Loading = () => (
  <div className="h-screen bg-[#0d1117] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/embed/:id" element={<Embed />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/:id" element={<Snippet />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
