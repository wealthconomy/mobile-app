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
}

export interface WithdrawToWalletRequest {
  amount: number;
  pin: string;
}

export interface TerminateRequest {
  pin: string;
}
