import { router } from "expo-router";

export interface NotificationPayloadData {
  category?: string;
  templateKey?: string;
  transactionId?: string;
  route?: string;
  occurredAt?: string;
  [key: string]: any;
}

/**
 * Maps notification data payloads to corresponding Expo Router screens.
 */
export function handleNotificationNavigation(data?: NotificationPayloadData | null) {
  if (!data) return;

  const rawRoute = data.route;
  const transactionId = data.transactionId;
  const category = (data.category || "").toUpperCase();

  // 1. Direct explicit route mapping
  if (rawRoute) {
    if (rawRoute.startsWith("/wallet/transactions/")) {
      const id = rawRoute.replace("/wallet/transactions/", "");
      router.push({
        pathname: "/transactions/activities/[id]" as any,
        params: { id },
      });
      return;
    }

    if (rawRoute.startsWith("/activities/")) {
      const id = rawRoute.replace("/activities/", "");
      router.push({
        pathname: "/transactions/activities/[id]" as any,
        params: { id },
      });
      return;
    }

    if (rawRoute.startsWith("/transactions/activities")) {
      router.push(rawRoute as any);
      return;
    }

    if (rawRoute.startsWith("/portfolio") || rawRoute.startsWith("/(tabs)/portfolios")) {
      router.push("/(tabs)/portfolios" as any);
      return;
    }

    try {
      router.push(rawRoute as any);
      return;
    } catch (e) {
      console.warn("Could not navigate directly to route:", rawRoute, e);
    }
  }

  // 2. Category & entity fallbacks
  if (category === "TRANSACTION") {
    if (transactionId) {
      router.push({
        pathname: "/transactions/activities/[id]" as any,
        params: { id: transactionId },
      });
      return;
    }
    router.push("/transactions/activities" as any);
    return;
  }

  if (category === "PORTFOLIO" || category === "GROUP") {
    router.push("/(tabs)/portfolios" as any);
    return;
  }

  // 3. Fallback to notification center
  router.push("/profile/notifications" as any);
}

