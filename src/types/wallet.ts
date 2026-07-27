export interface KeysetPagination<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface WalletSummary {
  id: string;
  userId: string;
  currentBalance: string; // String amounts in kobo
  reservedBalance: string;
  status: string; // ACTIVE
  accountNumber: any;
  accountName: any;
  bankName: any;
  bankSlug: any;
  bankCode: any;
  provider: any;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  amount: string; // amount is a string in kobo
  type: "CREDIT" | "DEBIT";
  reason: "REFERRAL_CREDIT" | "WITHDRAWAL" | "OTHER" | "WALLET_TOPUP";
  action: string;
  reference: string;
  createdAt: string;
  description: any;
  orderId: any;
  orderCode: any;
  metadata: any;
}

export interface WalletHold {
  id: string;
  amount: string;
  reason: string;
  status: "ACTIVE" | "RELEASED" | "CONVERTED";
  action: string;
  reference: string;
  createdAt: string;
  releasedAt: any;
  convertedAt: any;
}

export interface PayoutBank {
  name: string;
  code: string;
  active: boolean;
}

export interface PayoutAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  provider: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  payoutAccountId: string;
  portfolioId: string;
  walletId: string;
  amount: string;
  provider: string;
  status: string;
  failureReason: string;
  createdAt: string;
  updatedAt: string;
}
