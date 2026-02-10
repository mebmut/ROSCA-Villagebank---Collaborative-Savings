import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole, Cycle, AppSettings, HeroSlide, CycleFrequency, PaymentType } from '../types';
import { Card, Badge, Modal, Input, Button, useToast } from '../components/Shared';
import { calculateMemberShareOut } from '../utils/finance';
import { 
  UserPlus, Settings as SettingsIcon, Trash2, Edit, Users, RefreshCw, 
  LayoutDashboard, TrendingUp, DollarSign, Activity, Plus, Search, 
  Shield, BarChart3, Save, Image as ImageIcon, UserCheck, Eye,
  Calculator, ChevronRight, ArrowRight, Flag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';

const AdminView: React.FC<{ initialTab?: 'dashboard' | 'users' | 'cycles' | 'settings' }> = ({ initialTab = 'dashboard' }) => {
  const { 
    users, setUsers, 
    cycles, setCycles, 
    savings, loans, 
    payments, losses,
    settings, setSettings,
    currentUser,
    cycleMembers
  } = useApp();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'cycles' | 'settings'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [isAddCycleModal, setIsAddCycleModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);
  const [viewingCycleId, setViewingCycleId] = useState<string | null>(null);

  // Form State for a NEW Cycle
  const [newCycleForm, setNewCycleForm] = useState<Partial<Cycle>>({
    name: '',
    interestRate: 0.1,
    durationMonths: 6,
    frequency: CycleFrequency.MONTHLY,
    savingMin: 100,
    savingMax: 5000,
    membershipFee: 50,
    borrowingLimitRatio: 3,
    currency: settings.defaultCurrency,
    managerIds: []
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [settingsFormData, setSettingsFormData] = useState<AppSettings>({ ...settings });

  useEffect(() => {
    setSettingsFormData({ ...settings });
  }, [settings]);

  const stats = useMemo(() => ({
    totalCapital: cycles.reduce((acc, c) => acc + c.capital, 0),
    totalInterest: savings.reduce((acc, s) => acc + s.expectedInterestAtEnd, 0),
    totalLoans: loans.reduce((acc, l) => acc + l.amount + l.topUpAmount, 0),
    userCount: users.length
  }), [cycles, savings, loans, users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const cyclePerformanceData = useMemo(() => cycles.map(c => ({
    name: c.name,
    capital: c.capital,
    savings: savings.filter(s => s.cycleId === c.id).reduce((acc, cur) => acc + cur.amount, 0)
  })), [cycles, savings]);

  const handleGlobalSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(settingsFormData);
    addToast('Global parameters updated successfully', 'success');
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const cycle: Cycle = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCycleForm.name || 'New Cycle',
      managerIds: newCycleForm.managerIds || [],
      interestRate: newCycleForm.interestRate || 0.1,
      durationMonths: newCycleForm.durationMonths || 6,
      frequency: newCycleForm.frequency || CycleFrequency.MONTHLY,
      savingMin: newCycleForm.savingMin || 100,
      savingMax: newCycleForm.savingMax || 5000,
      membershipFee: newCycleForm.membershipFee || 50,
      borrowingLimitRatio: newCycleForm.borrowingLimitRatio || 3,
      capital: 0,
      currency: newCycleForm.currency || settings.defaultCurrency,
      isLocked: false,
      createdAt: Date.now()
    };
    setCycles([...cycles, cycle]);
    setIsAddCycleModal(false);
    setNewCycleForm({
      name: '', interestRate: 0.1, durationMonths: 6, frequency: CycleFrequency.MONTHLY,
      savingMin: 100, savingMax: 5000, membershipFee: 50, borrowingLimitRatio: 3,
      currency: settings.defaultCurrency, managerIds: []
    });
    addToast('New cycle provisioned', 'success');
  };

  const handleUpdateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCycle) return;
    setCycles(cycles.map(c => c.id === editingCycle.id ? editingCycle : c));
    setEditingCycle(null);
    addToast('Cycle configuration committed', 'success');
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const roles = u.roles.includes(role) ? u.roles.filter(r => r !== role) : [...u.roles, role];
        return { ...u, roles };
      }
      return u;
    }));
  };

  const addHeroSlide = () => {
    if (settingsFormData.heroSlides.length >= 5) return;
    const newSlide: HeroSlide = {
      id: Math.random().toString(36).substr(2, 9),
      url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Community Wealth\nShared Prosperity',
      subcaption: 'Digitalizing group savings and credit.'
    };
    setSettingsFormData({ ...settingsFormData, heroSlides: [...settingsFormData.heroSlides, newSlide] });
  };

  const removeHeroSlide = (id: string) => {
    if (settingsFormData.heroSlides.length <= 1) return;
    setSettingsFormData({ ...settingsFormData, heroSlides: settingsFormData.heroSlides.filter(s => s.id !== id) });
  };

  const updateHeroSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setSettingsFormData({
      ...settingsFormData,
      heroSlides: settingsFormData.heroSlides.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const potentialManagers = useMemo(() => users.filter(u => u.roles.includes(UserRole.MANAGER) || u.roles.includes(UserRole.ADMIN)), [users]);

  // Modal Details for Cycle Viewing
  const currentViewingCycle = useMemo(() => cycles.find(c => c.id === viewingCycleId), [cycles, viewingCycleId]);
  const viewingCycleMembers = useMemo(() => {
    if (!currentViewingCycle) return [];
    const memberIds = cycleMembers.filter(m => m.cycleId === currentViewingCycle.id).map(m => m.userId);
    return users.filter(u => memberIds.includes(u.id));
  }, [currentViewingCycle, cycleMembers, users]);

  return (
    <div className="space-y-6 pb-20 flex flex-col items-center w-full min-h-full">
      {/* Navigation Rails */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl justify-center shadow-inner">
        {[
          { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={16} /> },
          { id: 'users', label: 'Users', icon: <Users size={16} /> },
          { id: 'cycles', label: 'Cycles', icon: <RefreshCw size={16} /> },
          { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Platform Capital', value: `${settings.defaultCurrency} ${stats.totalCapital.toLocaleString()}`, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <DollarSign size={20}/> },
              { label: 'Est. Interest', value: `${settings.defaultCurrency} ${stats.totalInterest.toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <TrendingUp size={20}/> },
              { label: 'Asset Debt', value: `${settings.defaultCurrency} ${stats.totalLoans.toLocaleString()}`, color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <Activity size={20}/> },
              { label: 'Member Registry', value: stats.userCount, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Users size={20}/> },
            ].map((s, i) => (
              <Card key={i} className="p-5 border-none flex flex-col items-center justify-center text-center shadow-sm">
                <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                <p className="text-xl font-black dark:text-white truncate">{s.value}</p>
              </Card>
            ))}
          </div>
          <Card className="p-8 h-[380px] border-none shadow-md">
             <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8 text-center flex items-center justify-center gap-2"><BarChart3 size={16} className="text-blue-500" /> Capital Yield Mapping</h3>
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="75%">
                   <BarChart data={cyclePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                      <Bar dataKey="capital" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-6xl">
           <div className="flex flex-col md:flex-row justify-between gap-4 w-full px-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Filter registry..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white"
                 />
              </div>
              <Button onClick={() => setIsAddUserModal(true)}><UserPlus size={18} /><span>Add Member</span></Button>
           </div>
           <Card className="border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900 w-full mx-4">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500">
                          <th className="px-6 py-4">Identity</th>
                          <th className="px-6 py-4">Auth Level</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black">{user.name.charAt(0)}</div>
                                   <div><p className="text-sm font-black dark:text-white">{user.name}</p><p className="text-[10px] text-slate-400">{user.email}</p></div>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex flex-wrap gap-1">
                                   {Object.values(UserRole).map(role => (
                                      <button key={role} onClick={() => handleRoleChange(user.id, role)} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${user.roles.includes(role) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{role}</button>
                                   ))}
                                </div>
                             </td>
                             <td className="px-6 py-5 text-right"><button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      )}

      {activeTab === 'cycles' && (
        <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-7xl">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">ROSCA Lifecycle Management</h3>
              <Button onClick={() => setIsAddCycleModal(true)}><Plus size={18}/><span>Provision Cycle</span></Button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
              {cycles.map(cycle => (
                 <Card key={cycle.id} className="p-6 border-none shadow-lg group hover:ring-2 hover:ring-blue-500/30 transition-all flex flex-col justify-between h-[280px]">
                    <div>
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><RefreshCw size={24}/></div>
                          <Badge color={cycle.isLocked ? 'red' : 'green'}>{cycle.isLocked ? 'Locked' : 'Live'}</Badge>
                       </div>
                       <h4 className="text-xl font-black dark:text-white uppercase truncate">{cycle.name}</h4>
                       <div className="grid grid-cols-2 gap-4 mt-4">
                          <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Asset Pool</p><p className="font-black text-xs dark:text-white">{cycle.currency} {cycle.capital.toLocaleString()}</p></div>
                          <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Yield</p><p className="font-black text-xs dark:text-white">{cycle.interestRate * 100}%</p></div>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                       <div className="flex -space-x-2">
                          {cycle.managerIds.slice(0, 3).map(mid => <div key={mid} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase">{users.find(u => u.id === mid)?.name.charAt(0)}</div>)}
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setViewingCycleId(cycle.id)} className="p-2 text-slate-400 hover:text-blue-500" title="Projections"><Eye size={18}/></button>
                          <button onClick={() => setEditingCycle(cycle)} className="p-2 text-slate-400 hover:text-emerald-500" title="Config"><SettingsIcon size={18}/></button>
                          <button onClick={() => setCycles(cycles.filter(c => c.id !== cycle.id))} className="p-2 text-slate-400 hover:text-rose-500" title="Remove"><Trash2 size={18}/></button>
                       </div>
                    </div>
                 </Card>
              ))}
           </div>
        </div>
      )}

      {/* DETAILED PROJECTION MODAL */}
      <Modal isOpen={!!viewingCycleId} onClose={() => setViewingCycleId(null)} title={currentViewingCycle?.name || "Detailed Overview"}>
         {currentViewingCycle && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6 bg-slate-50 dark:bg-slate-800/40 border-none flex flex-col items-center">
                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Pool</p>
                     <p className="text-2xl font-black text-blue-500">{currentViewingCycle.currency} {currentViewingCycle.capital.toLocaleString()}</p>
                  </Card>
                  <Card className="p-6 bg-slate-50 dark:bg-slate-800/40 border-none flex flex-col items-center">
                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Horizon</p>
                     <p className="text-2xl font-black dark:text-white">{currentViewingCycle.durationMonths} Mo.</p>
                  </Card>
               </div>
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Calculator size={16} className="text-emerald-500" /> Share-out Projection</h4>
                  <Card className="border-none bg-emerald-500/5 overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-emerald-500/10 text-[8px] font-black uppercase text-emerald-600">
                                 <th className="px-4 py-3">Member</th>
                                 <th className="px-4 py-3 text-right">Saved</th>
                                 <th className="px-4 py-3 text-right">Net Share</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-emerald-500/10">
                              {viewingCycleMembers.map(member => {
                                 const p = calculateMemberShareOut(member.id, currentViewingCycle, savings, loans, payments, losses, viewingCycleMembers.length);
                                 return (
                                    <tr key={member.id} className="text-[11px] font-bold dark:text-white hover:bg-emerald-500/5">
                                       <td className="px-4 py-3">{member.name}</td>
                                       <td className="px-4 py-3 text-right">{currentViewingCycle.currency}{p.totalSaved.toLocaleString()}</td>
                                       <td className="px-4 py-3 text-right text-emerald-500 font-black">{currentViewingCycle.currency}{p.netPayout.toLocaleString()}</td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </div>
               <Button onClick={() => { setEditingCycle(currentViewingCycle); setViewingCycleId(null); }} className="w-full"><SettingsIcon size={16}/><span>Open Settings</span></Button>
            </div>
         )}
      </Modal>

      {/* EDIT CYCLE MODAL */}
      <Modal isOpen={!!editingCycle} onClose={() => setEditingCycle(null)} title="Lifecycle Logic">
         {editingCycle && (
            <form onSubmit={handleUpdateCycle} className="space-y-6">
               <Input label="Cycle Name" value={editingCycle.name} onChange={e => setEditingCycle({...editingCycle, name: e.target.value})} required />
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Interest Rate (Decimal)" type="number" step="0.01" value={editingCycle.interestRate} onChange={e => setEditingCycle({...editingCycle, interestRate: Number(e.target.value)})} />
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Frequency</label>
                     <select value={editingCycle.frequency} onChange={e => setEditingCycle({...editingCycle, frequency: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white">
                        <option value={CycleFrequency.WEEKLY}>Weekly</option>
                        <option value={CycleFrequency.MONTHLY}>Monthly</option>
                     </select>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <Input label="Min Saving" type="number" value={editingCycle.savingMin} onChange={e => setEditingCycle({...editingCycle, savingMin: Number(e.target.value)})} />
                  <Input label="Max Saving" type="number" value={editingCycle.savingMax} onChange={e => setEditingCycle({...editingCycle, savingMax: Number(e.target.value)})} />
                  <Input label="Borrowing Ratio" type="number" value={editingCycle.borrowingLimitRatio} onChange={e => setEditingCycle({...editingCycle, borrowingLimitRatio: Number(e.target.value)})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lifecycle Managers</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl">
                     {potentialManagers.map(m => {
                        const isActive = editingCycle.managerIds.includes(m.id);
                        return (
                           <button key={m.id} type="button" onClick={() => {
                              const ids = isActive ? editingCycle.managerIds.filter(id => id !== m.id) : [...editingCycle.managerIds, m.id];
                              setEditingCycle({...editingCycle, managerIds: ids});
                           }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>{m.name}</button>
                        );
                     })}
                  </div>
               </div>
               <Button type="submit" className="w-full">Commit Lifecycle Delta</Button>
            </form>
         )}
      </Modal>

      {/* NEW CYCLE MODAL */}
      <Modal isOpen={isAddCycleModal} onClose={() => setIsAddCycleModal(false)} title="Provision New ROSCA Space">
         <form onSubmit={handleCreateCycle} className="space-y-6">
            <Input label="Cycle Name" placeholder="E.g., Winter Harvest Fund" value={newCycleForm.name} onChange={e => setNewCycleForm({...newCycleForm, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
               <Input label="Target Interest Pool (%)" type="number" step="0.01" value={newCycleForm.interestRate} onChange={e => setNewCycleForm({...newCycleForm, interestRate: Number(e.target.value)})} />
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Frequency</label>
                  <select value={newCycleForm.frequency} onChange={e => setNewCycleForm({...newCycleForm, frequency: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white">
                     <option value={CycleFrequency.WEEKLY}>Weekly</option>
                     <option value={CycleFrequency.MONTHLY}>Monthly</option>
                  </select>
               </div>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assigned Managers</label>
               <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl">
                  {potentialManagers.map(m => {
                     const isActive = newCycleForm.managerIds?.includes(m.id);
                     return (
                        <button key={m.id} type="button" onClick={() => {
                           const ids = isActive ? newCycleForm.managerIds?.filter(id => id !== m.id) : [...(newCycleForm.managerIds || []), m.id];
                           setNewCycleForm({...newCycleForm, managerIds: ids});
                        }} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>{m.name}</button>
                     );
                  })}
               </div>
            </div>
            <Button type="submit" className="w-full">Initialize Cycle</Button>
         </form>
      </Modal>

      {/* GLOBAL SETTINGS AND HERO SLIDER MANAGER */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 pb-20 w-full flex flex-col items-center">
           <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-2xl w-full">
              <div className="flex flex-col items-center gap-4 mb-8">
                 <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600"><SettingsIcon size={28} /></div>
                 <h2 className="text-2xl font-black tracking-tighter dark:text-white uppercase text-center">Global Parameters</h2>
              </div>
              <form onSubmit={handleGlobalSettingsSubmit} className="space-y-8 flex flex-col items-center w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <Input label="Site Label" value={settingsFormData.siteName} onChange={e => setSettingsFormData({...settingsFormData, siteName: e.target.value})} required />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Base Currency</label>
                       <select value={settingsFormData.defaultCurrency} onChange={e => setSettingsFormData({...settingsFormData, defaultCurrency: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white">
                          {['USD', 'EUR', 'GBP', 'ZMW', 'KES', 'NGN'].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <Input label="Service Fee (%)" type="number" step="1" value={settingsFormData.serviceFee} onChange={e => setSettingsFormData({...settingsFormData, serviceFee: Number(e.target.value)})} required />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slide Animation</label>
                       <select value={settingsFormData.slideTransition} onChange={e => setSettingsFormData({...settingsFormData, slideTransition: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white">
                          <option value="fade">Smooth Fade</option>
                          <option value="slide">Dynamic Slide</option>
                       </select>
                    </div>
                    <Input label="Tick Interval (ms)" type="number" step="500" value={settingsFormData.slideInterval} onChange={e => setSettingsFormData({...settingsFormData, slideInterval: Number(e.target.value)})} required />
                 </div>
                 <Button type="submit" className="!px-12"><Save size={18} /><span>Store Configuration</span></Button>
              </form>
           </Card>

           <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-2xl w-full">
              <div className="flex justify-between items-center mb-8 px-2">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600"><ImageIcon size={28} /></div>
                    <h2 className="text-2xl font-black tracking-tighter dark:text-white uppercase">Slider Master</h2>
                 </div>
                 <Button onClick={addHeroSlide} variant="secondary" className="!p-3 !rounded-xl" disabled={settingsFormData.heroSlides.length >= 5}><Plus size={20} /></Button>
              </div>
              <div className="space-y-6 w-full">
                 {settingsFormData.heroSlides.map(slide => (
                    <div key={slide.id} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border grid md:grid-cols-2 gap-6 hover:border-blue-500/30 transition-all shadow-sm">
                       <div className="space-y-4">
                          <Input label="Main Caption" value={slide.caption} onChange={e => updateHeroSlide(slide.id, 'caption', e.target.value)} />
                          <Input label="Sub-caption" value={slide.subcaption} onChange={e => updateHeroSlide(slide.id, 'subcaption', e.target.value)} />
                          <Input label="Asset URL" value={slide.url} onChange={e => updateHeroSlide(slide.id, 'url', e.target.value)} />
                       </div>
                       <div className="relative rounded-3xl overflow-hidden border h-full min-h-[160px]">
                          <img src={slide.url} className="w-full h-full object-cover" alt="Slide" />
                          <button onClick={() => removeHeroSlide(slide.id)} className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-8 flex justify-center w-full"><Button onClick={handleGlobalSettingsSubmit} className="!px-12 bg-blue-600"><Save size={18} /><span>Publish Slides</span></Button></div>
           </Card>
        </div>
      )}
    </div>
  );
};

export default AdminView;