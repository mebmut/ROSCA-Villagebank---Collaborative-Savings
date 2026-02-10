export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum CycleFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum PaymentType {
  MEMBERSHIP_FEE = 'MEMBERSHIP_FEE',
  PENALTY = 'PENALTY',
  LOSS_RECOVERY = 'LOSS_RECOVERY',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  password?: string;
  // New Profile Fields
  phone?: string;
  address?: string;
  employmentStatus?: string;
  employmentAddress?: string;
  profileImage?: string; // base64
  coverImage?: string; // base64
  nrcDoc?: string; // base64 (National Registration Card)
  passportDoc?: string; // base64
}

export interface HeroSlide {
  id: string;
  url: string;
  caption: string;
  subcaption: string;
}

export interface AppSettings {
  siteName: string;
  serviceFee: number;
  theme: 'light' | 'dark';
  defaultCurrency: string;
  heroSlides: HeroSlide[];
  slideTransition: 'fade' | 'slide';
  slideInterval: number; // in milliseconds
}

export interface Cycle {
  id: string;
  name: string;
  managerIds: string[];
  interestRate: number;
  durationMonths: number;
  frequency: CycleFrequency;
  savingMin: number;
  savingMax: number;
  membershipFee: number;
  borrowingLimitRatio: number;
  capital: number;
  currency: string;
  isLocked: boolean;
  createdAt: number;
}

export interface CycleMember {
  cycleId: string;
  userId: string;
  joinedAt: number;
}

export interface Saving {
  id: string;
  cycleId: string;
  userId: string;
  amount: number;
  interestPerMonth: number;
  expectedInterestAtEnd: number;
  date: number;
  lastUpdatedAt: number;
  createdBy: string;
  periodIndex: number;
}

export interface Loan {
  id: string;
  cycleId: string;
  userId: string;
  amount: number;
  topUpAmount: number;
  status: LoanStatus;
  date: number;
  createdAt: number;
  lastEditedAt: number;
}

export interface Payment {
  id: string;
  cycleId: string;
  userId: string;
  type: PaymentType;
  amount: number;
  date: number;
}

export interface LossRecovery {
  id: string;
  cycleId: string;
  totalLoss: number;
  sharedPerUser: number;
  date: number;
}
