import {
  BookOpen,
  CreditCard,
  Gift,
  RefreshCw,
  Settings,
  Shield,
  User,
} from "lucide-react-native";
import React from "react";
import { formatCurrencyInText, formatMetadataValue } from "./formatters";

export interface ActivityIconResult {
  icon: React.ReactNode;
  bg: string;
  color: string;
}

/**
 * Returns icon element, background color, and icon color based on activity type.
 * REFERRAL → Gift, bg #E7F5F5
 * FINANCIAL → CreditCard, bg #D1F2F2
 * PROFILE → User, bg #E7EFEF
 * ENGAGEMENT → BookOpen, bg #FEF3C7
 * SECURITY → Shield, bg #FEE2E2
 * SYSTEM → Settings, bg #E7EFEF
 * fallback → RefreshCw, bg #E7EFEF
 */
export function getActivityIconData(
  typeOrItem?: string | { type?: string; title?: string; description?: string; metadata?: any },
  size: number = 20,
): ActivityIconResult {
  let normalizedType = "";
  let isReferral = false;

  if (typeof typeOrItem === "object" && typeOrItem !== null) {
    normalizedType = (typeOrItem.type || "").toUpperCase().trim();
    const rawTitle = (typeOrItem.title || "").toLowerCase();
    const desc = (typeOrItem.description || "").toLowerCase();
    isReferral =
      normalizedType.includes("REFERRAL") ||
      rawTitle.includes("referral") ||
      desc.includes("referral") ||
      (typeOrItem.metadata &&
        typeof typeOrItem.metadata === "object" &&
        Object.entries(typeOrItem.metadata).some(
          ([k, v]) =>
            k.toLowerCase().includes("referral") ||
            (typeof v === "string" && v.toLowerCase().includes("referral")) ||
            (k.toLowerCase() === "reason" && String(v).toUpperCase().includes("REFERRAL"))
        ));
  } else {
    normalizedType = (typeOrItem || "").toUpperCase().trim();
    isReferral = normalizedType.includes("REFERRAL");
  }

  if (isReferral) {
    return {
      icon: React.createElement(Gift, { size, color: "#155D5F" }),
      bg: "#E7F5F5",
      color: "#155D5F",
    };
  }

  switch (normalizedType) {
    case "FINANCIAL":
      return {
        icon: React.createElement(CreditCard, { size, color: "#155D5F" }),
        bg: "#D1F2F2",
        color: "#155D5F",
      };
    case "PROFILE":
      return {
        icon: React.createElement(User, { size, color: "#155D5F" }),
        bg: "#E7EFEF",
        color: "#155D5F",
      };
    case "ENGAGEMENT":
      return {
        icon: React.createElement(BookOpen, { size, color: "#D97706" }),
        bg: "#FEF3C7",
        color: "#D97706",
      };
    case "SECURITY":
      return {
        icon: React.createElement(Shield, { size, color: "#EF4444" }),
        bg: "#FEE2E2",
        color: "#EF4444",
      };
    case "SYSTEM":
      return {
        icon: React.createElement(Settings, { size, color: "#4B5563" }),
        bg: "#E7EFEF",
        color: "#4B5563",
      };
    default:
      return {
        icon: React.createElement(RefreshCw, { size, color: "#155D5F" }),
        bg: "#E7EFEF",
        color: "#155D5F",
      };
  }
}

export interface ActivityBadgeData {
  label: string;
  bg: string;
  text: string;
}

/**
 * Returns label, background, and text colors for the type badge pill.
 */
export function getActivityBadgeData(
  typeOrItem?: string | { type?: string; title?: string; description?: string; metadata?: any }
): ActivityBadgeData {
  let normalized = "";
  let isReferral = false;

  if (typeof typeOrItem === "object" && typeOrItem !== null) {
    normalized = (typeOrItem.type || "").toUpperCase().trim();
    const rawTitle = (typeOrItem.title || "").toLowerCase();
    const desc = (typeOrItem.description || "").toLowerCase();
    isReferral =
      normalized.includes("REFERRAL") ||
      rawTitle.includes("referral") ||
      desc.includes("referral") ||
      (typeOrItem.metadata &&
        typeof typeOrItem.metadata === "object" &&
        Object.entries(typeOrItem.metadata).some(
          ([k, v]) =>
            k.toLowerCase().includes("referral") ||
            (typeof v === "string" && v.toLowerCase().includes("referral")) ||
            (k.toLowerCase() === "reason" && String(v).toUpperCase().includes("REFERRAL"))
        ));
  } else {
    normalized = (typeOrItem || "").toUpperCase().trim();
    isReferral = normalized.includes("REFERRAL");
  }

  if (isReferral) {
    return { label: "Referral", bg: "#E6F7F7", text: "#155D5F" };
  }

  switch (normalized) {
    case "FINANCIAL":
      return { label: "Financial", bg: "#E6F7F7", text: "#155D5F" };
    case "PROFILE":
      return { label: "Profile", bg: "#E0F2FE", text: "#0369A1" };
    case "ENGAGEMENT":
      return { label: "Engagement", bg: "#FEF3C7", text: "#92400E" };
    case "SECURITY":
      return { label: "Security", bg: "#FEE2E2", text: "#B91C1C" };
    case "SYSTEM":
      return { label: "System", bg: "#F3F4F6", text: "#4B5563" };
    default:
      return {
        label: normalized
          ? normalized.charAt(0) + normalized.slice(1).toLowerCase()
          : "Activity",
        bg: "#F3F4F6",
        text: "#4B5563",
      };
  }
}

function cleanTitleFigures(text: string): string {
  return text
    .replace(/₦\s*[\d,]+(?:\.\d+)?/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s*kobos?\b/gi, "")
    .replace(/:\s*\d+(?:\.\d+)?/g, "")
    .replace(/\s*—\s*$/, "")
    .replace(/\s*-\s*$/, "")
    .trim();
}

/**
 * Extracts formatted Naira currency amount from activity description or metadata if present.
 */
export function extractActivityAmount(item?: {
  description?: string;
  metadata?: Record<string, any>;
}): string | null {
  if (!item) return null;

  // 1. Prioritize structured metadata (unrounded exact figures e.g. interest: 27 or amount: 27 -> ₦0.27)
  if (item.metadata && typeof item.metadata === "object") {
    // Check specific primary amount keys first
    const priorityKeys = [
      "amount",
      "amountkobo",
      "interest",
      "interestamount",
      "interestkobo",
      "credit",
      "kobo",
      "reward",
      "bonus",
      "deposit",
      "principal",
      "yield",
    ];

    for (const pKey of priorityKeys) {
      const entry = Object.entries(item.metadata).find(
        ([k]) => k.toLowerCase() === pKey || k.toLowerCase().replace(/_/g, "") === pKey
      );
      if (entry) {
        const [key, val] = entry;
        if (val !== undefined && val !== null && val !== "") {
          const formattedVal = formatMetadataValue(key, val);
          if (formattedVal.startsWith("₦")) {
            return formattedVal;
          }
        }
      }
    }

    // Check all other metadata keys
    for (const [key, val] of Object.entries(item.metadata)) {
      const lower = key.toLowerCase();
      if (
        lower.includes("rate") ||
        lower.includes("percent") ||
        lower.includes("id")
      ) {
        continue;
      }
      if (
        lower.includes("amount") ||
        lower.includes("interest") ||
        lower.includes("credit") ||
        lower.includes("debit") ||
        lower.includes("deposit") ||
        lower.includes("reward") ||
        lower.includes("bonus") ||
        lower.includes("balance") ||
        lower.includes("yield") ||
        lower.includes("principal") ||
        lower.includes("transfer") ||
        lower.includes("kobo")
      ) {
        if (val !== undefined && val !== null && val !== "") {
          const formattedVal = formatMetadataValue(key, val);
          if (formattedVal.startsWith("₦")) {
            return formattedVal;
          }
        }
      }
    }
  }

  // 2. Format raw description so any raw kobo figures (e.g. 200000 or ₦200000 or 200000 kobo) are converted to Naira
  const formattedDesc = formatCurrencyInText(item.description || "").trim();

  // Extract formatted Naira amount e.g. "₦2,000.00"
  const nairaMatch = formattedDesc.match(/₦\s*([\d,]+(?:\.\d+)?)/);
  if (nairaMatch) {
    const rawVal = nairaMatch[1].replace(/,/g, "");
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      return `₦${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  // 2b. Check if description has colon with digits (e.g. ":50000" or ": 50000" raw kobo in referral reward)
  const colonKoboMatch = item.description?.match(/:\s*(\d{4,})\b/);
  if (colonKoboMatch) {
    const rawVal = parseFloat(colonKoboMatch[1]);
    if (!isNaN(rawVal)) {
      const naira = rawVal / 100;
      return `₦${naira.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  return null;
}

/**
 * Extracts a specific, friendly and readable title from description with figures removed:
 * - Referral Reward -> Referral Reward
 * - Deposit / Funds Received -> Deposit from Provider (or Wallet Top-up)
 * - Interest Credited -> Interest Credited
 * - top up for portfolio: <name> -> Portfolio Top-up — <name>
 * - funded <type> portfolio: <name> -> Portfolio Funding — <name>
 * - contribution to wealthgroup: <name> -> Group Contribution — <name>
 * - refund from terminated portfolio: <name> -> Portfolio Refund — <name>
 * - refund from terminated wealth group: <name> -> Group Refund — <name>
 * - downloaded library material: <name> -> Library Download — <name>
 * - description includes "profile" -> keep item.title as-is
 * - fallback -> item.title without figures
 */
export function getFriendlyActivityTitle(item?: {
  title?: string;
  description?: string;
  type?: string;
  metadata?: Record<string, any>;
}): string {
  if (!item) return "Activity";
  const desc = (item.description || "").trim();
  const rawTitle = (item.title || "Activity").trim();
  const typeStr = (item.type || "").trim().toUpperCase();

  // 0. Referral Reward (e.g. "referral reward :50000", "Referral reward", type: "REFERRAL", etc.)
  const isReferral =
    typeStr.includes("REFERRAL") ||
    rawTitle.toLowerCase().includes("referral") ||
    desc.toLowerCase().includes("referral") ||
    (item.metadata &&
      typeof item.metadata === "object" &&
      Object.entries(item.metadata).some(
        ([k, v]) =>
          k.toLowerCase().includes("referral") ||
          (typeof v === "string" && v.toLowerCase().includes("referral")) ||
          (k.toLowerCase() === "reason" && String(v).toUpperCase().includes("REFERRAL")) ||
          (k.toLowerCase() === "type" && String(v).toUpperCase().includes("REFERRAL"))
      ));

  if (isReferral) {
    return "Referral Reward";
  }

  // 1. Funds Received / Deposit (e.g. "Transaction of 200000 kobo completed.", "Deposit", "Deposit9")
  const isDepositOrFunds =
    rawTitle.toLowerCase().includes("funds received") ||
    rawTitle.toLowerCase().includes("deposit") ||
    desc.toLowerCase().includes("funds received") ||
    desc.toLowerCase().includes("deposit") ||
    desc.toLowerCase().match(/transaction of\s*\d+\s*kobo/i);

  if (isDepositOrFunds) {
    const rawProvider =
      item.metadata?.provider ||
      (desc.toLowerCase().includes("paga")
        ? "PAGA"
        : desc.toLowerCase().includes("paystack")
        ? "Paystack"
        : desc.toLowerCase().includes("monnify")
        ? "Monnify"
        : undefined);

    if (rawProvider) {
      const provider =
        rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1).toLowerCase();
      return `Deposit from ${provider}`;
    }

    return "Wallet Top-up";
  }

  // 1. Interest Credited / Earned
  const isInterest =
    rawTitle.toLowerCase().includes("interest") ||
    desc.toLowerCase().includes("interest");

  if (isInterest) {
    return "Interest Credited";
  }

  // 2. Top up for portfolio
  const topUpMatch = desc.match(/top up for portfolio:\s*(.+)/i);
  if (topUpMatch?.[1]) {
    const target = cleanTitleFigures(topUpMatch[1]);
    return target ? `Portfolio Top-up: ${target}` : "Portfolio Top-up";
  }

  // 3. Funded portfolio
  const fundedMatch = desc.match(/funded\s+\w+\s+portfolio:\s*(.+)/i);
  if (fundedMatch?.[1]) {
    const target = cleanTitleFigures(fundedMatch[1]);
    return target ? `Portfolio Funding: ${target}` : "Portfolio Funding";
  }

  // 4. Contribution to wealthgroup
  const groupContribMatch = desc.match(/contribution to wealthgroup:\s*(.+)/i);
  if (groupContribMatch?.[1]) {
    const target = cleanTitleFigures(groupContribMatch[1]);
    return target ? `Group Contribution: ${target}` : "Group Contribution";
  }

  // 5. Withdrawal or Refund from portfolio (e.g. "withdrawal from portfolio: Benz", "withdrawl from porfolio:Benz", "refund from terminated portfolio: Benz")
  const withdrawPortMatch = desc.match(
    /(?:withdraw(?:al|l|n)?|refund)\s+(?:to\s+\w+\s+)?from\s+(?:terminated\s+)?por?tfolio:?\s*(.+?)(\s*\(|$)/i,
  );
  if (withdrawPortMatch?.[1]) {
    const target = cleanTitleFigures(withdrawPortMatch[1]);
    return target ? `Withdrawal from Portfolio: ${target}` : "Withdrawal from Portfolio";
  }

  if (
    desc.toLowerCase().includes("withdrawal from portfolio") ||
    desc.toLowerCase().includes("withdrawl from porfolio") ||
    desc.toLowerCase().includes("refund from terminated") ||
    desc.toLowerCase().includes("portfolio refund") ||
    rawTitle.toLowerCase().includes("portfolio refund")
  ) {
    return "Withdrawal from Portfolio";
  }

  // 5b. Portfolio Transfer
  const isTransfer =
    rawTitle.toLowerCase().includes("transfer") ||
    desc.toLowerCase().includes("transfer") ||
    item.metadata?.destinationName ||
    item.metadata?.sourceName ||
    item.metadata?.toName ||
    item.metadata?.fromName;

  if (isTransfer) {
    const fromName =
      item.metadata?.sourceName ||
      item.metadata?.fromName ||
      item.metadata?.sourcePortfolioName ||
      item.metadata?.source;

    const toName =
      item.metadata?.destinationName ||
      item.metadata?.toName ||
      item.metadata?.destPortfolioName ||
      item.metadata?.targetName ||
      item.metadata?.destination;

    if (fromName && toName) {
      return `Portfolio transfer from ${fromName} to ${toName}`;
    }

    const fullText = `${rawTitle} ${desc}`;
    const fromToMatch = fullText.match(/transfer(?:.*?)(?:from\s+(.+?)\s+to\s+(.+?)|to\s+(.+?)\s+from\s+(.+?))$/i);
    if (fromToMatch) {
      const parsedFrom = (fromToMatch[1] || fromToMatch[4] || fromName)?.trim();
      const parsedTo = (fromToMatch[2] || fromToMatch[3] || toName)?.trim();
      if (parsedFrom && parsedTo) {
        const cleanedFrom = cleanTitleFigures(parsedFrom);
        const cleanedTo = cleanTitleFigures(parsedTo);
        if (cleanedFrom && cleanedTo) {
          return `Portfolio transfer from ${cleanedFrom} to ${cleanedTo}`;
        }
      }
    }

    const toMatch = fullText.match(/transfer(?:.*?)\s+to\s+(.+)$/i);
    if (toMatch && toMatch[1]) {
      const parsedTo = cleanTitleFigures(toMatch[1].trim());
      if (parsedTo) {
        if (fromName) {
          return `Portfolio transfer from ${fromName} to ${parsedTo}`;
        }
        return `Portfolio transfer to ${parsedTo}`;
      }
    }

    const fromMatch = fullText.match(/transfer(?:.*?)\s+from\s+(.+)$/i);
    if (fromMatch && fromMatch[1]) {
      const parsedFrom = cleanTitleFigures(fromMatch[1].trim());
      if (parsedFrom) {
        if (toName) {
          return `Portfolio transfer from ${parsedFrom} to ${toName}`;
        }
        return `Portfolio transfer from ${parsedFrom}`;
      }
    }

    if (fromName) {
      return `Portfolio transfer from ${fromName}`;
    }

    return "Portfolio Transfer";
  }

  // 6. Refund from terminated wealth group
  const termGroupMatch = desc.match(
    /refund from terminated wealth group:\s*(.+)/i,
  );
  if (termGroupMatch?.[1]) {
    const target = cleanTitleFigures(termGroupMatch[1]);
    return target ? `Group Refund: ${target}` : "Group Refund";
  }

  // 7. Downloaded library material
  const downloadMatch = desc.match(
    /downloaded library material:\s*"?(.+?)"?$/i,
  );
  if (downloadMatch?.[1]) {
    return `Library Download: ${downloadMatch[1].trim()}`;
  }

  // 8. Profile update
  if (desc.toLowerCase().includes("profile")) {
    return rawTitle;
  }

  const cleanedRaw = cleanTitleFigures(rawTitle);
  return cleanedRaw || "Activity";
}

export type GroupedListItem<T> =
  | { type: "header"; label: string }
  | { type: "item"; data: T };

/**
 * Groups items sorted descending by createdAt into date sections:
 * "Today", "Yesterday", "This Week" (last 7 days excluding today/yesterday),
 * "This Month" (same month & year as now, >7 days old), or "<Month> <Year>".
 */
export function groupActivitiesByDate<T extends { id?: string; createdAt: string }>(
  items: T[],
): GroupedListItem<T>[] {
  const result: GroupedListItem<T>[] = [];
  const seenIds = new Set<string>();
  const uniqueItems = items.filter((item) => {
    if (!item.id) return true;
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  let lastBucket = "";

  for (const item of uniqueItems) {
    const itemDate = new Date(item.createdAt);
    if (isNaN(itemDate.getTime())) {
      result.push({ type: "item", data: item });
      continue;
    }

    const itemDayStart = new Date(
      itemDate.getFullYear(),
      itemDate.getMonth(),
      itemDate.getDate(),
    ).getTime();
    const diffDays = Math.round((todayStart - itemDayStart) / oneDayMs);

    let bucket = "";
    if (diffDays === 0) {
      bucket = "Today";
    } else if (diffDays === 1) {
      bucket = "Yesterday";
    } else if (diffDays > 1 && diffDays < 7) {
      bucket = "This Week";
    } else if (
      itemDate.getFullYear() === now.getFullYear() &&
      itemDate.getMonth() === now.getMonth()
    ) {
      bucket = "This Month";
    } else {
      bucket = itemDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    if (bucket !== lastBucket) {
      result.push({ type: "header", label: bucket });
      lastBucket = bucket;
    }

    result.push({ type: "item", data: item });
  }

  return result;
}
