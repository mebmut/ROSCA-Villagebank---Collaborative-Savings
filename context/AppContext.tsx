import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Cycle, Saving, Loan, Payment, LossRecovery, 
  UserRole, AppSettings, CycleMember, CycleFrequency 
} from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  cycles: Cycle[];
  setCycles: React.Dispatch<React.SetStateAction<Cycle[]>>;
  cycleMembers: CycleMember[];
  setCycleMembers: React.Dispatch<React.SetStateAction<CycleMember[]>>;
  savings: Saving[];
  setSavings: React.Dispatch<React.SetStateAction<Saving[]>>;
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  losses: LossRecovery[];
  setLosses: React.Dispatch<React.SetStateAction<LossRecovery[]>>;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to load from localStorage
const load = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load initial states from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => load('vb_settings', {
    siteName: "VILLAGE BANK PLATFORM",
    serviceFee: 5,
    theme: 'dark',
    defaultCurrency: 'USD',
    slideTransition: 'fade',
    slideInterval: 5000,
    heroSlides: [
      { id: '1', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80', caption: 'Smarter Money\nFor Your Circle.', subcaption: 'Grow your wealth through collective savings.' },
      { id: '2', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', caption: 'Secure Your\nCollective Future.', subcaption: 'Advanced encryption for your peace of mind.' },
      { id: '3', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', caption: 'Prosper Together\nIn Unity.', subcaption: 'Access credit when you need it most.' }
    ]
  }));

  const [users, setUsers] = useState<User[]>(() => load('vb_users', [
    { id: '1', name: 'Super Admin', email: 'admin@villagebank.com', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER], password: 'password123' },
    { id: '2', name: 'John Manager', email: 'john@bank.com', roles: [UserRole.MANAGER, UserRole.USER], password: 'password123' },
    { id: '3', name: 'Alice User', email: 'alice@bank.com', roles: [UserRole.USER], password: 'password123' },
    { id: '4', name: 'Bob User', email: 'bob@bank.com', roles: [UserRole.USER], password: 'password123' },
  ]));

  const [cycles, setCycles] = useState<Cycle[]>(() => load('vb_cycles', [
    { 
      id: 'c1', name: 'Growth Savings Group', managerIds: ['2', '1'], 
      interestRate: 0.1, durationMonths: 6, frequency: CycleFrequency.MONTHLY,
      savingMin: 100, savingMax: 5000, membershipFee: 50, borrowingLimitRatio: 3, 
      capital: 10000, currency: 'USD', isLocked: false, createdAt: Date.now() 
    }
  ]));

  const [cycleMembers, setCycleMembers] = useState<CycleMember[]>(() => load('vb_cycle_members', [
    { cycleId: 'c1', userId: '2', joinedAt: Date.now() },
    { cycleId: 'c1', userId: '3', joinedAt: Date.now() },
    { cycleId: 'c1', userId: '4', joinedAt: Date.now() },
    { cycleId: 'c1', userId: '1', joinedAt: Date.now() },
  ]));

  const [savings, setSavings] = useState<Saving[]>(() => load('vb_savings', []));
  const [loans, setLoans] = useState<Loan[]>(() => load('vb_loans', []));
  const [payments, setPayments] = useState<Payment[]>(() => load('vb_payments', []));
  const [losses, setLosses] = useState<LossRecovery[]>(() => load('vb_losses', []));

  // Persistence Sync
  useEffect(() => localStorage.setItem('vb_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('vb_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('vb_cycles', JSON.stringify(cycles)), [cycles]);
  useEffect(() => localStorage.setItem('vb_cycle_members', JSON.stringify(cycleMembers)), [cycleMembers]);
  useEffect(() => localStorage.setItem('vb_savings', JSON.stringify(savings)), [savings]);
  useEffect(() => localStorage.setItem('vb_loans', JSON.stringify(loans)), [loans]);
  useEffect(() => localStorage.setItem('vb_payments', JSON.stringify(payments)), [payments]);
  useEffect(() => localStorage.setItem('vb_losses', JSON.stringify(losses)), [losses]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      users, setUsers,
      cycles, setCycles,
      cycleMembers, setCycleMembers,
      savings, setSavings,
      loans, setLoans,
      payments, setPayments,
      losses, setLosses,
      settings, setSettings,
      theme, toggleTheme,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};