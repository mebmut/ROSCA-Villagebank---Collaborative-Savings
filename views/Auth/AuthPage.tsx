import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../constants';
import { Button, Input, Card, Badge } from '../../components/Shared';
import { ChevronRight, AlertCircle, ShieldCheck, X, CheckCircle2, Lock, Users } from 'lucide-react';
import { UserRole, User } from '../../types';

interface AuthPageProps {
  onBack: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, initialMode = 'login' }) => {
  const { users, setUsers, setCurrentUser } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        setCurrentUser(user);
      } else {
        setError('Invalid email or password.');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (users.find(u => u.email === formData.email)) {
        setError('Email already registered.');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        roles: [UserRole.USER],
        password: formData.password
      };

      setUsers([...users, newUser]);
      setCurrentUser(newUser);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setError('');
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      
      {/* Left Visual Column (md breakpoint+) */}
      <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80" 
            alt="Secure Platform" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/90 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
          <div className="p-6 bg-white/10 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
            <Logo className="w-20 h-20 text-blue-400" />
          </div>
          <div className="space-y-4">
             <Badge color="blue">Institutional Trust</Badge>
             <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                Secure <br/><span className="text-blue-400">Collective</span> <br/>Growth.
             </h2>
             <p className="text-sm lg:text-lg text-slate-300 font-medium opacity-80 leading-relaxed">
               Access the world's most transparent ROSCA platform. Manage cycles, track savings, and prosper with your community.
             </p>
          </div>
          <div className="flex items-center gap-6 pt-8 border-t border-white/5 w-full justify-center">
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">15k+</span>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Members</span>
             </div>
             <div className="h-10 w-px bg-white/10" />
             <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-white">99%</span>
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Uptime Record</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Form Column (Centered) */}
      <div className="flex-1 flex flex-col relative bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar items-center justify-center">
        {/* Nav Bar (Mobile Only Logo) */}
        <header className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shrink-0 z-50">
          <div className="md:hidden flex items-center">
            <Logo className="w-7 h-7 text-blue-500" />
          </div>
          <div className="hidden md:block" />
          <button 
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
            title="Back to Home"
          >
            <X size={24} />
          </button>
        </header>

        <div className="w-full max-w-md space-y-8 flex flex-col items-center p-6 mt-14">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative group">
               {mode === 'login' ? (
                 <Lock className="text-blue-500 w-8 h-8 transition-transform group-hover:scale-110" />
               ) : (
                 <Users className="text-blue-500 w-8 h-8 transition-transform group-hover:scale-110" />
               )}
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                {mode === 'login' ? 'Sign Into Vault' : 'Create Account'}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em]">
                {mode === 'login' ? 'Authorized personnel only' : 'Establishing new credentials'}
              </p>
            </div>

            <Card className="p-8 shadow-2xl border-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl w-full relative">
              <form onSubmit={handleAuth} className="space-y-5">
                <div className={`transition-all duration-500 ease-in-out ${mode === 'signup' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                  <Input 
                    label="Full Name" 
                    name="name"
                    placeholder="Jane Doe" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required={mode === 'signup'} 
                    className="!py-3 !text-xs"
                  />
                </div>

                <Input 
                  label="Email Address" 
                  name="email"
                  type="email" 
                  placeholder="name@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="!py-3 !text-xs"
                />
                
                <Input 
                  label="Password" 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="!py-3 !text-xs"
                />

                <div className={`transition-all duration-500 ease-in-out ${mode === 'signup' ? 'max-h-24 opacity-100 pt-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                  <Input 
                    label="Confirm Password" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required={mode === 'signup'} 
                    className="!py-3 !text-xs"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl text-[10px] font-bold border border-rose-100 dark:border-rose-900/50">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full !py-4 shadow-xl shadow-blue-500/20 uppercase tracking-widest font-black">
                  <span>{mode === 'login' ? 'Authenticate' : 'Establish Access'}</span>
                  <ChevronRight size={16} />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <button 
                  onClick={toggleMode}
                  className="text-[10px] font-black text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-[0.2em]"
                >
                  {mode === 'login' ? "Need a member ID? Register" : "Member already? Sign in"}
                </button>
              </div>
            </Card>

            {mode === 'login' && (
              <div className="bg-blue-600/5 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-4 w-full">
                <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                <div className="text-left text-[9px] font-black dark:text-slate-400 uppercase tracking-widest">
                  <p className="text-blue-600 mb-0.5">Quick Access Credentials</p>
                  <p className="opacity-60">admin@villagebank.com | password123</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;