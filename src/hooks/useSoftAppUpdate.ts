import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useGetPublicConfigQuery } from "../store/api/configApi";
import { compareVersions, parseDeadlineMs } from "../utils/appVersion";
import { DEV_VERSION_OVERRIDE } from "./useAppUpdateRequired";

/**
 * Dev-only overrides for soft update testing:
 * Only applied when __DEV__ is true. Set to null for release and normal dev.
 */
export const DEV_LATEST_VERSION_OVERRIDE: string | null = null;
export const DEV_DEADLINE_OVERRIDE: string | null = null;
export const DEV_MESSAGE_OVERRIDE: string | null = null;

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const MAX_TIMER_DELAY_MS = 24 * 24 * 60 * 60 * 1000; // 24-day cap for setTimeout

export interface SoftAppUpdateState {
  isSoftPromptCandidate: boolean;
  isForcedUpdateByDeadline: boolean;
  isUpdateAvailable: boolean;
  currentVersion: string | null;
  latestAppVersion: string | null;
  updateDeadline: string | null;
  updateMessage: string | null;
  isSnoozed: boolean;
  snoozeKey: string | null;
  isLoading: boolean;
  isError: boolean;
  dismissPrompt: () => Promise<void>;
}

export function useSoftAppUpdate(): SoftAppUpdateState {
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [nowTick, setNowTick] = useState<number>(Date.now());

  const { data, isLoading, isError, refetch } = useGetPublicConfigQuery(undefined, {
    refetchOnMountOrArgChange: 30,
  });

  // 1. Refetch public config when the app returns to foreground, plus safety interval
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        setNowTick(Date.now());
        refetch();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    const safetyInterval = setInterval(() => {
      if (AppState.currentState === "active") {
        refetch();
      }
    }, 15 * 60 * 1000);

    return () => {
      sub.remove();
      clearInterval(safetyInterval);
    };
  }, [refetch]);

  // 2. Resolve current app version (ensures no release build uses the dev override)
  const currentVersion =
    __DEV__ && DEV_VERSION_OVERRIDE
      ? DEV_VERSION_OVERRIDE
      : Constants.expoConfig?.version;

  // 3. Resolve remote / overridden values
  const latestAppVersion =
    __DEV__ && DEV_LATEST_VERSION_OVERRIDE
      ? DEV_LATEST_VERSION_OVERRIDE
      : data?.data?.latestAppVersion?.trim() || null;

  const updateDeadline =
    __DEV__ && DEV_DEADLINE_OVERRIDE
      ? DEV_DEADLINE_OVERRIDE
      : data?.data?.updateDeadline ?? null;

  const updateMessage =
    __DEV__ && DEV_MESSAGE_OVERRIDE
      ? DEV_MESSAGE_OVERRIDE
      : data?.data?.updateMessage ?? null;

  const deadlineMs = parseDeadlineMs(updateDeadline);

  // 4. Deadline Timer: when a future deadline exists, set a timeout so the soft
  // prompt turns into the forced screen at the deadline without needing a reload.
  useEffect(() => {
    if (!deadlineMs) return;

    const now = Date.now();
    const diff = deadlineMs - now;

    if (diff <= 0) return;

    const delay = Math.min(diff, MAX_TIMER_DELAY_MS);
    const timer = setTimeout(() => {
      setNowTick(Date.now());
    }, delay);

    return () => clearTimeout(timer);
  }, [deadlineMs, nowTick]);

  // 5. Compound Snooze Key: keyed on version, deadline, and message so any
  // admin setting change causes the prompt to show again.
  const snoozeKey = useMemo(() => {
    if (!latestAppVersion) return null;
    const v = latestAppVersion.trim();
    const d = updateDeadline ? encodeURIComponent(updateDeadline.trim()) : "none";
    const m = updateMessage ? encodeURIComponent(updateMessage.trim()) : "none";
    return `@wealth_update_prompt_${v}_${d}_${m}`;
  }, [latestAppVersion, updateDeadline, updateMessage]);

  // Helper to determine allowable snooze duration
  const getSnoozeDurationMs = useCallback(
    (dlMs: number | null, currentTime: number): number => {
      if (!dlMs) {
        return TWENTY_FOUR_HOURS_MS;
      }
      const timeUntilDeadline = dlMs - currentTime;
      if (timeUntilDeadline <= 0) {
        return 0; // Deadline passed
      }
      if (timeUntilDeadline < ONE_HOUR_MS) {
        return 0; // Less than 1 hour away: snooze disabled
      }
      if (timeUntilDeadline < TWENTY_FOUR_HOURS_MS) {
        return ONE_HOUR_MS; // Less than 24 hours away: shortened to 1 hour
      }
      return TWENTY_FOUR_HOURS_MS; // Default 24 hours
    },
    []
  );

  // 6. Check snooze persistence
  useEffect(() => {
    if (!snoozeKey) {
      setIsSnoozed(false);
      return;
    }

    let isMounted = true;

    AsyncStorage.getItem(snoozeKey)
      .then((stored) => {
        if (!isMounted) return;
        if (!stored) {
          setIsSnoozed(false);
          return;
        }

        const snoozeTimestamp = Number(stored);
        if (isNaN(snoozeTimestamp)) {
          setIsSnoozed(false);
          return;
        }

        const now = Date.now();
        const duration = getSnoozeDurationMs(deadlineMs, now);

        if (duration <= 0) {
          // Snooze disabled
          setIsSnoozed(false);
          return;
        }

        // Never snooze past the deadline
        const effectiveExpiry = deadlineMs
          ? Math.min(snoozeTimestamp + duration, deadlineMs)
          : snoozeTimestamp + duration;

        if (now < effectiveExpiry) {
          setIsSnoozed(true);
        } else {
          setIsSnoozed(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsSnoozed(false);
      });

    return () => {
      isMounted = false;
    };
  }, [snoozeKey, deadlineMs, nowTick, getSnoozeDurationMs]);

  // 7. Dismiss handler: persists snooze timestamp under compound key
  const dismissPrompt = useCallback(async () => {
    const now = Date.now();
    const duration = getSnoozeDurationMs(deadlineMs, now);

    if (duration <= 0) {
      // Less than 1 hour from deadline: snooze disabled
      setIsSnoozed(false);
      return;
    }

    setIsSnoozed(true);
    if (snoozeKey) {
      try {
        await AsyncStorage.setItem(snoozeKey, now.toString());
      } catch {
        console.warn("Failed to save update prompt snooze");
      }
    }
  }, [snoozeKey, deadlineMs, getSnoozeDurationMs]);

  // Fail open: if config is loading, errored, or missing data, do nothing
  if (isLoading || isError || !data?.data) {
    return {
      isSoftPromptCandidate: false,
      isForcedUpdateByDeadline: false,
      isUpdateAvailable: false,
      currentVersion: currentVersion ?? null,
      latestAppVersion,
      updateDeadline,
      updateMessage,
      isSnoozed,
      snoozeKey,
      isLoading,
      isError,
      dismissPrompt,
    };
  }

  // If versions are missing or invalid, do nothing
  if (!currentVersion || !latestAppVersion) {
    return {
      isSoftPromptCandidate: false,
      isForcedUpdateByDeadline: false,
      isUpdateAvailable: false,
      currentVersion: currentVersion ?? null,
      latestAppVersion,
      updateDeadline,
      updateMessage,
      isSnoozed,
      snoozeKey,
      isLoading,
      isError,
      dismissPrompt,
    };
  }

  const comparison = compareVersions(currentVersion, latestAppVersion);

  // If current is not older than latestAppVersion: do nothing
  if (comparison !== "older") {
    return {
      isSoftPromptCandidate: false,
      isForcedUpdateByDeadline: false,
      isUpdateAvailable: false,
      currentVersion,
      latestAppVersion,
      updateDeadline,
      updateMessage,
      isSnoozed,
      snoozeKey,
      isLoading,
      isError,
      dismissPrompt,
    };
  }

  // current IS older than latestAppVersion:
  const now = Date.now();
  const hasValidDeadline = deadlineMs !== null;
  const isDeadlinePassed = hasValidDeadline && deadlineMs <= now;

  if (isDeadlinePassed) {
    return {
      isSoftPromptCandidate: false,
      isForcedUpdateByDeadline: true,
      isUpdateAvailable: true,
      currentVersion,
      latestAppVersion,
      updateDeadline,
      updateMessage,
      isSnoozed,
      snoozeKey,
      isLoading,
      isError,
      dismissPrompt,
    };
  }

  return {
    isSoftPromptCandidate: true,
    isForcedUpdateByDeadline: false,
    isUpdateAvailable: true,
    currentVersion,
    latestAppVersion,
    updateDeadline,
    updateMessage,
    isSnoozed,
    snoozeKey,
    isLoading,
    isError,
    dismissPrompt,
  };
}
