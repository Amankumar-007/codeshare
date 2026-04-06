import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Snippet from './pages/Snippet';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Embed from './pages/Embed';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/embed/:id" element={<Embed />} />
          <Route path="/@:username" element={<Profile />} />
          <Route path="/:id" element={<Snippet />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
