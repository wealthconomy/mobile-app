/**
 * Payment API Service
 * Handles deposit and withdrawal (transfer) actions.
 * Currently uses mock delays to simulate network requests.
 */

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface DepositRequest {
  amount: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  pin: string;
}

export interface TransferRequest {
  amount: string;
  accountNumber: string;
  bankName: string;
  narrative?: string;
}

export const paymentService = {
  /**
   * Simulates a deposit request via card.
   */
  depositViaCard: async (
    data: DepositRequest,
  ): Promise<{ success: boolean; message: string }> => {
    console.log("Processing deposit:", data);
    await delay(1500); // Simulate network lag
    return {
      success: true,
      message: "Funds deposited successfully",
    };
  },

  /**
   * Simulates a fund transfer request.
   */
  transferFunds: async (
    data: TransferRequest,
  ): Promise<{ success: boolean; message: string }> => {
    console.log("Processing transfer:", data);
    await delay(1500); // Simulate network lag
    return {
      success: true,
      message: "Funds transferred successfully",
    };
  },
};
