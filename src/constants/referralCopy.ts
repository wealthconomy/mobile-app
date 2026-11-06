export type ReferralStatus = "PENDING" | "PAID" | "CANCELLED";

export const REFERRAL_STATUS_COPY = {
  PENDING: {
    badge: "Pending Qualification",
    subtitle:
      "Reward unlocks once your friend completes KYC Level 2 and makes their first deposit.",
  },
  PAID: {
    badge: "Reward Earned",
    subtitle: (amount: string) => `${amount} credited to your WealthFlex wallet.`,
  },
  CANCELLED: {
    badge: "Disqualified",
    subtitle: "This referral did not meet compliance criteria.",
  },
} as const;

/**
 * Badge colors with WCAG AA compliance (contrast >= 4.5:1 on background):
 * - PENDING: bg #FEF9C3, text #B45309 (4.66:1 contrast - meets AA)
 * - PAID: bg #DCFCE7, text #166534 (darkened from #16A34A [2.99:1] to #166534 [6.43:1] for AA)
 * - CANCELLED: bg #FEE2E2, text #B91C1C (darkened from #DC2626 [3.90:1] to #B91C1C [5.14:1] for AA)
 */
export const REFERRAL_BADGE_COLORS = {
  PENDING: {
    bg: "#FEF9C3",
    text: "#B45309",
  },
  PAID: {
    bg: "#DCFCE7",
    text: "#166534",
  },
  CANCELLED: {
    bg: "#FEE2E2",
    text: "#B91C1C",
  },
} as const;

export function getReferralStatusBadge(status?: string): string {
  const s = (status || "PENDING").toUpperCase();
  if (s === "PAID") return REFERRAL_STATUS_COPY.PAID.badge;
  if (s === "CANCELLED") return REFERRAL_STATUS_COPY.CANCELLED.badge;
  return REFERRAL_STATUS_COPY.PENDING.badge;
}

export function getReferralStatusSubtitle(
  status?: string,
  formattedAmount?: string
): string {
  const s = (status || "PENDING").toUpperCase();
  if (s === "PAID") {
    return REFERRAL_STATUS_COPY.PAID.subtitle(formattedAmount || "₦0.00");
  }
  if (s === "CANCELLED") {
    return REFERRAL_STATUS_COPY.CANCELLED.subtitle;
  }
  return REFERRAL_STATUS_COPY.PENDING.subtitle;
}

export function getReferralBadgeColor(status?: string): {
  bg: string;
  text: string;
} {
  const s = (status || "PENDING").toUpperCase();
  if (s === "PAID") return REFERRAL_BADGE_COLORS.PAID;
  if (s === "CANCELLED") return REFERRAL_BADGE_COLORS.CANCELLED;
  return REFERRAL_BADGE_COLORS.PENDING;
}
