import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewAssessment from './pages/NewAssessment';
import PredictionDetail from './pages/PredictionDetail';
import History from './pages/History';
import { fetchHealth } from './api';



function Sidebar() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));

    const interval = setInterval(() => {
      fetchHealth()
        .then(setHealth)
        .catch(() => setHealth(null));
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const online = health?.status === 'ok';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPIIWOOUtyV2-bn0Ts20S1EsbD393OrsmhIfNLoXSPuLv4o3mWNwBl4A7XeKTESJz3oIfVzU7UfmZw2AO4MVN2zWh8KBwHAUp3QWcY_9YdWpsaIiTGHoQIa7E9_EyjyjaetD8dpIBMeB4kChPokRGOG_utF9ro8Q3s5s1PdK4Ui_jxVz6NtrtNxJvt_cOgbB3mn57YZehPePv8BG1SyzRAM2wgFxY-oo7DsdbQ1bhe7mEM2jRSIB3_" 
            alt="Doctor Avatar" 
            className="sidebar-avatar" 
          />
          <div>
            <h1 className="sidebar-title">ReadmitAI</h1>
            <p className="sidebar-subtitle">Clinical Analytics</p>
          </div>
        </div>
        <button className="sidebar-btn-generate">
          Generate Report
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="material-symbols-outlined nav-icon" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          Dashboard
        </NavLink>
        <NavLink to="/assess" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">add_chart</span>
          New Assessment
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">history</span>
          History
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className={`status-dot ${online ? 'online' : 'offline'}`} />
          <span>System Status</span>
        </div>
        <p className={`status-text ${online ? 'online' : 'offline'}`}>
          {online ? 'Engine Online' : 'Connecting...'}
        </p>
      </div>
    </aside>
  );
}

function AppLayout() {
  const location = useLocation();
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div key={location.pathname} className="page-enter">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assess" element={<NewAssessment />} />
            <Route path="/history" element={<History />} />
            <Route path="/prediction/:id" element={<PredictionDetail />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone pages (no sidebar) */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* App pages (with sidebar) */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

