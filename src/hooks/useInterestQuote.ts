import { useEffect, useMemo, useState } from "react";
import { useCalculateInterestQuery, useGetPortfolioConfigQuery } from "@/src/store/api/portfolioApi";
import { BackendPortfolioProductType, CalculateInterestRequest, InterestTier } from "@/src/types/portfolio";
import { findMatchingTier, normalizeProductType } from "@/src/utils/interestTiers";

export type PortfolioProductInputType =
  | "fix"
  | "flex"
  | "goal"
  | "fam"
  | "flow"
  | "group"
  | "wealthfix"
  | "wealthflex"
  | "wealthgoal"
  | "wealthfam"
  | "wealthflow"
  | "wealthgroup"
  | BackendPortfolioProductType;

const PRODUCT_TYPE_MAP: Record<string, BackendPortfolioProductType> = {
  fix: "WEALTH_FIX",
  wealthfix: "WEALTH_FIX",
  WEALTH_FIX: "WEALTH_FIX",
  flex: "WEALTH_FLEX",
  wealthflex: "WEALTH_FLEX",
  WEALTH_FLEX: "WEALTH_FLEX",
  goal: "WEALTH_GOAL",
  wealthgoal: "WEALTH_GOAL",
  WEALTH_GOAL: "WEALTH_GOAL",
  fam: "WEALTH_FAM",
  wealthfam: "WEALTH_FAM",
  WEALTH_FAM: "WEALTH_FAM",
  flow: "WEALTH_FLOW",
  wealthflow: "WEALTH_FLOW",
  WEALTH_FLOW: "WEALTH_FLOW",
  group: "WEALTH_GROUP",
  wealthgroup: "WEALTH_GROUP",
  WEALTH_GROUP: "WEALTH_GROUP",
};

export interface UseInterestQuoteParams {
  type: PortfolioProductInputType;
  amountNaira: number;
  durationDays?: number;
  enabled?: boolean;
}

export interface InterestQuoteResult {
  rate: number | undefined;
  tierName: string | undefined;
  projectedInterestNaira: number | undefined;
  estimatedPayoutNaira: number | undefined;
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  matchedTier: InterestTier | null;
}

export function useInterestQuote({
  type,
  amountNaira,
  durationDays,
  enabled = true,
}: UseInterestQuoteParams): InterestQuoteResult {
  const backendType = normalizeProductType(type) || PRODUCT_TYPE_MAP[type];
  const amountKobo = Math.round(amountNaira * 100);

  const isAmountValid =
    typeof amountNaira === "number" && !isNaN(amountNaira) && amountNaira > 0;

  // WealthFlex has flexible duration, so durationDays is optional.
  // Other products require whole number durationDays >= 1.
  const isDurationValid =
    backendType === "WEALTH_FLEX"
      ? durationDays === undefined ||
        (typeof durationDays === "number" && Number.isInteger(durationDays) && durationDays >= 1)
      : typeof durationDays === "number" &&
        Number.isInteger(durationDays) &&
        durationDays >= 1;

  const isEnabled = enabled !== false;
  const isValid = isEnabled && isAmountValid && isDurationValid && !!backendType;

  // Retrieve admin configured tiers from config
  const { data: configData } = useGetPortfolioConfigQuery();
  const tiers: InterestTier[] = useMemo(() => {
    return (configData?.tiers || (configData as any)?.data?.tiers || []) as InterestTier[];
  }, [configData]);

  // Find local matching tier from admin config
  const matchedTier = useMemo(() => {
    if (!isValid || !backendType) return null;
    return findMatchingTier(tiers, backendType, amountKobo, durationDays);
  }, [tiers, backendType, amountKobo, durationDays, isValid]);

  const [debouncedInput, setDebouncedInput] = useState<CalculateInterestRequest | null>(null);

  useEffect(() => {
    if (!isValid) {
      setDebouncedInput(null);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedInput({
        portfolioType: backendType,
        amountKobo,
        ...(durationDays !== undefined ? { durationDays } : {}),
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [backendType, amountKobo, durationDays, isValid]);

  const { data, isLoading, isFetching, isError } = useCalculateInterestQuery(
    debouncedInput ?? ({} as any),
    {
      skip: !debouncedInput,
    }
  );

  const isInputCurrent =
    debouncedInput !== null &&
    debouncedInput.amountKobo === amountKobo &&
    (backendType === "WEALTH_FLEX" || debouncedInput.durationDays === durationDays) &&
    debouncedInput.portfolioType === backendType;

  // Check if backend confirmed a valid tier or if a tier is matched in admin config
  const hasMatchedTier =
    Boolean(data?.tierId || data?.tierName) ||
    Boolean(matchedTier) ||
    (tiers.length === 0 && Boolean(data?.annualRatePct));

  // Resolved annual rate: exactly follow what admin set from panel
  const resolvedRate = matchedTier?.annualRatePct ?? (hasMatchedTier ? data?.annualRatePct : undefined);
  const resolvedTierName = matchedTier?.name || data?.tierName || undefined;

  const calculatedProjectedNaira = useMemo(() => {
    if (resolvedRate != null && resolvedRate > 0 && amountNaira > 0) {
      if (
        data?.projectedInterestNaira != null &&
        data.projectedInterestNaira > 0 &&
        data.annualRatePct === resolvedRate
      ) {
        return data.projectedInterestNaira;
      }
      const days = durationDays && durationDays > 0 ? durationDays : (backendType === "WEALTH_FLEX" ? 30 : 30);
      return (amountNaira * (resolvedRate / 100) * days) / 365;
    }
    return undefined;
  }, [data?.projectedInterestNaira, data?.annualRatePct, resolvedRate, amountNaira, durationDays, backendType]);

  const isReady =
    isValid &&
    resolvedRate !== undefined &&
    (matchedTier !== null || (isInputCurrent && !isLoading && !isFetching && !isError));

  const isBusy = isValid && matchedTier === null && (!isInputCurrent || isLoading || isFetching);

  return {
    rate: resolvedRate,
    tierName: resolvedTierName,
    projectedInterestNaira: calculatedProjectedNaira,
    estimatedPayoutNaira:
      calculatedProjectedNaira != null ? amountNaira + calculatedProjectedNaira : undefined,
    isLoading: isBusy,
    isError: isError && matchedTier === null,
    isReady: isReady,
    matchedTier,
  };
}
