export interface PaymentIntentRequest {
  userId: string;
  amountKobo: string;
  provider: "PAYSTACK" | string;
  channel: "WEB" | string;
  redirectUrl: string;
  email: string;
  idempotencyKey?: string;
}

export interface PaymentIntentResponse {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  provider: string;
  channel: string;
  purpose: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | string;
  walletId?: string | null;
  providerRef?: string | null;
  providerTxn?: string | null;
  providerFee?: number;
  idempotencyKey?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
  checkoutUrl?: string;
}

export interface MandateLinkRequest {
  userId: string;
  channel: "WEB" | string;
  email: string;
  redirectUrl: string;
  idempotencyKey?: string;
}

export interface MandateLinkResponse {
  id: string;
  checkoutUrl?: string;
  providerRef?: string | null;
}

export interface Mandate {
  id: string;
  userId: string;
  provider: string;
  channel: string;
  isDefault: boolean;
  lastFour?: string;
  brand?: string;
  holderName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChargeMandateRequest {
  userId: string;
  paymentMethodId: string;
  amountKobo: string;
  channel: "WEB" | string;
  walletId?: string;
  idempotencyKey?: string;
}

export interface VirtualAccountRequest {
  userId: string;
  email: string;
  name: string;
}
