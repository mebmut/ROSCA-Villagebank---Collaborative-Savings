import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Logo } from '../constants';
import { 
  LayoutDashboard, LogOut, 
  Menu, Sun, Moon, Settings, UserCircle,
  Wrench, BarChart3, ChevronLeft, ChevronRight, X, Home
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  onGoHome: () => void;
}

const ThemeToggleSwitch = ({ isMini }: { isMini: boolean }) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${isMini ? 'h-6 w-3.5 flex-col' : 'h-6 w-11'}`}
      aria-label="Toggle theme"
    >
      <span
        className={`${
          isMini 
            ? isDark ? 'translate-y-2.5' : 'translate-y-0.5' 
            : isDark ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-2.5 w-2.5 transform rounded-full bg-white dark:bg-blue-400 transition-all duration-200 ease-in-out flex items-center justify-center mx-auto`}
      >
        {isDark ? <Moon size={6} className="text-slate-900" /> : <Sun size={6} className="text-amber-500" />}
      </span>
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, onGoHome }) => {
  const { currentUser, logout, theme } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);
  const isManager = currentUser?.roles.includes(UserRole.MANAGER);
  const isUser = currentUser?.roles.includes(UserRole.USER);

  const menuItems = [
    { id: 'admin', label: 'Admin Panel', icon: <LayoutDashboard size={18} />, show: isAdmin },
    { id: 'manager-dashboard', label: 'Manager Overview', icon: <BarChart3 size={18} />, show: isManager },
    { id: 'manager-tools', label: 'Cycle Management', icon: <Wrench size={18} />, show: isManager },
    { id: 'user', label: 'My Dashboard', icon: <UserCircle size={18} />, show: isUser },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, show: isAdmin },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);
  const getIsActive = (id: string) => activeView === id;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors duration-300 no-scrollbar">
      
      {/* Mini-Rail Sidebar (Compact) */}
      <aside className="hidden md:flex flex-col w-12 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 shrink-0 h-full overflow-hidden">
        <div className="h-12 flex items-center justify-center p-1 shrink-0 bg-white dark:bg-slate-900 z-10">
          <button onClick={() => setIsExpanded(true)} className="hover:scale-110 transition-transform">
            <Logo className="w-6 h-6 text-blue-500" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col items-center py-1.5 space-y-1.5 overflow-y-auto no-scrollbar scroll-smooth">
          <button onClick={onGoHome} title="Landing Page" className="p-1.5 rounded-lg transition-all relative group text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500">
            <Home size={18} />
          </button>
          
          <div className="w-4 h-px bg-slate-100 dark:bg-slate-800 mx-auto shrink-0" />

          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`p-1.5 rounded-lg transition-all relative group shrink-0 ${
                getIsActive(item.id) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        <div className="p-1.5 flex flex-col items-center space-y-2 pb-4 border-t border-slate-100 dark:border-slate-800 pt-2 shrink-0 bg-white dark:bg-slate-900 z-10">
          <ThemeToggleSwitch isMini={true} />
          <button onClick={logout} title="Logout" className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Expanded Sidebar (Compact version) */}
      {isExpanded && <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-md" onClick={() => setIsExpanded(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 transform transition-transform duration-500 ease-out bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-white/20 dark:border-slate-800/50 shadow-2xl ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full no-scrollbar">
          <div className="h-14 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 shrink-0">
            <Logo className="w-8 h-8 text-blue-500" />
            <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"><X size={18} /></button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
            <button onClick={() => { onGoHome(); setIsExpanded(false); }} className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-blue-500">
                <Home size={16} />
                <span className="font-black text-[10px] uppercase tracking-widest">Home Page</span>
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2" />
            {filteredMenuItems.map(item => (
              <button key={item.id} onClick={() => { setActiveView(item.id); setIsExpanded(false); }} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${getIsActive(item.id) ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/50 hover:text-blue-500'}`}>
                {item.icon}
                <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 shrink-0">
            <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest shrink-0"><LogOut size={16} /><span>Sign Out</span></button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative no-scrollbar bg-gray-50 dark:bg-slate-950">
        <header className="h-12 flex items-center justify-between px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 z-40">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-slate-500 hover:text-blue-500 p-1 transition-colors" onClick={() => setIsExpanded(true)}><Menu size={20} /></button>
            <h1 className="text-base font-black dark:text-white tracking-tighter capitalize leading-none">{activeView.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setIsExpanded(true)}>
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black dark:text-white leading-none">{currentUser?.name}</span>
                <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest mt-0.5">{currentUser?.roles[0]}</span>
             </div>
             <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black text-[10px] border-2 border-white dark:border-slate-800 shadow-sm">{currentUser?.name.charAt(0)}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;