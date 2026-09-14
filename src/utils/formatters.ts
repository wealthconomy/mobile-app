/**
 * Converts a kobo numeric value or string to formatted Naira (e.g. 200000 -> ₦2,000.00).
 */
export const formatKoboAmount = (val: number | string): string => {
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]/g, "")) : val;
  if (isNaN(num)) return String(val);
  const isNegative = num < 0;
  const naira = Math.abs(num) / 100;
  return `${isNegative ? "-" : ""}₦${naira.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Detects amounts in kobo (e.g., "(Penalty: 13750 kobo)", "200000 kobo completed", "Transfer 200000", "₦200000") and converts them to Naira (e.g., "₦2,000.00").
 */
export const formatCurrencyInText = (text?: string): string => {
  if (!text) return "";
  
  let formatted = text;

  // Clean up raw referral reward descriptions with kobo or bare numbers: "referral reward :50000", "Referral reward: 50000", "referral reward : 50000", etc.
  formatted = formatted.replace(/\breferral\s+(?:reward|bonus|credit)\s*:\s*\d+(?:\.\d+)?(?:\s*kobos?)?/gi, "Referral Reward");
  formatted = formatted.replace(/\breferral\s+(?:reward|bonus|credit)\s*:\s*₦\s*[\d,]+(?:\.\d+)?/gi, "Referral Reward");

  // Also if text is just "referral reward" or "referral bonus" or "referral credit", make it title-cased "Referral Reward"
  if (/^referral\s+(?:reward|bonus|credit)$/i.test(formatted.trim())) {
    return "Referral Reward";
  }

  // 1. Handle "₦200000" or "₦ 200000" (raw integer after ₦ without commas or decimals)
  formatted = formatted.replace(/₦\s*(\d{3,})\b(?!\s*[\.,]\d)/g, (_, rawKoboStr) => {
    const kobo = parseFloat(rawKoboStr);
    if (isNaN(kobo)) return `₦${rawKoboStr}`;
    const naira = kobo / 100;
    return `₦${naira.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  });

  // 2. Explicit kobo e.g. "200000 kobo" -> "₦2,000.00"
  formatted = formatted.replace(/\b(\d+(?:\.\d+)?)\s*kobos?\b/gi, (_, koboStr) => {
    const kobo = parseFloat(koboStr);
    if (isNaN(kobo)) return `${koboStr} kobo`;
    const naira = kobo / 100;
    return `₦${naira.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  });

  // 3. Bare 4+ digit integers not preceded by ₦ or $ and not followed by % or date separators (e.g. 200000 in text)
  formatted = formatted.replace(/(?<![₦$\d,])\b(\d{4,})\b(?!\s*%|\s*:\s*\d|\s*-[0-1]\d)/g, (_, bareNumStr) => {
    const kobo = parseFloat(bareNumStr);
    if (isNaN(kobo)) return bareNumStr;
    const naira = kobo / 100;
    return `₦${naira.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  });

  return formatted;
};

/** Converts camelCase or snake_case keys into readable labels, stripping trailing kobo indicator if present */
export function formatMetadataKey(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/[_-]?kobo$/i, "");
  if (cleaned.toLowerCase() === "id") return "ID";
  if (cleaned.toLowerCase().endsWith("id") && cleaned.length > 2) {
    const base = cleaned.slice(0, -2);
    return `${base.charAt(0).toUpperCase() + base.slice(1)} ID`;
  }
  return cleaned
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/** Formats a metadata value, converting any kobo amounts, rates, or currency text to clean Naira strings */
export function formatMetadataValue(key: string, val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);

  const strVal = String(val).trim();
  const lowerKey = key.toLowerCase();

  // If value already has kobo in it (e.g. "50000 kobo")
  if (/\b\d+(?:\.\d+)?\s*kobos?\b/i.test(strVal)) {
    return formatCurrencyInText(strVal);
  }

  // If key represents a percentage rate (e.g. interestRate: 12)
  if (lowerKey.includes("rate") || lowerKey.includes("percent")) {
    return strVal.endsWith("%") ? strVal : `${strVal}%`;
  }

  // If key represents monetary value typically stored in kobo
  const isMonetaryKey =
    lowerKey.includes("kobo") ||
    lowerKey.includes("amount") ||
    lowerKey.includes("interest") ||
    lowerKey.includes("balance") ||
    lowerKey.includes("penalty") ||
    lowerKey.includes("fee") ||
    lowerKey.includes("reward") ||
    lowerKey.includes("principal") ||
    lowerKey.includes("yield") ||
    lowerKey.includes("transfer") ||
    lowerKey === "credit" ||
    lowerKey === "debit";

  if (isMonetaryKey) {
    const cleanedNum = parseFloat(strVal.replace(/[^0-9.-]/g, ""));
    if (!isNaN(cleanedNum) && !strVal.startsWith("₦") && !strVal.startsWith("$")) {
      return formatKoboAmount(cleanedNum);
    }
  }

  return formatCurrencyInText(strVal);
}

/**
 * Returns a human-friendly title for a transaction given its reason, description, reference, and metadata.
 */
export const getCleanTransactionTitle = (
  tx?: {
    reason?: string;
    description?: string;
    reference?: string;
    metadata?: any;
    type?: string;
    action?: string;
  },
  defaultSourceName?: string
): string => {
  if (!tx) return "Transaction";

  const desc = (tx.description || "").trim();
  const ref = (tx.reference || "").trim();
  const action = (tx.action || "").trim();
  const reason = (tx.reason || "").trim();
  const meta = tx.metadata || {};

  const isTransfer =
    ref.toUpperCase().includes("TRANSFER") ||
    action.toUpperCase().includes("TRANSFER") ||
    reason.toUpperCase().includes("TRANSFER") ||
    desc.toLowerCase().includes("transfer");

  if (isTransfer) {
    const fromName =
      meta.sourceName ||
      meta.fromName ||
      meta.sourcePortfolioName ||
      meta.source ||
      defaultSourceName;

    const toName =
      meta.destinationName ||
      meta.toName ||
      meta.destPortfolioName ||
      meta.targetName ||
      meta.destination;

    // 1. If metadata has both source and destination names
    if (fromName && toName) {
      return `Portfolio Transfer from ${fromName} to ${toName}`;
    }

    // 2. Parse "from X to Y" out of description string (e.g. "Transfer from WealthFix to WealthGoal" or "Transfer 50000 kobo from WealthFix to WealthGoal")
    const fromToMatch = desc.match(/transfer(?:.*?)(?:from\s+(.+?)\s+to\s+(.+?)|to\s+(.+?)\s+from\s+(.+?))$/i);
    if (fromToMatch) {
      const parsedFrom = (fromToMatch[1] || fromToMatch[4] || fromName)?.trim();
      const parsedTo = (fromToMatch[2] || fromToMatch[3] || toName)?.trim();
      if (parsedFrom && parsedTo) {
        return `Portfolio Transfer from ${formatCurrencyInText(parsedFrom)} to ${formatCurrencyInText(parsedTo)}`;
      }
    }

    // 3. Parse "to Y" from description
    const toMatch = desc.match(/transfer(?:.*?)\s+to\s+(.+)$/i);
    if (toMatch && toMatch[1]) {
      const parsedTo = formatCurrencyInText(toMatch[1].trim());
      if (fromName) {
        return `Portfolio Transfer from ${fromName} to ${parsedTo}`;
      }
      return `Portfolio Transfer to ${parsedTo}`;
    }

    // 4. Parse "from X" from description
    const fromMatch = desc.match(/transfer(?:.*?)\s+from\s+(.+)$/i);
    if (fromMatch && fromMatch[1]) {
      const parsedFrom = formatCurrencyInText(fromMatch[1].trim());
      if (toName) {
        return `Portfolio Transfer from ${parsedFrom} to ${toName}`;
      }
      return `Portfolio Transfer from ${parsedFrom}`;
    }

    if (fromName) {
      return `Portfolio Transfer from ${fromName}`;
    }

    if (desc) {
      const cleanDesc = formatCurrencyInText(desc);
      if (cleanDesc.toLowerCase().startsWith("portfolio transfer")) {
        return cleanDesc;
      }
      return `Portfolio Transfer: ${cleanDesc}`;
    }

    return "Portfolio Transfer";
  }

  if (
    ref.startsWith("PORTFOLIO_TERMINATE") ||
    desc.toLowerCase().includes("terminated portfolio") ||
    desc.toLowerCase().includes("terminated fixed fund")
  ) {
    return "Portfolio Termination Refund";
  }

  if (
    ref.startsWith("PORTFOLIO_TOPUP") ||
    desc.toLowerCase().includes("portfolio top-up") ||
    desc.toLowerCase().includes("portfolio top up")
  ) {
    return "Portfolio Top-up";
  }

  if (
    ref.startsWith("PORTFOLIO_WITHDRAW") ||
    desc.toLowerCase().includes("portfolio withdraw")
  ) {
    return "Portfolio Withdrawal";
  }

  // Referral Reward
  const isReferral =
    reason.toUpperCase().includes("REFERRAL") ||
    ref.toUpperCase().includes("REFERRAL") ||
    action.toUpperCase().includes("REFERRAL") ||
    desc.toLowerCase().includes("referral") ||
    (meta &&
      typeof meta === "object" &&
      Object.entries(meta).some(
        ([k, v]) =>
          k.toLowerCase().includes("referral") ||
          (typeof v === "string" && v.toLowerCase().includes("referral"))
      ));

  if (isReferral) {
    return "Referral Reward";
  }

  if (
    reason === "WALLET_TOPUP" ||
    desc.toLowerCase().includes("funds received") ||
    desc.toLowerCase().match(/transaction of\s*\d+\s*kobo/i)
  ) {
    return "Wallet Top-up";
  }

  switch (reason) {
    case "WALLET_TOPUP":
      return "Wallet Top-up";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "REFERRAL_CREDIT":
      return "Referral Reward";
    default: {
      if (desc) {
        return formatCurrencyInText(desc);
      }
      return reason || "Transaction";
    }
  }
};

/**
 * Returns a human-friendly narrative for a transaction (avoiding raw enums like "OTHER").
 */
export const getCleanTransactionNarrative = (tx?: {
  reason?: string;
  description?: string;
  reference?: string;
}): string => {
  if (!tx) return "Wallet Transaction";

  if (
    tx.reference?.startsWith("PORTFOLIO_TERMINATE") ||
    tx.description?.toLowerCase().includes("terminated")
  ) {
    return "Portfolio Termination";
  }

  const isReferral =
    tx.reason?.toUpperCase().includes("REFERRAL") ||
    tx.reference?.toUpperCase().includes("REFERRAL") ||
    tx.description?.toLowerCase().includes("referral");

  if (isReferral) {
    return "Referral Reward";
  }

  if (tx.reason && tx.reason !== "OTHER") {
    switch (tx.reason) {
      case "WALLET_TOPUP":
        return "Wallet Top-up";
      case "WITHDRAWAL":
        return "Withdrawal";
      case "REFERRAL_CREDIT":
        return "Referral Reward";
      default:
        return tx.reason;
    }
  }

  if (tx.description) {
    return formatCurrencyInText(tx.description);
  }

  return "Wallet Transaction";
};

export interface PortfolioZeroBalanceBannerInfo {
  title: string;
  subtitle: string;
}

export const getPortfolioZeroBalanceBannerInfo = (
  transactions?: { type?: string; reference?: string }[]
): PortfolioZeroBalanceBannerInfo => {
  const fallback: PortfolioZeroBalanceBannerInfo = {
    title: "Funds Fully Withdrawn",
    subtitle: "All funds from this plan have been moved out successfully.",
  };

  if (!transactions || transactions.length === 0) {
    return fallback;
  }

  // Find the most recent DEBIT transaction (txnsData is already sorted createdAt descending)
  const debitTxn = transactions.find((t) => {
    const type = t.type?.toUpperCase() || "";
    return type === "DEBIT" || type.includes("DEBIT") || type.includes("WITHDRAW");
  });

  if (!debitTxn || !debitTxn.reference) {
    return fallback;
  }

  const ref = debitTxn.reference.trim();

  // 1. Starts with PORTFOLIO_WITHDRAW_
  if (ref.startsWith("PORTFOLIO_WITHDRAW_") || ref.startsWith("PORTFOLIO_WITHDRAW")) {
    return {
      title: "Funds Transferred to Wallet",
      subtitle:
        "All matured funds from this plan have been successfully withdrawn into your Main Wallet.",
    };
  }

  // 2. Starts with PORTFOLIO_TRANSFER_ and ends with _DEBIT
  if (ref.startsWith("PORTFOLIO_TRANSFER_") && ref.endsWith("_DEBIT")) {
    return {
      title: "Funds Transferred to Another Plan",
      subtitle:
        "All funds from this plan have been transferred to another portfolio.",
    };
  }

  // 3. Bank-transfer pattern check (once verified with real data)
  if (
    ref.startsWith("PORTFOLIO_BANK_") ||
    ref.startsWith("BANK_TRANSFER_") ||
    ref.startsWith("BANK_PAYOUT_")
  ) {
    return {
      title: "Funds Transferred to Bank",
      subtitle: "All funds from this plan have been transferred to your bank account.",
    };
  }

  return fallback;
};

/**
 * Formats an early termination penalty rate (e.g. 2.5, 0.025, "5%", "5") to a clean percentage string (e.g. "2.5%").
 */
export const formatEarlyTerminationPenaltyRate = (
  rateVal: any,
  fallback = "2.5%"
): string => {
  if (rateVal === undefined || rateVal === null || rateVal === "") {
    return fallback;
  }
  if (typeof rateVal === "string") {
    const trimmed = rateVal.trim();
    if (trimmed.includes("%")) return trimmed;
    const num = parseFloat(trimmed);
    if (!isNaN(num)) {
      const pct = num <= 1 && num > 0 ? num * 100 : num;
      return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
    }
    return trimmed;
  }
  if (typeof rateVal === "number") {
    const pct = rateVal <= 1 && rateVal > 0 ? rateVal * 100 : rateVal;
    return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
  }
  return fallback;
};
