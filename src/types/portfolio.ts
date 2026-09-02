export type PortfolioType =
  | "wealthgoal"
  | "wealthfix"
  | "wealthflex"
  | "wealthfam"
  | "wealthflow";

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  balance: string; // in kobo
  interestRate: number;
  targetAmount: string; // in kobo
  maturityDate: string; // ISODate
  type: string;
  createdAt: string; // ISODate
  status: string;
  dailyGrowth?: string | number; // in kobo
  totalYieldEarned?: string | number; // in kobo
  metadata?: any;
}

export interface CreatePortfolioRequest {
  name: string;
  amount: number; // initial amount
  targetAmount?: number;
  maturityDate?: string;
  autoSaveEnabled?: boolean;
  autoSaveFrequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  autoSaveAmount?: number;
  autoSaveSource?: "WALLET" | "CARD";
  nextAutoSaveDate?: string;
  metadata?: any;
}

export interface TopUpRequest {
  amount: number;
  source: "WALLET" | "CARD";
  paymentMethodId?: string;
  redirectUrl?: string;
}

export interface WithdrawToWalletRequest {
  amount: number;
  pin: string;
}

export interface TerminateRequest {
  pin: string;
}

export interface PortfolioTransaction {
  id: string;
  portfolioId: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  createdAt: string;
}

export interface TransferPortfolioFundsRequest {
  amount: number;
  destinationType: "WALLET" | "PORTFOLIO" | "BANK";
  destinationId?: string;
  bankDetails?: {
    accountNumber: string;
    bankCode: string;
  };
  pin: string;
}

