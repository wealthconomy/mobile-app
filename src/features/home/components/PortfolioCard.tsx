import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type BadgeType = "topup" | "daysLeft" | "matured";

interface PortfolioCardProps {
  title: string;
  description: string;
  image?: any;
  type: "flex" | "goal" | "fix" | "fam" | "flow" | "group";
  showEarnTag?: boolean;
  interestRate?: string;
  // New dynamic badge props
  hideInterest?: boolean;
  hasNotification?: boolean;
  badgeType?: BadgeType;
  badgeValue?: string;
}

export const PortfolioCard = ({
  title,
  description,
  image,
  type,
  showEarnTag,
  interestRate,
  hideInterest = false,
  hasNotification = false,
  badgeType,
  badgeValue,
}: PortfolioCardProps) => {
  const getStyles = () => {
    switch (type) {
      case "flex":
        return {
          bg: "#FFF0EF",
          border: "#F4433666",
          iconBg: "#FFD9D7",
          iconColor: "#F44336",
          iconName: "wallet-outline",
          route: "/portfolios/wealth-flex",
          image: require("../../../../assets/images/wallet.png"),
          imageStyle: { position: "absolute", width: 90, height: 90, top: 15, left: 95, opacity: 0.25, transform: [{ rotate: "-5deg" }] },
          interest: interestRate || "5% Interest",
        };
      case "goal":
        return {
          bg: "#F8E5EE",
          border: "#F3007A66",
          iconBg: "#FDD7E4",
          iconColor: "#F3007A",
          iconName: "rocket-outline",
          route: "/portfolios/wealth-goal",
          image: require("../../../../assets/images/arrow.png"),
          imageStyle: { position: "absolute", width: 100, height: 100, top: 15, left: 90, opacity: 0.25, transform: [{ rotate: "-5deg" }] },
          interest: interestRate || "12% Interest",
        };
      case "fix":
        return {
          bg: "#FFF9E6",
          border: "#FFCF6566",
          iconBg: "#FFF1CC",
          iconColor: "#FFCF65",
          iconName: "lock-closed-outline",
          route: "/portfolios/wealth-fix",
          image: require("../../../../assets/images/fix.png"),
          imageStyle: { position: "absolute", width: 90, height: 90, top: 15, left: 95, opacity: 0.25, transform: [{ rotate: "-5deg" }] },
          interest: interestRate || "15% Interest",
        };
      case "fam":
        return {
          bg: "#F0F0FF",
          border: "#6366F166",
          iconBg: "#E0E0FF",
          iconColor: "#6366F1",
          iconName: "people-outline",
          route: "/portfolios/wealth-fam",
          image: require("../../../../assets/images/fam.png"),
          imageStyle: { position: "absolute", width: 85, height: 95, top: 25, left: 85, opacity: 0.25, transform: [{ rotate: "-1deg" }] },
          interest: interestRate || "10% Interest",
        };
      case "flow":
        return {
          bg: "#E6F7FF",
          border: "#0EA5E966",
          iconBg: "#BAE7FF",
          iconColor: "#0EA5E9",
          iconName: "refresh-outline",
          route: "/portfolios/wealth-flow",
          image: require("../../../../assets/images/auto.png.png"),
          imageStyle: { position: "absolute", width: 90, height: 90, top: 25, left: 95, opacity: 0.25, transform: [{ rotate: "-1deg" }] },
          interest: interestRate || "10% Interest",
        };
      case "group":
        return {
          bg: "#F5F5F5",
          border: "#9CA3AF66",
          iconBg: "#E5E7EB",
          iconColor: "#4B5563",
          iconName: "people-circle-outline",
          route: "/portfolios/wealth-group",
          image: require("../../../../assets/images/group.png"),
          imageStyle: { position: "absolute", width: 90, height: 90, top: 15, left: 90, opacity: 0.25, transform: [{ rotate: "-1deg" }] },
          interest: interestRate || "8% Interest",
        };
      default:
        return {
          bg: "#F3F4F6",
          border: "#D1D5DB",
          iconBg: "#E5E7EB",
          iconColor: "#374151",
          iconName: "help-circle-outline",
          route: "/",
          imageStyle: { position: "absolute" },
          interest: interestRate || "5% Interest",
        };
    }
  };

  const styles = getStyles();

  // Badge pill styling
  const getBadgeStyle = () => {
    if (badgeType === "topup") {
      return { bg: "#EF4444", text: "#FFFFFF" };
    } else if (badgeType === "matured") {
      return { bg: "#22C55E", text: "#FFFFFF" };
    } else {
      // daysLeft
      return { bg: "#155D5F", text: "#FFFFFF" };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <TouchableOpacity
      onPress={() => router.push(styles.route as any)}
      activeOpacity={0.85}
      className="relative overflow-visible p-4 border-[0.7px]"
      style={{
        width: 179,
        height: 119,
        backgroundColor: styles.bg,
        borderColor: styles.border,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 50,
        borderBottomLeftRadius: 20,
      }}
    >
      {/* Decorative Background Image */}
      {styles.image && (
        <View style={styles.imageStyle as any} pointerEvents="none">
          <Image
            source={styles.image}
            resizeMode="contain"
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      )}

      {/* Interest Badge OR Dynamic Badge */}
      <View
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* Interest tag — hidden if Impact Wealth */}
        {!hideInterest && (
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#155D5F", fontWeight: "600", fontSize: 9 }}>
              {styles.interest}
            </Text>
          </View>
        )}

        {/* Dynamic badge (Top Up / Days Left / Matured) */}
        {badgeType && badgeValue && (
          <View
            style={{
              backgroundColor: badgeStyle.bg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
            }}
          >
            <Text
              style={{ color: badgeStyle.text, fontWeight: "700", fontSize: 9 }}
            >
              {badgeValue}
            </Text>
          </View>
        )}
      </View>

      {/* Red Notification Dot */}
      {hasNotification && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#EF4444",
            borderWidth: 1.5,
            borderColor: "white",
            zIndex: 20,
          }}
        />
      )}

      {/* Icon Container */}
      <View
        className="rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: styles.iconBg,
          width: 35,
          height: 35,
        }}
      >
        <Ionicons
          name={styles.iconName as any}
          size={18}
          color={styles.iconColor}
        />
      </View>

      <View className="z-10">
        <Text className="text-[#1A1A1A] font-bold text-[14px] mb-0.5">
          {title}
        </Text>
        <Text
          className="text-[#64748B] text-[9px] leading-[12px] font-bold pr-1"
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {showEarnTag && (
        <View className="absolute bottom-2 right-2 bg-white/80 px-2 py-0.5 rounded-full border border-gray-100">
          <Text className="text-[#10B981] text-[8px] font-bold">
            Earn ₦2,475
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
