import { useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import { useGetPublicConfigQuery } from "@/src/store/api/configApi";

export interface UseReferralEnabledOptions {
  refreshOnFocus?: boolean;
}

/**
 * Returns false ONLY when referralEnabled === false exactly.
 * While loading, on error, or when the field is missing/undefined, returns true (fail open).
 * Refetches when the app returns to the foreground (AppState "active"),
 * and optionally when the screen gains focus (e.g. My Account tab).
 */
export function useReferralEnabled(options?: UseReferralEnabledOptions): boolean {
  const { data, isLoading, isError, refetch } = useGetPublicConfigQuery();

  // Refetch when returning to foreground (AppState "active")
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        refetch();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [refetch]);

  // Refetch when screen gains focus if requested (e.g. My Account tab)
  useFocusEffect(
    useCallback(() => {
      if (options?.refreshOnFocus) {
        refetch();
      }
    }, [refetch, options?.refreshOnFocus])
  );

  // Fail open: while loading, on error, or when field is missing, return true
  if (isLoading || isError) {
    return true;
  }

  const referralEnabled = data?.data?.referralEnabled;
  if (referralEnabled === false) {
    return false;
  }

  return true;
}
