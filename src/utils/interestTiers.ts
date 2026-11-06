import { BackendPortfolioProductType, InterestTier } from "@/src/types/portfolio";

export function normalizeProductType(type?: string | null): BackendPortfolioProductType | null {
  if (!type) return null;
  const clean = String(type).trim().toUpperCase().replace(/[-_]/g, "");
  if (clean === "WEALTHFIX" || clean === "FIX") return "WEALTH_FIX";
  if (clean === "WEALTHFLEX" || clean === "FLEX") return "WEALTH_FLEX";
  if (clean === "WEALTHGOAL" || clean === "GOAL") return "WEALTH_GOAL";
  if (clean === "WEALTHFAM" || clean === "FAM") return "WEALTH_FAM";
  if (clean === "WEALTHFLOW" || clean === "FLOW") return "WEALTH_FLOW";
  if (clean === "WEALTHGROUP" || clean === "GROUP") return "WEALTH_GROUP";
  return null;
}

export const tierMinKobo = (t: InterestTier): number => {
  if (t.minAmountKobo != null && !isNaN(Number(t.minAmountKobo))) {
    const kobo = Number(t.minAmountKobo);
    if (t.minAmountNaira != null && Number(t.minAmountNaira) > 0) {
      return Math.round(Number(t.minAmountNaira) * 100);
    }
    return kobo;
  }
  if (t.minAmountNaira != null && !isNaN(Number(t.minAmountNaira))) {
    return Math.round(Number(t.minAmountNaira) * 100);
  }
  return 0;
};

export const tierMaxKobo = (t: InterestTier): number | null => {
  if (t.maxAmountKobo != null && !isNaN(Number(t.maxAmountKobo))) {
    if (t.maxAmountNaira != null && Number(t.maxAmountNaira) > 0) {
      return Math.round(Number(t.maxAmountNaira) * 100);
    }
    return Number(t.maxAmountKobo);
  }
  if (t.maxAmountNaira != null && !isNaN(Number(t.maxAmountNaira))) {
    return Math.round(Number(t.maxAmountNaira) * 100);
  }
  return null;
};

export const tierMinNaira = (t: InterestTier): number => {
  if (t.minAmountNaira != null && !isNaN(Number(t.minAmountNaira))) {
    return Number(t.minAmountNaira);
  }
  const kobo = Number(t.minAmountKobo ?? 0);
  return kobo / 100;
};

export const tierMaxNaira = (t: InterestTier): number | null => {
  if (t.maxAmountNaira != null && !isNaN(Number(t.maxAmountNaira))) {
    return Number(t.maxAmountNaira);
  }
  if (t.maxAmountKobo != null && !isNaN(Number(t.maxAmountKobo))) {
    return Number(t.maxAmountKobo) / 100;
  }
  return null;
};

/**
 * Finds the matching tier from the admin-configured tiers based on amount and duration.
 * Product-specific tiers take priority over platform-wide fallback tiers (portfolioType === null).
 */
export function findMatchingTier(
  tiers: InterestTier[] | undefined | null,
  portfolioType: BackendPortfolioProductType,
  amountKobo: number,
  durationDays?: number
): InterestTier | null {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  const normTarget = normalizeProductType(portfolioType);

  const matchingCandidates = tiers.filter((t) => {
    if (t.isActive === false) return false;
    const normTier = normalizeProductType(t.portfolioType);
    return normTier === normTarget || t.portfolioType === null;
  });

  if (matchingCandidates.length === 0) {
    return null;
  }

  // Sort: product-specific tiers first, and tiers with duration constraints first if durationDays is provided
  const sorted = [...matchingCandidates].sort((a, b) => {
    const aNorm = normalizeProductType(a.portfolioType);
    const bNorm = normalizeProductType(b.portfolioType);
    if (aNorm === normTarget && bNorm !== normTarget) return -1;
    if (bNorm === normTarget && aNorm !== normTarget) return 1;
    if (durationDays != null) {
      const aHasDur = a.minDurationDays != null || a.maxDurationDays != null;
      const bHasDur = b.minDurationDays != null || b.maxDurationDays != null;
      if (aHasDur && !bHasDur) return -1;
      if (!aHasDur && bHasDur) return 1;
    }
    return 0;
  });

  const matched = sorted.find((tier) => {
    const minKobo = tierMinKobo(tier);
    const maxKobo = tierMaxKobo(tier);

    if (amountKobo < minKobo || (maxKobo != null && amountKobo > maxKobo)) {
      return false;
    }

    if (durationDays != null) {
      if (tier.minDurationDays != null && durationDays < tier.minDurationDays) {
        return false;
      }
      if (tier.maxDurationDays != null && durationDays > tier.maxDurationDays) {
        return false;
      }
    }

    return true;
  });

  return matched ?? null;
}

export interface TierBoundsResult {
  minAmountKobo: number | null;
  minAmountNaira: number | null;
  maxAmountKobo: number | null;
  maxAmountNaira: number | null;
  minDurationDays: number | null;
  maxDurationDays: number | null;
}

/**
 * Calculates duration and amount limits defined across all active tiers for a product.
 */
export function getTierBounds(
  tiers: InterestTier[] | undefined | null,
  portfolioType: BackendPortfolioProductType
): TierBoundsResult {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return {
      minAmountKobo: null,
      minAmountNaira: null,
      maxAmountKobo: null,
      maxAmountNaira: null,
      minDurationDays: null,
      maxDurationDays: null,
    };
  }

  const normTarget = normalizeProductType(portfolioType);

  const activeTiers = tiers.filter((t) => {
    if (t.isActive === false) return false;
    const normTier = normalizeProductType(t.portfolioType);
    return normTier === normTarget || t.portfolioType === null;
  });

  if (activeTiers.length === 0) {
    return {
      minAmountKobo: null,
      minAmountNaira: null,
      maxAmountKobo: null,
      maxAmountNaira: null,
      minDurationDays: null,
      maxDurationDays: null,
    };
  }

  // Prefer product-specific tiers over platform-wide fallback tiers for calculating bounds
  const productSpecificTiers = activeTiers.filter(
    (t) => normalizeProductType(t.portfolioType) === normTarget
  );
  const candidateTiers = productSpecificTiers.length > 0 ? productSpecificTiers : activeTiers;

  const minAmountKobo = Math.min(...candidateTiers.map(tierMinKobo));
  const minAmountNaira = Math.min(...candidateTiers.map(tierMinNaira));

  const hasUnboundedMax = candidateTiers.some((t) => tierMaxKobo(t) == null);
  const maxAmountKobo = hasUnboundedMax
    ? null
    : Math.max(...candidateTiers.map((t) => tierMaxKobo(t) ?? 0));
  const maxAmountNaira = hasUnboundedMax
    ? null
    : Math.max(...candidateTiers.map((t) => tierMaxNaira(t) ?? 0));

  const tiersWithMinDuration = candidateTiers.filter((t) => t.minDurationDays != null);
  const minDurationDays =
    tiersWithMinDuration.length > 0
      ? Math.min(...tiersWithMinDuration.map((t) => Number(t.minDurationDays)))
      : null;

  const tiersWithMaxDuration = candidateTiers.filter((t) => t.maxDurationDays != null);
  const maxDurationDays =
    candidateTiers.some((t) => t.maxDurationDays == null)
      ? null
      : tiersWithMaxDuration.length > 0
      ? Math.max(...tiersWithMaxDuration.map((t) => Number(t.maxDurationDays)))
      : null;

  return {
    minAmountKobo,
    minAmountNaira,
    maxAmountKobo,
    maxAmountNaira,
    minDurationDays,
    maxDurationDays,
  };
}

/**
 * Derives the active interest rate for an individual portfolio that the user subscribed to.
 * Returns undefined if the portfolio has no balance (no saving yet).
 * Dynamic based on the portfolio's amount and duration matching admin tiers.
 */
export function getSubscribedPortfolioRate(
  portfolio: any | undefined | null,
  tiers?: InterestTier[]
): number | undefined {
  if (!portfolio) return undefined;
  const balanceKobo = Number(portfolio.balance || 0);
  if (balanceKobo <= 0) return undefined;

  const backendType = normalizeProductType(portfolio.type) || "WEALTH_FIX";

  let durationDays: number | undefined;
  if (portfolio.createdAt && portfolio.maturityDate) {
    const start = new Date(portfolio.createdAt).getTime();
    const end = new Date(portfolio.maturityDate).getTime();
    if (!isNaN(start) && !isNaN(end)) {
      const days = Math.round((end - start) / (1000 * 3600 * 24));
      if (days > 0) durationDays = days;
    }
  }
  if (!durationDays && portfolio.daysRemaining && portfolio.daysRemaining > 0) {
    durationDays = portfolio.daysRemaining;
  }
  if (!durationDays && portfolio.metadata?.durationDays) {
    durationDays = Number(portfolio.metadata.durationDays);
  }

  // 1. Match dynamic rate from admin tiers based on amount and duration
  const matched = findMatchingTier(tiers, backendType, balanceKobo, durationDays);
  if (matched?.annualRatePct != null) {
    return matched.annualRatePct;
  }

  // 2. Fall back to locked portfolio interestRate if valid and > 0
  const rawRate = Number(portfolio.interestRate);
  if (!isNaN(rawRate) && rawRate > 0) {
    return rawRate;
  }

  return undefined;
}

/**
 * Returns the active interest rate across a collection of user portfolios of the same type.
 * Returns undefined if the user has no portfolio or 0 balance in that portfolio type.
 */
export function getGroupedSubscribedRate(
  portfolios: any[] | undefined | null,
  tiers?: InterestTier[]
): number | undefined {
  if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) {
    return undefined;
  }

  // Only consider portfolios with actual savings (balance > 0)
  const activeWithBalance = portfolios.filter((p) => Number(p?.balance || 0) > 0);
  if (activeWithBalance.length === 0) {
    return undefined;
  }

  // Sort by balance descending to reflect the rate of their primary saving
  const sorted = [...activeWithBalance].sort(
    (a, b) => Number(b?.balance || 0) - Number(a?.balance || 0)
  );

  for (const p of sorted) {
    const rate = getSubscribedPortfolioRate(p, tiers);
    if (rate != null) return rate;
  }

  return undefined;
}

