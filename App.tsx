import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import AuthPage from './views/Auth/AuthPage';
import LandingPage from './views/LandingPage';
import AdminView from './views/AdminView';
import { ManagerDashboard, ManagerTools } from './views/ManagerView';
import UserView from './views/UserView';
import { ToastProvider } from './components/Shared';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (currentUser) {
      setCurrentView('app');
      if (currentUser.roles.includes(UserRole.ADMIN)) setActiveTab('admin');
      else if (currentUser.roles.includes(UserRole.MANAGER)) setActiveTab('manager-dashboard');
      else setActiveTab('user');
    } else {
      setCurrentView('landing');
    }
  }, [currentUser]);

  if (currentView === 'landing') return <LandingPage onStartAuth={(mode) => { setAuthMode(mode); setCurrentView('auth'); }} onGoToDashboard={(view) => { setActiveTab(view); setCurrentView('app'); }} />;
  if (currentView === 'auth') return <AuthPage onBack={() => setCurrentView('landing')} initialMode={authMode} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'admin': 
        return <AdminView initialTab="dashboard" />;
      case 'settings': 
        return <AdminView initialTab="settings" />;
      case 'manager-dashboard': return <ManagerDashboard />;
      case 'manager-tools': return <ManagerTools />;
      case 'user': return <UserView />;
      default: return <UserView />;
    }
  };

  return <Layout activeView={activeTab} setActiveView={setActiveTab} onGoHome={() => setCurrentView('landing')}>{renderContent()}</Layout>;
};

const App: React.FC = () => (
  <AppProvider><ToastProvider><AppContent /></ToastProvider></AppProvider>
);

export default App;