import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Modal, Input, useToast } from '../components/Shared';
import { calculatePayout, getLoanDetails } from '../utils/finance';
import { PaymentType, LoanStatus, User } from '../types';
import { 
  BarChart3, Wallet, BadgeDollarSign, Clock, Download, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, TrendingUp, HandCoins,
  History, User as UserIcon, Camera, 
  Upload, CheckCircle2, Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const UserView: React.FC = () => {
  const { currentUser, setCurrentUser, users, setUsers, cycles, savings, loans, payments, losses, cycleMembers } = useApp();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ledger' | 'profile'>('ledger');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [profileForm, setProfileForm] = useState<Partial<User>>({
    name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '',
    address: currentUser?.address || '', employmentStatus: currentUser?.employmentStatus || '',
    employmentAddress: currentUser?.employmentAddress || '', profileImage: currentUser?.profileImage,
    coverImage: currentUser?.coverImage, nrcDoc: currentUser?.nrcDoc, passportDoc: currentUser?.passportDoc
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profileForm };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    addToast('Profile updated', 'success');
  };

  const userCycleIds = useMemo(() => cycleMembers.filter(m => m.userId === currentUser?.id).map(m => m.cycleId), [cycleMembers, currentUser]);
  const mainCycle = cycles.find(c => userCycleIds.includes(c.id));
  const currency = mainCycle?.currency || '$';
  const userSavings = savings.filter(s => s.userId === currentUser?.id);
  const userLoans = loans.filter(l => l.userId === currentUser?.id);
  const userPayments = payments.filter(p => p.userId === currentUser?.id);
  const userLosses = losses.filter(l => userCycleIds.includes(l.cycleId));

  const financialSummary = useMemo(() => {
    if (!mainCycle) return { totalSaved: 0, totalExpectedInterest: 0, activeLoans: 0, netPayout: 0 };
    const totalSaved = userSavings.reduce((acc, s) => acc + s.amount, 0);
    const totalExpectedInterest = userSavings.reduce((acc, s) => acc + s.expectedInterestAtEnd, 0);
    const memberCount = cycleMembers.filter(m => m.cycleId === mainCycle?.id).length;
    const payout = calculatePayout(mainCycle, userSavings, userLoans, userPayments, userLosses, memberCount);
    return { totalSaved, totalExpectedInterest, activeLoans: payout.loanBalance, netPayout: payout.netPayout };
  }, [userSavings, userLoans, userPayments, userLosses, mainCycle, cycleMembers]);

  const chartData = [
    { name: 'Savings', value: financialSummary.totalSaved, color: '#3b82f6' },
    { name: 'Interest', value: financialSummary.totalExpectedInterest, color: '#10b981' },
    { name: 'Loans', value: financialSummary.activeLoans, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter dark:text-white leading-tight">Workspace</h2>
          <p className="text-slate-500 font-medium">Assets for {currentUser?.name}</p>
        </div>
        <div className="flex gap-2">
           <Button variant={activeTab === 'ledger' ? 'primary' : 'secondary'} className="!px-5 !py-3 !rounded-2xl" onClick={() => setActiveTab('ledger')}><BarChart3 size={18} /><span>Ledger</span></Button>
           <Button variant={activeTab === 'profile' ? 'primary' : 'secondary'} className="!px-5 !py-3 !rounded-2xl" onClick={() => setActiveTab('profile')}><UserIcon size={18} /><span>Profile</span></Button>
        </div>
      </div>

      {activeTab === 'ledger' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
               <div className="relative z-10"><p className="text-3xl font-black">{currency} {financialSummary.totalSaved.toLocaleString()}</p><p className="text-[10px] font-black uppercase opacity-70 mt-1 tracking-widest">Saved</p></div>
            </Card>
            <Card className="p-6 bg-white dark:bg-slate-900 border-none"><p className="text-3xl font-black text-emerald-500">{currency} {financialSummary.totalExpectedInterest.toLocaleString()}</p><p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Interest</p></Card>
            <Card className="p-6 bg-white dark:bg-slate-900 border-none"><p className="text-3xl font-black text-rose-500">{currency} {financialSummary.activeLoans.toLocaleString()}</p><p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Loans</p></Card>
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl shadow-blue-500/5"><p className="text-3xl font-black text-blue-500">{currency} {financialSummary.netPayout.toLocaleString()}</p><p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Net Payout</p></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 flex flex-col h-[450px] border-none shadow-md">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-8">Performance Distribution</h3>
              <div className="flex-1 w-full relative min-h-0">
                {hasMounted && (
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="99.9%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.05} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} fontWeight="900" width={100} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                        <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 flex flex-col border-none shadow-md">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-8">Flow History</h3>
              <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                {[...userSavings, ...userLoans, ...userPayments].sort((a,b) => b.date - a.date).slice(0, 8).map((activity: any, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2.5 rounded-xl ${activity.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{activity.type === PaymentType.LOAN_REPAYMENT ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16} />}</div>
                      <div className="min-w-0"><p className="text-sm font-black dark:text-white truncate">{activity.type ? activity.type.replace(/_/g, ' ') : 'Contribution'}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(activity.date).toLocaleDateString()}</p></div>
                    </div>
                    <p className={`font-black shrink-0 ${activity.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{activity.amount > 0 ? '+' : ''}{currency}{activity.amount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;