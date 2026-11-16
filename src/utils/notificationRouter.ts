import { router } from "expo-router";

export interface NotificationPayloadData {
  category?: string;
  type?: string;
  templateKey?: string;
  transactionId?: string;
  portfolioId?: string;
  portfolioType?: string;
  planType?: string;
  groupId?: string;
  id?: string;
  chatId?: string;
  ticketId?: string;
  route?: string;
  occurredAt?: string;
  [key: string]: any;
}

export type ResolvedNotificationTarget =
  | string
  | { pathname: string; params?: Record<string, string> };

const PORTFOLIO_DETAIL_TYPES = new Set(["fam", "fix", "flow", "goal", "group"]);

function normalizePortfolioType(rawType?: unknown): string | null {
  if (typeof rawType !== "string") return null;
  const cleaned = rawType
    .trim()
    .toLowerCase()
    .replace(/^wealth[\s-_]?/, "");
  return PORTFOLIO_DETAIL_TYPES.has(cleaned) ? cleaned : null;
}

function isSafeInternalRoute(route: unknown): route is string {
  if (typeof route !== "string") return false;
  const trimmed = route.trim();
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return (
    normalized.startsWith("/") &&
    !normalized.startsWith("//") &&
    !normalized.includes("://")
  );
}

/**
 * Resolves an explicit `data.route` string into a valid Expo Router target,
 * preventing wildcard mismatches and 404s on known backend route patterns.
 */
export function resolveExplicitNotificationRoute(
  rawRoute?: unknown,
  data?: NotificationPayloadData | null
): ResolvedNotificationTarget | null {
  if (!isSafeInternalRoute(rawRoute)) return null;

  const rawTrimmed = (rawRoute as string).trim();
  const trimmed = rawTrimmed.startsWith("/") ? rawTrimmed : `/${rawTrimmed}`;
  const [rawPath] = trimmed.split("?");
  const normalizedPath = rawPath.replace(/\/+$/, "") || "/";

  // Transaction shortcuts
  if (normalizedPath.startsWith("/wallet/transactions/")) {
    const id = normalizedPath.slice("/wallet/transactions/".length).split("/")[0];
    if (id) {
      return {
        pathname: "/transactions/activities/[id]",
        params: { id },
      };
    }
    return "/transactions";
  }

  if (normalizedPath.startsWith("/activities/")) {
    const id = normalizedPath.slice("/activities/".length).split("/")[0];
    if (id) {
      return {
        pathname: "/transactions/activities/[id]",
        params: { id },
      };
    }
    return "/transactions/activities";
  }

  if (normalizedPath.startsWith("/transactions")) {
    return trimmed;
  }

  // Exact portfolio roots
  if (
    normalizedPath === "/portfolio" ||
    normalizedPath === "/portfolios" ||
    normalizedPath === "/(tabs)/portfolios"
  ) {
    return "/(tabs)/portfolios";
  }

  // Known portfolio & wealth-group routes (do NOT hijack these)
  if (
    normalizedPath.startsWith("/portfolio/detail/") ||
    normalizedPath.startsWith("/portfolio/group/") ||
    normalizedPath.startsWith("/portfolio/create/") ||
    normalizedPath.startsWith("/portfolios/wealth-") ||
    normalizedPath.startsWith("/(tabs)/portfolios/wealth-")
  ) {
    return trimmed;
  }

  // Generic `/portfolios/{portfolioId}` or `/portfolio/{portfolioId}` (e.g. INTEREST_CREDITED)
  const genericPortfolioMatch = normalizedPath.match(
    /^\/portfolios?\/([^/]+)$/
  );
  if (genericPortfolioMatch) {
    const portfolioId = data?.portfolioId || genericPortfolioMatch[1];
    const resolvedType = normalizePortfolioType(
      data?.portfolioType ?? data?.planType
    );
    if (resolvedType && portfolioId) {
      return {
        pathname: `/portfolio/detail/${resolvedType}/[id]`,
        params: { id: portfolioId },
      };
    }
    return "/(tabs)/portfolios";
  }

  // Support chat route normalization (handles `/support/chat/{chatId}` safely)
  if (normalizedPath.startsWith("/support/chat")) {
    const segments = normalizedPath.split("/").filter(Boolean);
    const subId = segments.length > 2 ? segments[2] : undefined;
    const chatId = data?.chatId || data?.ticketId || subId;
    return chatId
      ? { pathname: "/support/chat", params: { chatId: String(chatId) } }
      : "/support/chat";
  }

  return trimmed;
}

/**
 * Resolves any notification payload (explicit route, type, or category) to a screen target.
 */
export function resolveNotificationTarget(
  data?: NotificationPayloadData | null
): ResolvedNotificationTarget | null {
  if (!data) return null;

  // 1. Direct explicit route mapping
  const explicitTarget = resolveExplicitNotificationRoute(data.route, data);
  if (explicitTarget) {
    return explicitTarget;
  }

  const type = typeof data.type === "string" ? data.type.trim().toUpperCase() : "";
  const category =
    typeof data.category === "string" ? data.category.trim().toUpperCase() : "";
  const transactionId =
    typeof data.transactionId === "string" ? data.transactionId.trim() : "";
  const groupId =
    typeof data.groupId === "string"
      ? data.groupId.trim()
      : typeof data.id === "string"
        ? data.id.trim()
        : "";
  const chatId =
    typeof data.chatId === "string"
      ? data.chatId.trim()
      : typeof data.ticketId === "string"
        ? data.ticketId.trim()
        : "";
  const portfolioId =
    typeof data.portfolioId === "string"
      ? data.portfolioId.trim()
      : typeof data.id === "string"
        ? data.id.trim()
        : "";
  const portfolioType = normalizePortfolioType(
    data.portfolioType ?? data.planType
  );

  // 2. Type-specific fallbacks when `route` is omitted
  if (type) {
    if (type === "SUPPORT_CHAT" || type.startsWith("SUPPORT")) {
      return chatId
        ? { pathname: "/support/chat", params: { chatId: String(chatId) } }
        : "/support/chat";
    }
    if (
      type.startsWith("KYC") ||
      type.startsWith("SECURITY") ||
      type === "NEW_DEVICE_LOGIN"
    ) {
      return "/profile/security";
    }
    if (type.includes("REFERRAL")) {
      return "/profile/my-referrals";
    }
    if (type === "INTEREST_CREDITED") {
      if (portfolioId && portfolioType) {
        return {
          pathname: `/portfolio/detail/${portfolioType}/[id]`,
          params: { id: portfolioId },
        };
      }
      return "/(tabs)/portfolios";
    }
    if (
      type === "GROUP_CYCLE_PAYOUT" ||
      type === "GROUP_VETTED" ||
      type.startsWith("GROUP_")
    ) {
      if (groupId) {
        return {
          pathname: "/portfolio/detail/group/[id]",
          params: { id: groupId },
        };
      }
      return "/portfolios/wealth-group";
    }
  }

  // 3. Category & entity fallbacks
  if (category === "SECURITY") {
    return "/profile/security";
  }

  if (category === "FINANCIAL") {
    if (transactionId) {
      return {
        pathname: "/transactions/activities/[id]",
        params: { id: transactionId },
      };
    }
    return "/transactions";
  }

  if (category === "TRANSACTION") {
    if (transactionId) {
      return {
        pathname: "/transactions/activities/[id]",
        params: { id: transactionId },
      };
    }
    return "/transactions/activities";
  }

  if (category === "PORTFOLIO") {
    if (portfolioId && portfolioType) {
      return {
        pathname: `/portfolio/detail/${portfolioType}/[id]`,
        params: { id: portfolioId },
      };
    }
    return "/(tabs)/portfolios";
  }

  if (category === "GROUP") {
    if (groupId) {
      return {
        pathname: "/portfolio/detail/group/[id]",
        params: { id: groupId },
      };
    }
    return "/portfolios/wealth-group";
  }

  if (category === "SUPPORT") {
    return chatId
      ? { pathname: "/support/chat", params: { chatId: String(chatId) } }
      : "/support/chat";
  }

  // 4. Fallback to notification center (`SYSTEM`, `MARKETING`, or unknown)
  return "/profile/notifications";
}

/**
 * Maps notification data payloads to corresponding Expo Router screens.
 */
export function handleNotificationNavigation(data?: NotificationPayloadData | null) {
  const target = resolveNotificationTarget(data);
  if (!target) return;

  console.log("[PUSH][ROUTE_RESOLVED]", { target, data });
  try {
    router.push(target as any);
  } catch (e) {
    console.warn("[PUSH][ROUTE_FAILED]", target, e);
    try {
      router.push("/profile/notifications" as any);
    } catch {
      // ignore fallback errors
    }
  }
}

