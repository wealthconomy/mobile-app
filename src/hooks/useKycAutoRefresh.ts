import { useCallback, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useGetKycDocumentsQuery } from "@/src/store/api/kycApi";
import { isLevel2Pending, isLevel3Pending } from "@/src/features/kyc/utils/kycState";

/**
 * Hook to auto-refresh KYC documents query.
 *
 * Polls GET /kyc/documents every 12 seconds only while Level 2 or Level 3 verification
 * is in review, stopping on any final state (verified or rejected).
 * Also refetches when Home gains focus and when the app returns to the foreground.
 */
export function useKycAutoRefresh() {
  const user = useSelector((state: RootState) => state.auth.user);

  // Initial query with refetch on mount or arg change
  const queryResult = useGetKycDocumentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: kycDocsResponse, refetch } = queryResult;
  const kycDocsPayload: any = kycDocsResponse?.data;
  const kycDocs: any = kycDocsPayload?.data || kycDocsPayload;

  const l2Pending = isLevel2Pending(kycDocs, user);
  const l3Pending = isLevel3Pending(kycDocs, user);
  const shouldPoll = l2Pending || l3Pending;

  // Polling every 12 seconds only while pending
  useEffect(() => {
    if (!shouldPoll) return;

    const interval = setInterval(() => {
      refetch();
    }, 12000);

    return () => clearInterval(interval);
  }, [shouldPoll, refetch]);

  // Refetch when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Refetch when app transitions to active foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        refetch();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [refetch]);

  return {
    ...queryResult,
    kycDocs,
    shouldPoll,
  };
}
