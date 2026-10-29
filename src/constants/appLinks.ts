import { Alert, Linking, Platform } from "react-native";

export const DEFAULT_IOS_STORE_URL =
  "https://apps.apple.com/app/id6824495467";
export const ANDROID_MARKET_URL =
  "market://details?id=com.wealthconomy.app";
export const ANDROID_WEB_URL =
  "https://play.google.com/store/apps/details?id=com.wealthconomy.app";

/**
 * Validates an optional environment override for store URLs.
 * IMPORTANT: Any override whose host is 'wealthconomy.org' is strictly ignored
 * so that a leftover dummy or landing page URL can never redirect users away from
 * the official app stores.
 */
function sanitizeStoreOverride(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase().includes("wealthconomy.org")) {
      return null;
    }
    return trimmed;
  } catch {
    if (trimmed.toLowerCase().includes("wealthconomy.org")) {
      return null;
    }
    return trimmed;
  }
}

const envIosUrl = sanitizeStoreOverride(process.env.EXPO_PUBLIC_IOS_APP_URL);
const envAndroidUrl = sanitizeStoreOverride(
  process.env.EXPO_PUBLIC_ANDROID_APP_URL
);

export const IOS_STORE_URL = envIosUrl || DEFAULT_IOS_STORE_URL;
export const ANDROID_STORE_OVERRIDE_URL = envAndroidUrl;

/**
 * Opens the native store page for the Wealthconomy app.
 * - On iOS: opens the App Store URL (or custom override).
 * - On Android: attempts the native market:// URI first; if that fails, falls back to the Play Store web URL.
 * - All attempts are wrapped in try/catch. If both fail, presents an Alert and returns false.
 */
export async function openStore(): Promise<boolean> {
  const alertStoreFailure = () => {
    Alert.alert(
      "Couldn't open the store",
      "Please search for Wealthconomy in the app store."
    );
  };

  if (Platform.OS === "ios") {
    try {
      await Linking.openURL(IOS_STORE_URL);
      return true;
    } catch {
      console.warn("Failed to open App Store");
      alertStoreFailure();
      return false;
    }
  }

  // Android: custom override if provided
  if (ANDROID_STORE_OVERRIDE_URL) {
    try {
      await Linking.openURL(ANDROID_STORE_OVERRIDE_URL);
      return true;
    } catch {
      // Fallback to market and web below
    }
  }

  // Android: try market:// first
  try {
    await Linking.openURL(ANDROID_MARKET_URL);
    return true;
  } catch {
    // Android: fallback to web URL
    try {
      await Linking.openURL(ANDROID_WEB_URL);
      return true;
    } catch {
      console.warn("Failed to open Play Store via market:// or web");
      alertStoreFailure();
      return false;
    }
  }
}
