import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useGetPublicConfigQuery } from "../store/api/configApi";
import { compareVersions } from "../utils/appVersion";

export const MIN_VERSION_STORAGE_KEY =
  "@wealthconomy/last_known_min_app_version";

/**
 * Dev-only version override:
 * Set to a version string (e.g. "0.9.0") to test the forced-update screen without rebuilding the binary.
 * Only active when __DEV__ is true. Set to null for normal development and production.
 */
export const DEV_VERSION_OVERRIDE: string | null = null;

export interface AppUpdateRequiredState {
  isUpdateRequired: boolean;
  minAppVersion?: string;
  currentVersion?: string;
  isReady: boolean;
}

export function useAppUpdateRequired(): AppUpdateRequiredState {
  const [storedMinVersion, setStoredMinVersion] = useState<string | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const { data, isError, refetch } = useGetPublicConfigQuery(undefined, {
    refetchOnMountOrArgChange: 30,
  });

  // 1. On mount: check AsyncStorage for last known minAppVersion
  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(MIN_VERSION_STORAGE_KEY)
      .then((val) => {
        if (!isMounted) return;
        if (val && typeof val === "string") {
          setStoredMinVersion(val.trim());
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsStorageLoaded(true);
        }
      });

    // Fallback: never block for more than 400ms if storage has an issue
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setIsStorageLoaded(true);
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // 2. When live config data arrives, persist the latest minAppVersion
  useEffect(() => {
    if (data?.data?.minAppVersion) {
      const liveMin = data.data.minAppVersion.trim();
      AsyncStorage.setItem(MIN_VERSION_STORAGE_KEY, liveMin).catch(() => {});
    }
  }, [data]);

  // 3. Refetch public config when the app returns to foreground and on a 15-min safety interval
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
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

  // 4. Determine current app version (ensures no release build can ever use the override)
  const appVersion =
    __DEV__ && DEV_VERSION_OVERRIDE
      ? DEV_VERSION_OVERRIDE
      : Constants.expoConfig?.version;

  // If app version is missing from config, skip all checks
  if (!appVersion) {
    return { isUpdateRequired: false, isReady: isStorageLoaded };
  }

  // 5. Evaluate update requirement:
  // If remote data is available, evaluate against remote minAppVersion
  if (data?.data) {
    const remoteMin = data.data.minAppVersion?.trim();
    if (remoteMin) {
      const comparison = compareVersions(appVersion, remoteMin);
      // If config says the version is OK, clear the block
      const isUpdateRequired = comparison === "older";
      return {
        isUpdateRequired,
        minAppVersion: remoteMin,
        currentVersion: appVersion,
        isReady: isStorageLoaded,
      };
    } else {
      // Remote config has no minAppVersion => version is OK, clear block
      return {
        isUpdateRequired: false,
        currentVersion: appVersion,
        isReady: isStorageLoaded,
      };
    }
  }

  // If live config query is still loading or failed (fail open):
  // Check against storedMinVersion (from AsyncStorage) so returning user is blocked from first frame
  if (storedMinVersion) {
    const comparison = compareVersions(appVersion, storedMinVersion);
    const isUpdateRequired = comparison === "older";
    return {
      isUpdateRequired,
      minAppVersion: storedMinVersion,
      currentVersion: appVersion,
      isReady: isStorageLoaded,
    };
  }

  // First-ever launch with no stored value: fail open while loading / on error
  return {
    isUpdateRequired: false,
    currentVersion: appVersion,
    isReady: isStorageLoaded,
  };
}
