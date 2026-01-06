
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// Fixed: Added FileText to the imports from lucide-react
import { Menu, X, Bell, User, Search as SearchIcon, FileText } from 'lucide-react';
import { SIDEBAR_MENU, COMPANY_NAME } from './constants';
import Dashboard from './components/Dashboard';
import RequisitionForm from './components/RequisitionForm';
import OrderHistory from './components/OrderHistory';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="bg-blue-600 p-1.5 rounded-lg">S</span> MPRS
            </span>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {SIDEBAR_MENU.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
                <User size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Store Officer</p>
                <p className="text-xs text-slate-500 truncate">unit1.msez@samuda.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2 text-slate-700 font-semibold">
          <span className="text-blue-600">|</span>
          {COMPANY_NAME}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search MPRS..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white focus:w-80"
          />
        </div>
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex flex-col flex-1 min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<RequisitionForm />} />
              <Route path="/history" element={<OrderHistory />} />
              <Route path="/reports" element={
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <FileText size={64} className="mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-medium">Coming Soon</h2>
                    <p>Advanced reporting module is under development.</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
