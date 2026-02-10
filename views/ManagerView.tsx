import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Saving, Loan, LoanStatus, 
  PaymentType, Payment, CycleFrequency, UserRole, CycleMember
} from '../types';
import { Card, Badge, Modal, Input, Button, useToast } from '../components/Shared';
import { 
  calculateSavingInterest, 
  calculateCycleCapital,
  getLoanDetails,
  getUserBorrowingPower,
  getUserOutstandingLoan
} from '../utils/finance';
import { 
  Users, PiggyBank, HandCoins, Plus, TrendingUp, AlertCircle, Trash2, 
  Receipt, Activity, Wallet, UserPlus, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

/**
 * Manager Dashboard Component: Analytics and Reporting
 */
export const ManagerDashboard: React.FC = () => {
  const { users, currentUser, cycles, savings, loans, payments, cycleMembers } = useApp();
  const managedCycles = cycles.filter(c => c.managerIds?.includes(currentUser?.id || ''));
  const [selectedId, setSelectedId] = useState(managedCycles[0]?.id || '');
  const cycle = cycles.find(c => c.id === selectedId);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const cycleMembersList = useMemo(() => {
    if (!cycle) return [];
    const memberIds = cycleMembers.filter(cm => cm.cycleId === cycle.id).map(cm => cm.userId);
    return users.filter(u => memberIds.includes(u.id));
  }, [cycle, cycleMembers, users]);

  const stats = useMemo(() => {
    if (!cycle) return null;
    const capital = calculateCycleCapital(cycle.id, savings, loans, payments);
    const s = savings.filter(sv => sv.cycleId === cycle.id);
    const l = loans.filter(ln => ln.cycleId === cycle.id);
    const p = payments.filter(pm => pm.cycleId === cycle.id);

    return {
      capital,
      totalSaved: s.reduce((acc, cur) => acc + cur.amount, 0),
      totalLoans: l.reduce((acc, cur) => acc + cur.amount + cur.topUpAmount, 0),
      totalRepayments: p.filter(pm => pm.type === PaymentType.LOAN_REPAYMENT).reduce((acc, cur) => acc + cur.amount, 0),
    };
  }, [cycle, savings, loans, payments]);

  const userComparisonData = useMemo(() => {
    if (!cycle) return [];
    return cycleMembersList.map(member => ({
      name: member.name,
      savings: savings.filter(s => s.userId === member.id && s.cycleId === cycle.id).reduce((acc, s) => acc + s.amount, 0),
      loans: loans.filter(l => l.userId === member.id && l.cycleId === cycle.id).reduce((acc, l) => {
        const d = getLoanDetails(l, cycle, payments);
        return acc + d.balance;
      }, 0)
    }));
  }, [cycle, cycleMembersList, savings, loans, payments]);

  if (!cycle) return <div className="p-12 text-center text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-3xl">No cycles assigned to you.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase">Manager Analytics</h2>
          <p className="text-slate-500 font-medium">Monitoring <span className="text-blue-500">{cycle.name}</span></p>
        </div>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold outline-none shadow-sm dark:text-white">
          {managedCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Group Capital', val: stats?.capital, icon: <Wallet className="text-blue-500"/> },
          { label: 'Member Savings', val: stats?.totalSaved, icon: <PiggyBank className="text-emerald-500"/> },
          { label: 'Disbursed Loans', val: stats?.totalLoans, icon: <HandCoins className="text-rose-500"/> },
          { label: 'Repayment Vol.', val: stats?.totalRepayments, icon: <ArrowUpRight className="text-indigo-500"/> },
        ].map((s, i) => (
          <Card key={i} className="p-6 border-none flex flex-col items-center justify-center text-center">
            <div className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3`}>{s.icon}</div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
            <p className="text-xl font-black dark:text-white tracking-tighter">{cycle.currency}{s.val?.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 border-none h-[400px]">
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8">Asset Allocation vs Credit</h3>
        <div className="h-full">
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={userComparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
              <Legend iconType="circle" />
              <Bar dataKey="savings" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
              <Bar dataKey="loans" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

/**
 * Manager Tools Component: Operational Actions
 */
export const ManagerTools: React.FC = () => {
  const { currentUser, users, cycles, cycleMembers, setCycleMembers, savings, setSavings, loans, setLoans, payments, setPayments } = useApp();
  const { addToast } = useToast();
  
  const managedCycles = useMemo(() => cycles.filter(c => c.managerIds?.includes(currentUser?.id || '')), [cycles, currentUser]);
  const [selectedCycleId, setSelectedCycleId] = useState(managedCycles[0]?.id || '');
  const currentCycle = useMemo(() => cycles.find(c => c.id === selectedCycleId), [cycles, selectedCycleId]);
  
  const [isAddMemberModal, setIsAddMemberModal] = useState(false);
  const [isAddSavingModal, setIsAddSavingModal] = useState(false);
  const [isAddLoanModal, setIsAddLoanModal] = useState(false);
  const [isAddPaymentModal, setIsAddPaymentModal] = useState(false);

  // Form States
  const [newMemberId, setNewMemberId] = useState('');
  const [savingForm, setSavingForm] = useState({ userId: '', amount: 0 });
  const [loanForm, setLoanForm] = useState({ userId: '', amount: 0, topUp: 0 });
  const [paymentForm, setPaymentForm] = useState({ userId: '', amount: 0, type: PaymentType.LOAN_REPAYMENT });

  const currentMembers = useMemo(() => {
    if (!currentCycle) return [];
    const memberIds = cycleMembers.filter(cm => cm.cycleId === currentCycle.id).map(cm => cm.userId);
    return users.filter(u => memberIds.includes(u.id));
  }, [currentCycle, cycleMembers, users]);

  const nonMembers = useMemo(() => {
    const memberIds = cycleMembers.filter(cm => cm.cycleId === currentCycle?.id).map(cm => cm.userId);
    return users.filter(u => !memberIds.includes(u.id));
  }, [currentCycle, cycleMembers, users]);

  const handleAddMember = () => {
    if (!currentCycle || !newMemberId) return;
    const newCM: CycleMember = { cycleId: currentCycle.id, userId: newMemberId, joinedAt: Date.now() };
    setCycleMembers([...cycleMembers, newCM]);
    setIsAddMemberModal(false);
    setNewMemberId('');
    addToast('Member added to cycle', 'success');
  };

  const handleAddSaving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle || !savingForm.userId || savingForm.amount <= 0) return;
    
    const { interestPerMonth, expectedInterestAtEnd } = calculateSavingInterest(
      savingForm.amount, currentCycle.interestRate, 0, currentCycle.durationMonths
    );

    const newSaving: Saving = {
      id: Math.random().toString(36).substr(2, 9),
      cycleId: currentCycle.id,
      userId: savingForm.userId,
      amount: Number(savingForm.amount),
      interestPerMonth,
      expectedInterestAtEnd,
      date: Date.now(),
      lastUpdatedAt: Date.now(),
      createdBy: currentUser?.id || 'system',
      periodIndex: 0
    };

    setSavings([...savings, newSaving]);
    setIsAddSavingModal(false);
    setSavingForm({ userId: '', amount: 0 });
    addToast('Contribution recorded', 'success');
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle || !loanForm.userId || (loanForm.amount + loanForm.topUp) <= 0) return;
    
    // Check borrowing power
    const userSavings = savings.filter(s => s.userId === loanForm.userId && s.cycleId === currentCycle.id);
    const power = getUserBorrowingPower(userSavings, currentCycle.borrowingLimitRatio);
    const existing = getUserOutstandingLoan(loanForm.userId, currentCycle.id, loans, payments, currentCycle);

    if ((loanForm.amount + loanForm.topUp + existing) > power) {
      addToast(`Over credit limit! Max: ${currentCycle.currency}${power}`, 'error');
      return;
    }

    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      cycleId: currentCycle.id,
      userId: loanForm.userId,
      amount: Number(loanForm.amount),
      topUpAmount: Number(loanForm.topUp),
      status: LoanStatus.ACTIVE,
      date: Date.now(),
      createdAt: Date.now(),
      lastEditedAt: Date.now()
    };

    setLoans([...loans, newLoan]);
    setIsAddLoanModal(false);
    setLoanForm({ userId: '', amount: 0, topUp: 0 });
    addToast('Loan issued successfully', 'success');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle || !paymentForm.userId || paymentForm.amount <= 0) return;

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      cycleId: currentCycle.id,
      userId: paymentForm.userId,
      amount: Number(paymentForm.amount),
      type: paymentForm.type,
      date: Date.now()
    };

    setPayments([...payments, newPayment]);
    setIsAddPaymentModal(false);
    setPaymentForm({ userId: '', amount: 0, type: PaymentType.LOAN_REPAYMENT });
    addToast('Payment recorded', 'success');
  };

  if (!currentCycle) return <div className="p-12 text-center text-slate-500 font-black">Lifecycle system offline.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Activity size={18} className="text-blue-500" />
          <select value={selectedCycleId} onChange={e => setSelectedCycleId(e.target.value)} className="bg-transparent font-black text-slate-700 dark:text-white outline-none cursor-pointer text-xs uppercase tracking-widest">
            {managedCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Badge color="blue">Primary Manager: {currentUser?.name}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <Button onClick={() => setIsAddMemberModal(true)} variant="secondary" className="!p-8 !rounded-[2.5rem] shadow-lg flex-col group"><UserPlus size={32} className="group-hover:scale-110 transition-transform mb-2"/><span className="text-[10px] font-black uppercase tracking-widest">Add Member</span></Button>
         <Button onClick={() => setIsAddSavingModal(true)} variant="secondary" className="!p-8 !rounded-[2.5rem] shadow-lg flex-col group"><PiggyBank size={32} className="group-hover:scale-110 transition-transform mb-2"/><span className="text-[10px] font-black uppercase tracking-widest">Contribution</span></Button>
         <Button onClick={() => setIsAddLoanModal(true)} variant="secondary" className="!p-8 !rounded-[2.5rem] shadow-lg flex-col group"><HandCoins size={32} className="group-hover:scale-110 transition-transform mb-2"/><span className="text-[10px] font-black uppercase tracking-widest">Issue Loan</span></Button>
         <Button onClick={() => setIsAddPaymentModal(true)} variant="secondary" className="!p-8 !rounded-[2.5rem] shadow-lg flex-col group"><Receipt size={32} className="group-hover:scale-110 transition-transform mb-2"/><span className="text-[10px] font-black uppercase tracking-widest">Payment</span></Button>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <Card className="border-none shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
           <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Cycle Operations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Operation</th>
                <th className="px-6 py-4 text-right">Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...savings, ...loans, ...payments].filter(x => x.cycleId === currentCycle.id).sort((a,b) => b.date - a.date).slice(0, 10).map((act: any) => {
                const user = users.find(u => u.id === act.userId);
                return (
                  <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 text-xs font-bold dark:text-white">
                    <td className="px-6 py-4 opacity-60 font-mono">{new Date(act.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{user?.name}</td>
                    <td className="px-6 py-4 uppercase tracking-widest text-[9px]">{act.type || 'Saving'}</td>
                    <td className="px-6 py-4 text-right font-black">{currentCycle.currency}{act.amount.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODALS */}
      <Modal isOpen={isAddMemberModal} onClose={() => setIsAddMemberModal(false)} title="Provision Member">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Member</label>
               <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white">
                  <option value="">Choose User...</option>
                  {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
               </select>
            </div>
            <Button onClick={handleAddMember} className="w-full" disabled={!newMemberId}>Onboard Member</Button>
         </div>
      </Modal>

      <Modal isOpen={isAddSavingModal} onClose={() => setIsAddSavingModal(false)} title="Record Contribution">
         <form onSubmit={handleAddSaving} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Member</label>
               <select value={savingForm.userId} onChange={e => setSavingForm({...savingForm, userId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white" required>
                  <option value="">Choose Member...</option>
                  {currentMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
            </div>
            <Input label={`Amount (${currentCycle.currency})`} type="number" value={savingForm.amount || ''} onChange={e => setSavingForm({...savingForm, amount: Number(e.target.value)})} required />
            <Button type="submit" className="w-full">Confirm Deposit</Button>
         </form>
      </Modal>

      <Modal isOpen={isAddLoanModal} onClose={() => setIsAddLoanModal(false)} title="Disburse Credit">
         <form onSubmit={handleAddLoan} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Beneficiary</label>
               <select value={loanForm.userId} onChange={e => setLoanForm({...loanForm, userId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white" required>
                  <option value="">Choose Beneficiary...</option>
                  {currentMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Principal Amount" type="number" value={loanForm.amount || ''} onChange={e => setLoanForm({...loanForm, amount: Number(e.target.value)})} required />
              <Input label="Top-Up Amount" type="number" value={loanForm.topUp || ''} onChange={e => setLoanForm({...loanForm, topUp: Number(e.target.value)})} />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
               <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Estimated Interest</p>
               <p className="text-xl font-black text-blue-600">{currentCycle.currency}{((loanForm.amount + loanForm.topUp) * currentCycle.interestRate).toLocaleString()}</p>
            </div>
            <Button type="submit" className="w-full">Release Capital</Button>
         </form>
      </Modal>

      <Modal isOpen={isAddPaymentModal} onClose={() => setIsAddPaymentModal(false)} title="Record Transaction">
         <form onSubmit={handleAddPayment} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payer</label>
               <select value={paymentForm.userId} onChange={e => setPaymentForm({...paymentForm, userId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white" required>
                  <option value="">Choose Member...</option>
                  {currentMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</label>
               <select value={paymentForm.type} onChange={e => setPaymentForm({...paymentForm, type: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl outline-none font-bold text-sm dark:text-white">
                  <option value={PaymentType.LOAN_REPAYMENT}>Loan Repayment</option>
                  <option value={PaymentType.MEMBERSHIP_FEE}>Membership Fee</option>
                  <option value={PaymentType.PENALTY}>Penalty</option>
                  <option value={PaymentType.LOSS_RECOVERY}>Loss Recovery</option>
               </select>
            </div>
            <Input label="Payment Amount" type="number" value={paymentForm.amount || ''} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} required />
            <Button type="submit" className="w-full">Verify & Commit</Button>
         </form>
      </Modal>
    </div>
  );
};