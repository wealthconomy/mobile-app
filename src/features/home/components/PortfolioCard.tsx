import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PortfolioCardProps {
  title: string;
  description: string;
  image?: any;
  type: "flex" | "goal" | "fix" | "fam" | "auto" | "group";
  showEarnTag?: boolean;
  interestRate?: string;
}

export const PortfolioCard = ({
  title,
  description,
  image,
  type,
  showEarnTag,
  interestRate,
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
          interest: interestRate || "10% Interest",
        };
      case "auto":
        return {
          bg: "#E6F7FF",
          border: "#0EA5E966",
          iconBg: "#BAE7FF",
          iconColor: "#0EA5E9",
          iconName: "refresh-outline",
          route: "/portfolios/wealth-auto",
          image: require("../../../../assets/images/auto.png.png"),
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
          interest: interestRate || "5% Interest",
        };
    }
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      onPress={() => router.push(styles.route as any)}
      activeOpacity={0.85}
      className="relative overflow-hidden p-4 border-[0.7px]"
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
        <Image
          source={styles.image}
          className="absolute"
          resizeMode="cover"
          style={{
            width: 127.78,
            height: 127.78,
            top: -12,
            left: 86,
            opacity: 0.3,
            transform: [{ rotate: "-0.35deg" }],
          }}
        />
      )}

      {/* Interest Tag */}
      <View
        className="absolute bg-white items-center justify-center"
        style={{
          width: 82,
          height: 21,
          top: 11,
          left: 91,
          borderRadius: 20,
          zIndex: 10,
        }}
      >
        <Text className="text-[#155D5F] font-medium text-[9px]">
          {styles.interest}
        </Text>
      </View>

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
          className="text-[#64748B] text-[9px] leading-[12px] font-medium pr-1"
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
