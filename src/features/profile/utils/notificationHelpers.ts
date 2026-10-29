import { NotificationItem } from "@/src/store/api/notificationApi";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const isKycNotification = (item: NotificationItem): boolean => {
  const dataType = typeof item.data?.type === "string" ? item.data.type.toUpperCase() : "";
  if (dataType.startsWith("KYC")) return true;

  if (item.data?.route === "/profile/security") return true;

  const dataIsNull = item.data === null || item.data === undefined;
  const title = (item.title || "").trim();
  if (dataIsNull && /^kyc/i.test(title)) return true;

  return false;
};

export const getNotificationVisuals = (item: NotificationItem) => {
  // KYC specific mappings
  if (isKycNotification(item)) {
    const text = `${item.data?.type || ""} ${item.title || ""}`.toLowerCase();
    if (text.includes("verified") || text.includes("approved")) {
      return {
        iconName: "shield-checkmark",
        iconFamily: "Ionicons" as const,
        iconColor: "#FFFFFF",
        circleColor: "#16A34A",
      };
    }
    if (text.includes("rejected") || text.includes("failed")) {
      return {
        iconName: "alert-circle",
        iconFamily: "Ionicons" as const,
        iconColor: "#FFFFFF",
        circleColor: "#EF4444",
      };
    }
    if (text.includes("review") || text.includes("pending")) {
      return {
        iconName: "time",
        iconFamily: "Ionicons" as const,
        iconColor: "#FFFFFF",
        circleColor: "#D97706",
      };
    }
    return {
      iconName: "shield-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#155D5F",
    };
  }

  const kind = (item.kind || item.data?.type || "").toLowerCase();
  const title = (item.title || "").toLowerCase();

  // Rotational payout & Vetted notification mappings
  if (kind.includes("group_cycle_payout") || kind.includes("payout") || title.includes("payout")) {
    return {
      iconName: "gift-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#16A34A",
    };
  }
  if (kind.includes("group_vetted") || kind.includes("vetted") || title.includes("vetted")) {
    return {
      iconName: "shield-checkmark",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#155D5F",
    };
  }

  // Group/Tribe specific mappings
  if (kind.includes("payment") || title.includes("payment") || title.includes("paid")) {
    return {
      iconName: "cash-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#4CAF50",
    };
  }
  if (kind.includes("blacklist") || title.includes("blacklist") || title.includes("ban")) {
    return {
      iconName: "ban-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#EF4444",
    };
  }
  if (kind.includes("milestone") || title.includes("milestone") || title.includes("goal")) {
    return {
      iconName: "trophy-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#EAB308",
    };
  }
  if (kind.includes("removal") || title.includes("remove")) {
    return {
      iconName: "person-remove-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#EF4444",
    };
  }
  if (kind.includes("admin") || title.includes("admin") || title.includes("role")) {
    const isGroup = kind.includes("group") || title.includes("group") || title.includes("tribe");
    return {
      iconName: isGroup ? "shield-checkmark-outline" : "account-cog",
      iconFamily: (isGroup ? "Ionicons" : "MaterialCommunityIcons") as "Ionicons" | "MaterialCommunityIcons",
      iconColor: "#FFFFFF",
      circleColor: "#155D5F",
    };
  }

  // General mappings
  if (kind.includes("group") || title.includes("group") || title.includes("tribe")) {
    return {
      iconName: "account-group",
      iconFamily: "MaterialCommunityIcons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#4CAF50",
    };
  }
  if (kind.includes("success") || title.includes("success") || title.includes("moved")) {
    return {
      iconName: "lock",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#4CAF50",
    };
  }
  if (kind.includes("card") || title.includes("card") || title.includes("deposit")) {
    return {
      iconName: "card-outline",
      iconFamily: "Ionicons" as const,
      iconColor: "#FF5252",
      circleColor: "#FFEBEE",
    };
  }
  if (
    kind.includes("growth") ||
    title.includes("growth") ||
    title.includes("grew") ||
    title.includes("interest")
  ) {
    return {
      iconName: "trending-up",
      iconFamily: "Ionicons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#4CAF50",
    };
  }
  if (kind.includes("goal") || title.includes("goal") || title.includes("target")) {
    return {
      iconName: "target",
      iconFamily: "MaterialCommunityIcons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#4CAF50",
    };
  }
  if (kind.includes("transfer") || title.includes("transfer") || title.includes("sent")) {
    return {
      iconName: "arrow-up-right",
      iconFamily: "MaterialCommunityIcons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#FF5252",
    };
  }
  if (kind.includes("received") || title.includes("received")) {
    return {
      iconName: "arrow-down-left",
      iconFamily: "MaterialCommunityIcons" as const,
      iconColor: "#FFFFFF",
      circleColor: "#4CAF50",
    };
  }
  return {
    iconName: "notifications",
    iconFamily: "Ionicons" as const,
    iconColor: "#FFFFFF",
    circleColor: "#155D5F",
  };
};

export const formatNotificationTimestamp = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) {
    return `Today | ${timeStr}`;
  }
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} | ${timeStr}`;
};
