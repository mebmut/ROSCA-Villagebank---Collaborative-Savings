
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo, APP_NAME } from '../../constants';
import { Button, Input, Card } from '../../components/Shared';
import { Lock, Mail, ChevronRight, AlertCircle, Info, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const { users, setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
    } else {
      setError('Invalid credentials. Check the platform initialization info.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Initialization Notice */}
        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-3xl flex items-start gap-4 animate-pulse-slow">
          <ShieldCheck className="text-blue-500 shrink-0" size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Platform Initialized</p>
            <p className="text-xs font-bold dark:text-slate-300 mt-1">Default Admin: <span className="text-blue-500">admin@villagebank.com</span></p>
            <p className="text-xs font-bold dark:text-slate-300">Password: <span className="text-blue-500">password123</span></p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-slate-800">
              <Logo className="w-16 h-16 text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{APP_NAME}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Secure access to your saving cycles</p>
          </div>
        </div>

        <Card className="p-8 shadow-2xl shadow-blue-500/5 border-none">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="Email" 
                type="email" 
                placeholder="admin@villagebank.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl text-xs font-bold border border-rose-100 dark:border-rose-900/50">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full !py-5 text-lg group">
              <span>Sign In</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Village Bank Platform &copy; 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
