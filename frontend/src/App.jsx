import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewAssessment from './pages/NewAssessment';
import PredictionDetail from './pages/PredictionDetail';
import History from './pages/History';
import Users from './pages/Users';

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[232px] bg-[#FFFFFF] border-r border-[#DDD8CC] z-40 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        <div className="pt-7 pb-6 px-5 border-b border-[#DDD8CC]">
          <div className="font-headline-lg text-headline-lg font-semibold tracking-wide text-[#0F5C5A] leading-tight">AURA</div>
          <div className="text-[12px] leading-4 text-[#5B625F] mt-1">AI-Utilized Readmission Assessment</div>
        </div>
        <nav className="flex flex-col py-3">
          <NavLink 
            to="/dashboard" 
            end 
            className={({ isActive }) => `flex items-center h-10 px-5 text-[13px] leading-none transition-colors border-l-2 ${isActive ? 'bg-[#E3EFED] text-[#0F5C5A] border-[#0F5C5A] font-semibold' : 'text-[#5B625F] hover:bg-[#F6F3EC] hover:text-[#1B1F1E] border-transparent'}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/assess" 
            className={({ isActive }) => `flex items-center h-10 px-5 text-[13px] leading-none transition-colors border-l-2 ${isActive ? 'bg-[#E3EFED] text-[#0F5C5A] border-[#0F5C5A] font-semibold' : 'text-[#5B625F] hover:bg-[#F6F3EC] hover:text-[#1B1F1E] border-transparent'}`}
          >
            New Assessment
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => `flex items-center h-10 px-5 text-[13px] leading-none transition-colors border-l-2 ${isActive ? 'bg-[#E3EFED] text-[#0F5C5A] border-[#0F5C5A] font-semibold' : 'text-[#5B625F] hover:bg-[#F6F3EC] hover:text-[#1B1F1E] border-transparent'}`}
          >
            History
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => `flex items-center justify-between h-10 px-5 text-[13px] leading-none transition-colors border-l-2 ${isActive ? 'bg-[#E3EFED] text-[#0F5C5A] border-[#0F5C5A] font-semibold' : 'text-[#5B625F] hover:bg-[#F6F3EC] hover:text-[#1B1F1E] border-transparent'}`}
          >
            <span>Users</span>
            <span className="font-['IBM_Plex_Mono'] text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#DDD8CC] text-[#5B625F] bg-[#F6F3EC]">Admin</span>
          </NavLink>
        </nav>
      </div>
      <div className="p-5 border-t border-[#DDD8CC] bg-[#FFFFFF]">
        <div className="flex flex-col">
          <div className="text-[13px] font-semibold text-[#1B1F1E] leading-snug">Dr. Eleanor Vance</div>
          <div className="text-[12px] text-[#5B625F] leading-tight mt-0.5">Attending Physician</div>
          <div className="mt-3 pt-3 border-t border-[#DDD8CC]/50">
            <NavLink to="/login" className="text-[12px] text-[#5B625F] hover:text-[#0F5C5A] transition-colors inline-block underline-offset-2 hover:underline">Sign out</NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AppLayout() {
  const location = useLocation();
  return (
    <div className="bg-[#F6F3EC] text-[#1B1F1E] antialiased min-h-screen selection:bg-[#E3EFED] selection:text-[#0F5C5A]">
      <Sidebar />
      <div className="pl-[232px] min-h-screen bg-[#F6F3EC]">
        <header className="fixed top-0 left-[232px] right-0 h-14 bg-[#FFFFFF] border-b border-[#DDD8CC] z-30 flex items-center justify-end px-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#0F5C5A] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </header>
        <main className="relative pt-14 bg-[#F6F3EC] min-h-screen">
          <div className="p-8 max-w-[1120px] mx-auto w-full">
            <div key={location.pathname} className="flex flex-col w-full page-enter">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assess" element={<NewAssessment />} />
                <Route path="/history" element={<History />} />
                <Route path="/prediction/:id" element={<PredictionDetail />} />
                <Route path="/users" element={<Users />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
