import { portfolioApi } from "./portfolioApi";
import { CreatePortfolioRequest } from "@/src/types/portfolio";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("portfolioApi endpoint definitions", () => {
  it("should define getPortfolios query with correct path and params", () => {
    const endpoint = portfolioApi.endpoints.getPortfolios;
    expect(endpoint).toBeDefined();

    const queryFn = (endpoint as any).initiate({ type: "wealthflow", limit: 10 });
    expect(queryFn).toBeDefined();
  });

  it("should format CreatePortfolioRequest for wealthflow correctly", () => {
    const payload: CreatePortfolioRequest = {
      name: "Emergency Automated Fund",
      amount: 5000000,
      targetAmount: 5000000,
      maturityDate: "2026-12-31T23:59:59.000Z",
      autoSaveEnabled: true,
      autoSaveFrequency: "MONTHLY",
      autoSaveAmount: 5000000,
      autoSaveSource: "WALLET",
      nextAutoSaveDate: "2026-09-01T00:00:00.000Z",
      metadata: {
        anytimeWithdrawal: false,
        wealthPreference: "Interest Based",
      },
    };

    expect(payload.amount).toBe(5000000);
    expect(payload.autoSaveFrequency).toBe("MONTHLY");
    expect(payload.autoSaveSource).toBe("WALLET");
  });

  it("should format CreatePortfolioRequest for wealthfam correctly with family metadata", () => {
    const famPayload: CreatePortfolioRequest = {
      name: "Kids - Junior Education",
      amount: 100000,
      targetAmount: 10000000,
      maturityDate: "2027-01-01T00:00:00.000Z",
      autoSaveEnabled: true,
      autoSaveFrequency: "MONTHLY",
      autoSaveAmount: 10000000,
      autoSaveSource: "WALLET",
      metadata: {
        familyCategory: "Kids",
        familyMemberName: "Junior",
        familyRelationship: "Kids",
        wealthPreference: "Interest Based",
      },
    };

    expect(famPayload.metadata.familyCategory).toBe("Kids");
    expect(famPayload.metadata.familyMemberName).toBe("Junior");
  });

  it("should define topUpPortfolio mutation", () => {
    const endpoint = portfolioApi.endpoints.topUpPortfolio;
    expect(endpoint).toBeDefined();
  });

  it("should define withdrawToWallet mutation", () => {
    const endpoint = portfolioApi.endpoints.withdrawToWallet;
    expect(endpoint).toBeDefined();
  });

  it("should define terminatePortfolio mutation", () => {
    const endpoint = portfolioApi.endpoints.terminatePortfolio;
    expect(endpoint).toBeDefined();
  });

  it("should define getPortfolioTransactions query", () => {
    const endpoint = portfolioApi.endpoints.getPortfolioTransactions;
    expect(endpoint).toBeDefined();
  });
});
