import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Returns the current app version from app.json / expo config (e.g. "1.0.0"), or null if missing.
 */
export function getAppVersion(): string | null {
  const version = Constants.expoConfig?.version;
  return version ? String(version).trim() : null;
}

/**
 * Returns the current platform-specific build number from expo config, or null if missing.
 * - iOS: Constants.expoConfig?.ios?.buildNumber
 * - Android: String(Constants.expoConfig?.android?.versionCode)
 */
export function getBuildNumber(): string | null {
  if (Platform.OS === "ios") {
    const build = Constants.expoConfig?.ios?.buildNumber;
    return build !== undefined && build !== null ? String(build).trim() : null;
  }
  if (Platform.OS === "android") {
    const code = Constants.expoConfig?.android?.versionCode;
    return code !== undefined && code !== null ? String(code).trim() : null;
  }
  return null;
}

/**
 * Returns a human-readable version label:
 * - "1.0.0 (build 5)" when both version and build are present
 * - "1.0.0" when build number is missing
 * - "—" when both are missing
 * Note: Dev version overrides must not affect this.
 */
export function getVersionLabel(): string {
  const version = getAppVersion();
  const build = getBuildNumber();

  if (version && build) {
    return `${version} (build ${build})`;
  }
  if (version) {
    return version;
  }
  if (build) {
    return `build ${build}`;
  }
  return "—";
}
