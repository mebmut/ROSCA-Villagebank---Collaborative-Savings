import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../constants';
import { Button, Card, Badge } from '../components/Shared';
import { 
  ArrowRight, Users, ShieldCheck, Lock, 
  ChevronRight, ChevronLeft, Quote, BarChart3
} from 'lucide-react';
import { UserRole } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface LandingPageProps {
  onStartAuth: (mode: 'login' | 'signup') => void;
  onGoToDashboard: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartAuth, onGoToDashboard }) => {
  const { currentUser, settings } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const displaySlides = settings.heroSlides;

  useEffect(() => {
    if (!displaySlides || displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % displaySlides.length);
    }, settings.slideInterval || 5000);
    return () => clearInterval(interval);
  }, [displaySlides, settings.slideInterval]);

  const prevSlideIdx = (currentSlide - 1 + displaySlides.length) % displaySlides.length;
  const nextSlideIdx = (currentSlide + 1) % displaySlides.length;

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const dashboardLink = currentUser?.roles.includes(UserRole.ADMIN) ? 'admin' : 
                       currentUser?.roles.includes(UserRole.MANAGER) ? 'manager-dashboard' : 'user';

  const chartData = [
    { name: 'Jan', value: 400 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 }, { name: 'May', value: 1890 }, { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col overflow-x-hidden no-scrollbar items-center text-center">
      {/* Header Navigation - Fixed to avoid layout shifts */}
      <nav className="fixed top-0 left-0 right-0 h-24 bg-black/30 backdrop-blur-xl border-b border-white/10 z-[100] transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="w-16 h-16 md:w-24 md:h-24 text-blue-500 hover:scale-105 transition-transform" />
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            {['benefits', 'analytics', 'experience', 'security'].map((section) => (
              <button 
                key={section}
                onClick={() => scrollToSection(section)} 
                className="text-[11px] font-black text-white/80 hover:text-white transition-colors uppercase tracking-[0.25em]"
              >
                {section === 'benefits' ? 'Features' : section}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-8">
            {currentUser ? (
              <button onClick={() => onGoToDashboard(dashboardLink)} className="text-[11px] font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                Workspace <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-8">
                <button onClick={() => onStartAuth('login')} className="text-[11px] font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest">Log In</button>
                <button onClick={() => onStartAuth('signup')} className="text-[11px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-widest border-b-2 border-blue-500 pb-1">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Slider Section - Pushed below the header */}
      <section className="relative h-[calc(100vh-6rem)] mt-24 w-full bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-cover bg-center ${
                currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{ backgroundImage: `url(${slide.url})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>
          ))}
        </div>

        {/* Vertically Centered Navigation */}
        <button 
          onClick={() => setCurrentSlide(prevSlideIdx)}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-blue-600 text-white rounded-full backdrop-blur-md transition-all border border-white/20 hidden md:flex"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={() => setCurrentSlide(nextSlideIdx)}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-blue-600 text-white rounded-full backdrop-blur-md transition-all border border-white/20 hidden md:flex"
        >
          <ChevronRight size={32} />
        </button>

        <div className="relative z-30 w-full flex flex-col items-center justify-center px-6">
          {displaySlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 flex flex-col justify-center items-center transition-all duration-1000 px-6 ${
                currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
              }`}
            >
              <div className="space-y-6 w-[85%] flex flex-col items-center">
                <Badge color="blue">Global Savings Protocol</Badge>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.95] text-white drop-shadow-2xl uppercase whitespace-pre-line text-center">
                  {slide.caption.split('\\n').join('\n')}
                </h1>
                <p className="text-xs sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg opacity-80 text-center">
                  {slide.subcaption}
                </p>
                {/* CTA Button removed as requested */}
              </div>
            </div>
          ))}
        </div>

        {/* Small Circular Thumbnail Navigator */}
        <div className="absolute bottom-12 inset-x-0 z-40 flex justify-center items-center gap-6">
           {[prevSlideIdx, currentSlide, nextSlideIdx].map((idx, i) => (
             <button 
               key={`${idx}-${i}`} 
               onClick={() => setCurrentSlide(idx)}
               className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden transition-all border-4 shadow-2xl ${i === 1 ? 'border-blue-500 scale-125' : 'border-white/10 opacity-30 hover:opacity-100 grayscale'}`}
             >
               <img src={displaySlides[idx].url} className="w-full h-full object-cover" />
             </button>
           ))}
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-32 px-6 bg-slate-50 dark:bg-slate-900/30 w-full flex justify-center items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Badge color="blue">Data Insights</Badge>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white uppercase leading-tight">Growth <br/><span className="text-blue-600">Analytics.</span></h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">Join a verified network of shared prosperity. Monitor group capital and individual credit flow with precision.</p>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 text-center">Total Assets</p>
                <p className="text-2xl font-black dark:text-white text-center">{settings.defaultCurrency} 15.2M</p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 text-center">Yield</p>
                <p className="text-2xl font-black dark:text-white text-center">18.4%</p>
              </div>
            </div>
          </div>
          <Card className="p-8 h-[400px] border-none shadow-2xl w-full flex flex-col items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Asset Accumulation Trend</h3>
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-32 px-6 bg-white dark:bg-slate-950 w-full flex flex-col items-center">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="space-y-4 flex flex-col items-center">
             <Badge color="blue">Stories</Badge>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white uppercase">Member <span className="text-blue-600">Experiences.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah M.", role: "Entrepreneur", quote: "Village Bank scaled my business by providing accessible credit instantly.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
              { name: "David K.", role: "Manager", quote: "Automated tracking for 3 saving groups is now seamless. Truly a game changer.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
              { name: "Lydia O.", role: "Member", quote: "Discipline of rotating savings helped pay my tuition. Safe and transparent.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" }
            ].map((exp, i) => (
              <Card key={i} className="p-10 border-none shadow-lg bg-slate-50 dark:bg-slate-900/40 relative flex flex-col items-center">
                <Quote className="absolute top-8 right-8 text-blue-500/10" size={60} />
                <div className="space-y-6 relative z-10 flex flex-col items-center">
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">"{exp.quote}"</p>
                  <div className="flex flex-col items-center gap-3">
                    <img src={exp.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" alt={exp.name} />
                    <div><p className="font-black dark:text-white text-sm">{exp.name}</p><p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{exp.role}</p></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-slate-900 px-6 overflow-hidden w-full flex justify-center items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Badge color="blue">Secure Protocol</Badge>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">Vault-Grade <br/><span className="text-emerald-400">Security.</span></h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">Join thousands managing finances with institutional protocols. Encryption and transparency are at the heart of our platform.</p>
            <Button onClick={() => onStartAuth('signup')} className="!py-4 !px-8 !rounded-2xl"><span>Join the Platform</span></Button>
          </div>
          <div className="hidden lg:flex justify-center relative">
            <div className="p-20 bg-blue-600/10 rounded-[5rem] border border-white/5 backdrop-blur-3xl flex items-center justify-center">
               <Lock size={160} className="text-white opacity-20 absolute" />
               <ShieldCheck size={120} className="text-white relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 w-full flex justify-center">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="space-y-4 flex flex-col items-center">
            <Logo className="w-20 h-20" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">Collective wealth protocol by Village Bank.</p>
          </div>
          <div className="space-y-6 flex flex-col items-center">
            <h5 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-900 dark:text-white">Navigation</h5>
            <ul className="space-y-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <li><button onClick={() => scrollToSection('benefits')} className="hover:text-blue-600 transition-colors">Features</button></li>
              <li><button onClick={() => scrollToSection('analytics')} className="hover:text-blue-600 transition-colors">Analytics</button></li>
              <li><button onClick={() => scrollToSection('experience')} className="hover:text-blue-600 transition-colors">Stories</button></li>
            </ul>
          </div>
          <div className="space-y-6 flex flex-col items-center">
             <h5 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-900 dark:text-white">Legal</h5>
             <ul className="space-y-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">
               <li><a href="#" className="hover:text-blue-600 transition-colors">Data Protocol</a></li>
               <li><a href="#" className="hover:text-blue-600 transition-colors">Legal Policy</a></li>
             </ul>
          </div>
          <div className="space-y-6 flex flex-col items-center">
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">&copy; 2025 Village Bank</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;