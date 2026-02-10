
import { Cycle, Saving, Loan, Payment, LossRecovery, PaymentType, LoanStatus, User } from '../types';

/**
 * Checks if a user has paid the membership fee for a specific cycle.
 */
export const isMembershipPaid = (
  userId: string,
  cycleId: string,
  allPayments: Payment[]
) => {
  return allPayments.some(
    p => p.userId === userId && p.cycleId === cycleId && p.type === PaymentType.MEMBERSHIP_FEE
  );
};

/**
 * Calculates current capital for a cycle:
 * Capital = (Total Savings + Total Payments) - Total Loans Issued
 */
export const calculateCycleCapital = (
  cycleId: string,
  allSavings: Saving[],
  allLoans: Loan[],
  allPayments: Payment[]
) => {
  const cycleSavings = allSavings.filter(s => s.cycleId === cycleId);
  const cycleLoans = allLoans.filter(l => l.cycleId === cycleId);
  const cyclePayments = allPayments.filter(p => p.cycleId === cycleId);

  const totalSavings = cycleSavings.reduce((sum, s) => sum + s.amount, 0);
  const totalPayments = cyclePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalLoansDisbursed = cycleLoans.reduce((sum, l) => sum + l.amount + l.topUpAmount, 0);

  return Math.max(0, (totalSavings + totalPayments) - totalLoansDisbursed);
};

export const calculateSavingInterest = (
  amount: number,
  rate: number,
  periodIndex: number, // 0-indexed month within the cycle
  totalDuration: number
) => {
  const multiplier = totalDuration - periodIndex;
  const expectedInterestAtEnd = amount * (rate * multiplier);
  const interestPerMonth = expectedInterestAtEnd / multiplier;
  return { interestPerMonth, expectedInterestAtEnd };
};

export const getUserBorrowingPower = (
  userSavings: Saving[],
  limitRatio: number
) => {
  const totalSaved = userSavings.reduce((sum, s) => sum + s.amount, 0);
  if (limitRatio === 0) return Infinity;
  return totalSaved * limitRatio;
};

export const calculateGroupLossRecovery = (
  unborrowedCapital: number,
  interestRate: number,
  memberCount: number
) => {
  if (memberCount === 0) return 0;
  const totalLostInterest = unborrowedCapital * interestRate;
  return totalLostInterest / memberCount;
};

/**
 * Calculates detailed loan financials including Interest and Overdue status.
 * All loans are assumed to be 1-month (30 days) duration.
 */
export const getLoanDetails = (
  loan: Loan,
  cycle: Cycle,
  allPayments: Payment[]
) => {
  const principal = loan.amount + loan.topUpAmount;
  const interest = principal * cycle.interestRate;
  const payable = principal + interest;
  
  const totalRepaid = allPayments
    .filter(p => p.userId === loan.userId && p.cycleId === loan.cycleId && p.type === PaymentType.LOAN_REPAYMENT)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const balance = Math.max(0, payable - totalRepaid);
  
  // Status Logic: 30 days limit
  const isPaid = balance <= 0.01;
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  const isOverdue = !isPaid && (Date.now() > loan.createdAt + oneMonthMs);
  
  let status = loan.status;
  if (isPaid) status = LoanStatus.PAID;
  else if (isOverdue && status !== LoanStatus.PAID) status = LoanStatus.OVERDUE;

  return {
    principal,
    interest,
    payable,
    balance,
    status,
    isOverdue,
    totalRepaid
  };
};

export const getUserOutstandingLoan = (
  userId: string,
  cycleId: string,
  allLoans: Loan[],
  allPayments: Payment[],
  cycle: Cycle
) => {
  const userLoans = allLoans.filter(l => l.userId === userId && l.cycleId === cycleId && l.status !== LoanStatus.PAID);
  return userLoans.reduce((sum, l) => {
    const details = getLoanDetails(l, cycle, allPayments);
    return sum + details.balance;
  }, 0);
};

export const getUserOutstandingLoss = (
  userId: string,
  cycleId: string,
  allLosses: LossRecovery[],
  allPayments: Payment[]
) => {
  const totalLossLiability = allLosses
    .filter(l => l.cycleId === cycleId)
    .reduce((sum, l) => sum + l.sharedPerUser, 0);
  
  const totalLossPaid = allPayments
    .filter(p => p.userId === userId && p.cycleId === cycleId && p.type === PaymentType.LOSS_RECOVERY)
    .reduce((sum, p) => sum + p.amount, 0);
  
  return Math.max(0, totalLossLiability - totalLossPaid);
};

export const calculatePayout = (
  cycle: Cycle,
  userSavings: Saving[],
  userLoans: Loan[],
  userPayments: Payment[],
  userLosses: LossRecovery[],
  memberCount: number
) => {
  const totalSaved = userSavings.reduce((sum, s) => sum + s.amount, 0);
  const totalInterest = userSavings.reduce((sum, s) => sum + s.expectedInterestAtEnd, 0);
  
  const loanBalance = userLoans.reduce((sum, l) => {
    const details = getLoanDetails(l, cycle, userPayments);
    return sum + details.balance;
  }, 0);

  const totalLossLiability = userLosses.reduce((sum, l) => sum + l.sharedPerUser, 0);
  const totalLossPaid = userPayments
    .filter(p => p.type === PaymentType.LOSS_RECOVERY)
    .reduce((sum, p) => sum + p.amount, 0);
  const unpaidLoss = Math.max(0, totalLossLiability - totalLossPaid);

  return {
    totalSaved,
    totalInterest,
    loanBalance,
    unpaidLoss,
    netPayout: (totalSaved + totalInterest) - (loanBalance + unpaidLoss)
  };
};

export const calculateMemberShareOut = (
  userId: string,
  cycle: Cycle,
  allSavings: Saving[],
  allLoans: Loan[],
  allPayments: Payment[],
  allLosses: LossRecovery[],
  memberCount: number
) => {
  const userSavings = allSavings.filter(s => s.userId === userId && s.cycleId === cycle.id);
  const userLoans = allLoans.filter(l => l.userId === userId && l.cycleId === cycle.id);
  const userPayments = allPayments.filter(p => p.userId === userId && p.cycleId === cycle.id);
  const userLosses = allLosses.filter(l => l.cycleId === cycle.id);

  return calculatePayout(cycle, userSavings, userLoans, userPayments, userLosses, memberCount);
};
