import {
  cleanNarrativeText,
  formatPortfolioType,
  getCleanTransactionNarrative,
  getCleanTransactionTitle,
} from "./formatters";

describe("formatters - cleanNarrativeText and transaction narratives", () => {
  it("cleans raw WealthFam portfolio creation narrative with category and dash", () => {
    const raw = "Funded WEALTH_FAM portfolio: Kids - Sharon";
    const result = cleanNarrativeText(raw);
    expect(result).toBe("Funded WealthFam Portfolio: Kids (Sharon)");
    expect(result).not.toContain("_");
    expect(result).not.toContain(" - ");
  });

  it("cleans other family categories like Spouse, Parent, Sibling, Others", () => {
    expect(cleanNarrativeText("Funded WEALTH_FAM portfolio: Spouse - Mark")).toBe(
      "Funded WealthFam Portfolio: Spouse (Mark)"
    );
    expect(cleanNarrativeText("Top up for WEALTH_FAM portfolio: Parent - Mom")).toBe(
      "Top-up for WealthFam Portfolio: Parent (Mom)"
    );
  });

  it("cleans standard portfolios like WealthGoal, WealthFix, WealthFlex", () => {
    expect(cleanNarrativeText("Funded WEALTH_GOAL portfolio: New Car")).toBe(
      "Funded WealthGoal Portfolio: New Car"
    );
    expect(cleanNarrativeText("Funded WEALTH_FIX portfolio: Fixed 100k")).toBe(
      "Funded WealthFix Portfolio: Fixed 100k"
    );
    expect(cleanNarrativeText("Funded WEALTH_FLEX portfolio: My Flex")).toBe(
      "Funded WealthFlex Portfolio: My Flex"
    );
    expect(cleanNarrativeText("Funded WEALTH_FLOW portfolio: Emergency Stash")).toBe(
      "Funded WealthFlow Portfolio: Emergency Stash"
    );
    expect(cleanNarrativeText("Funded WEALTH_GROUP portfolio: Investment Club")).toBe(
      "Funded WealthGroup Portfolio: Investment Club"
    );
  });

  it("cleans standalone uppercase enums with underscores", () => {
    expect(cleanNarrativeText("PORTFOLIO_CREATION")).toBe("Portfolio Funding");
    expect(cleanNarrativeText("WALLET_TOPUP")).toBe("Wallet Top-up");
    expect(cleanNarrativeText("REFERRAL_CREDIT")).toBe("Referral Reward");
    expect(cleanNarrativeText("SAVINGS_INTEREST")).toBe("Savings Interest");
  });

  it("cleans transaction title and narrative for transaction receipt", () => {
    const tx = {
      description: "Funded WEALTH_FAM portfolio: Kids - Sharon",
      reference: "PORTFOLIO_CREATION_b123456",
      reason: "OTHER",
      type: "DEBIT",
    };

    expect(getCleanTransactionTitle(tx)).toBe(
      "Funded WealthFam Portfolio: Kids (Sharon)"
    );
    expect(getCleanTransactionNarrative(tx)).toBe(
      "Funded WealthFam Portfolio: Kids (Sharon)"
    );
  });

  it("formats portfolio types cleanly without underscores", () => {
    expect(formatPortfolioType("WEALTH_GOAL")).toBe("Wealth Goal");
    expect(formatPortfolioType("Wealth_goal")).toBe("Wealth Goal");
    expect(formatPortfolioType("WEALTH_FIX")).toBe("Wealth Fix");
    expect(formatPortfolioType("WEALTH_FAM")).toBe("Wealth Fam");
    expect(formatPortfolioType("WEALTH_FLOW")).toBe("Wealth Flow");
    expect(formatPortfolioType("WEALTH_FLEX")).toBe("Wealth Flex");
    expect(formatPortfolioType("WEALTH_GROUP")).toBe("Wealth Group");
  });
});
