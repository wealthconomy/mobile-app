/**
 * Bank API Service
 * Fetches real-time bank data from Paystack.
 */

export interface Bank {
  id: number;
  name: string;
  code: string;
  slug: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackBankResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

export const bankService = {
  /**
   * Fetches the list of Nigerian banks from Paystack public API.
   */
  fetchBanks: async (): Promise<Bank[]> => {
    const FALLBACK_BANKS: Partial<Bank>[] = [
      { id: 1, name: "Opay (Paycom)", code: "999992" },
      { id: 2, name: "Kuda Bank", code: "090267" },
      { id: 3, name: "First Bank of Nigeria", code: "011" },
      { id: 4, name: "Guaranty Trust Bank", code: "058" },
      { id: 5, name: "Zenith Bank", code: "057" },
      { id: 6, name: "United Bank For Africa", code: "033" },
      { id: 7, name: "Access Bank", code: "044" },
      { id: 8, name: "Moniepoint MFB", code: "50515" },
      { id: 9, name: "PalmPay", code: "999991" },
      { id: 10, name: "Fidelity Bank", code: "070" },
      { id: 11, name: "Stanbic IBTC Bank", code: "221" },
      { id: 12, name: "Sterling Bank", code: "232" },
      { id: 13, name: "Union Bank of Nigeria", code: "032" },
      { id: 14, name: "Wema Bank", code: "035" },
      { id: 15, name: "VFD Microfinance Bank", code: "566" },
    ];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s

      const response = await fetch(
        "https://api.paystack.co/bank?country=nigeria&perPage=100",
        { signal: controller.signal },
      );
      clearTimeout(timeoutId);

      const result: PaystackBankResponse = await response.json();

      if (!result.status) {
        throw new Error(result.message || "Failed to fetch banks");
      }

      return result.data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.warn("Using fallback banks due to fetch error:", error);
      // Sort fallback banks alphabetically too
      return (FALLBACK_BANKS as Bank[]).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }
  },

  /**
   * Simulates resolving an account name from a bank code and account number.
   * In a real app, this would call Paystack's /bank/resolve endpoint.
   */
  resolveAccount: async (
    accountNumber: string,
    bankCode: string,
  ): Promise<string> => {
    await new Promise((res) => setTimeout(res, 1000)); // Simulate network lag

    // Mock logic: return a dummy name for specific numbers, or a default
    const names = [
      "CHIZOBA ANTHONY NWOSU",
      "FATIMA ZAHRA ABUBAKAR",
      "OLUWASEUN ADEYEMI",
      "BLESSING EGBE",
      "IBRAHIM HASSAN",
      "NGOZI EZE",
      "BABATUNDE OLAREWAJU",
      "CHUKWUDI OKEKE",
    ];

    if (accountNumber === "0123456789") return "ADAMU CHUKWUMA OKORO";
    if (accountNumber === "9876543210") return "FADEKE MODUPEOLA";

    // Use a hash of the account number to pick a deterministic name from the list
    let hash = 0;
    for (let i = 0; i < accountNumber.length; i++) {
      hash = (hash << 5) - hash + accountNumber.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % names.length;
    return names[index];
  },
};
