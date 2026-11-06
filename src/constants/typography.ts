import { TextStyle } from "react-native";

/**
 * Shared typography definitions for secondary text across the app.
 * Guarantees minimum legible sizes and WCAG AA contrast (>= 4.5:1 on white).
 *
 * Font family: Kumbh Sans SemiBold (600 weight, loaded via @expo-google-fonts/kumbh-sans)
 */

export const SECONDARY_TEXT = {
  /**
   * Subtext, descriptions, modal explanatory text, empty-state messages
   * Size: 13px, LineHeight: 18px, Color: #4B5563 (5.74:1 contrast on white), Weight: 600
   */
  subtext: {
    style: {
      fontSize: 13,
      lineHeight: 18,
      color: "#4B5563",
      fontWeight: "600",
      fontFamily: "KumbhSans_600SemiBold",
    } as TextStyle,
    className: "text-[13px] leading-[18px] text-[#4B5563] font-kumbh-semibold",
  },

  /**
   * Category labels, end dates, progress %, days left, transaction metadata
   * Size: 12px, LineHeight: 16px, Color: #4B5563 (5.74:1 contrast on white), Weight: 600
   */
  label: {
    style: {
      fontSize: 12,
      lineHeight: 16,
      color: "#4B5563",
      fontWeight: "600",
      fontFamily: "KumbhSans_600SemiBold",
    } as TextStyle,
    className: "text-[12px] leading-[16px] text-[#4B5563] font-kumbh-semibold",
  },

  /**
   * Subtext on dark cards / backgrounds
   * Size: 13px, LineHeight: 18px, Color: #FFFFFF at 0.95 opacity, Weight: 600
   */
  subtextOnDark: {
    style: {
      fontSize: 13,
      lineHeight: 18,
      color: "#FFFFFF",
      opacity: 0.95,
      fontWeight: "600",
      fontFamily: "KumbhSans_600SemiBold",
    } as TextStyle,
    className: "text-[13px] leading-[18px] text-white opacity-95 font-kumbh-semibold",
  },

  /**
   * Label on dark cards / backgrounds
   * Size: 12px, LineHeight: 16px, Color: #FFFFFF at 0.95 opacity, Weight: 600
   */
  labelOnDark: {
    style: {
      fontSize: 12,
      lineHeight: 16,
      color: "#FFFFFF",
      opacity: 0.95,
      fontWeight: "600",
      fontFamily: "KumbhSans_600SemiBold",
    } as TextStyle,
    className: "text-[12px] leading-[16px] text-white opacity-95 font-kumbh-semibold",
  },
} as const;

export const secondarySubtextStyle = SECONDARY_TEXT.subtext.style;
export const secondarySubtextClass = SECONDARY_TEXT.subtext.className;

export const secondaryLabelStyle = SECONDARY_TEXT.label.style;
export const secondaryLabelClass = SECONDARY_TEXT.label.className;

export const secondarySubtextOnDarkStyle = SECONDARY_TEXT.subtextOnDark.style;
export const secondarySubtextOnDarkClass = SECONDARY_TEXT.subtextOnDark.className;
