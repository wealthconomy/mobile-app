import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type PortfolioItem = {
  type: "flex" | "fix" | "goal" | "fam" | "flow" | "group";
  title: string;
  description: string;
  createRoute: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  bg: string;
  border: string;
  defaultInterest: string;
  badgeType?: "topup" | "daysLeft" | "matured";
  badgeValue?: string;
  hasNotification?: boolean;
};

const PORTFOLIO_LIST: PortfolioItem[] = [
  {
    type: "flex",
    title: "WealthFlex",
    description: "Smart flexible savings; earn interest, access anytime.",
    createRoute: "/portfolios/wealth-flex",
    iconName: "wallet-outline",
    iconColor: "#F44336",
    iconBg: "#FFD9D7",
    bg: "#FFF0EF",
    border: "#F4433666",
    defaultInterest: "5% Interest",
  },
  {
    type: "fix",
    title: "WealthFix",
    description: "Lock it in, block temptation, and watch your money grow.",
    createRoute: "/portfolio/create/fix",
    iconName: "lock-closed-outline",
    iconColor: "#D48E00",
    iconBg: "#FFF1CC",
    bg: "#FFF9E6",
    border: "#FFCF6566",
    defaultInterest: "15% Interest",
    badgeType: "daysLeft",
    badgeValue: "4 days left",
  },
  {
    type: "goal",
    title: "WealthGoal",
    description: "Save with discipline and smash every goals.",
    createRoute: "/portfolio/create/goal",
    iconName: "rocket-outline",
    iconColor: "#F3007A",
    iconBg: "#FDD7E4",
    bg: "#F8E5EE",
    border: "#F3007A66",
    defaultInterest: "12% Interest",
    badgeType: "topup",
    badgeValue: "Top Up",
  },
  {
    type: "fam",
    title: "WealthFam",
    description: "Build a wealthy family; save for kids, spouse, and loved ones.",
    createRoute: "/portfolio/create/fam",
    iconName: "people-outline",
    iconColor: "#6366F1",
    iconBg: "#E0E0FF",
    bg: "#F0F0FF",
    border: "#6366F166",
    defaultInterest: "10% Interest",
    badgeType: "topup",
    badgeValue: "Top Up",
    hasNotification: true,
  },
  {
    type: "flow",
    title: "WealthFlow",
    description: "Automated savings for a continuous wealth flow.",
    createRoute: "/portfolio/create/flow",
    iconName: "refresh-outline",
    iconColor: "#0EA5E9",
    iconBg: "#BAE7FF",
    bg: "#E6F7FF",
    border: "#0EA5E966",
    defaultInterest: "17% Interest",
  },
  {
    type: "group",
    title: "WealthGroup",
    description: "Save together, grow together and win together.",
    createRoute: "/portfolios/wealth-group",
    iconName: "people-circle-outline",
    iconColor: "#4B5563",
    iconBg: "#E5E7EB",
    bg: "#F5F5F5",
    border: "#9CA3AF66",
    defaultInterest: "8% Interest",
    hasNotification: true,
  },
];

interface TransferToPortfolioSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const TransferToPortfolioSheet = ({
  visible,
  onClose,
}: TransferToPortfolioSheetProps) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const preferences = useSelector(
    (state: RootState) => state.portfolioPreference
  );

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = (portfolio: PortfolioItem) => {
    onClose();
    setTimeout(() => {
      router.push(portfolio.createRoute as any);
    }, 260);
  };

  const getBadgeColor = (badgeType?: string) => {
    if (badgeType === "topup") return { bg: "#EF4444", text: "#FFFFFF" };
    if (badgeType === "matured") return { bg: "#22C55E", text: "#FFFFFF" };
    return { bg: "#155D5F", text: "#FFFFFF" };
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: fadeAnim,
          }}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: 32,
          maxHeight: SCREEN_HEIGHT * 0.85,
          transform: [{ translateY: slideAnim }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 20,
        }}
      >
        {/* Drag Handle */}
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: "#E5E7EB",
            borderRadius: 2,
            alignSelf: "center",
            marginTop: 12,
            marginBottom: 16,
          }}
        />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A" }}>
            Select a Portfolio to TopUp
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={18} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Portfolio Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {PORTFOLIO_LIST.map((portfolio) => {
              const pref = preferences[portfolio.type];
              const isImpact = pref === "Impact Wealth";
              const badgeColor = getBadgeColor(portfolio.badgeType);

              return (
                <TouchableOpacity
                  key={portfolio.type}
                  onPress={() => handleSelect(portfolio)}
                  activeOpacity={0.85}
                  style={{
                    width: "47.5%",
                    backgroundColor: portfolio.bg,
                    borderColor: portfolio.border,
                    borderWidth: 0.7,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 40,
                    borderBottomLeftRadius: 16,
                    padding: 14,
                    overflow: "visible",
                    position: "relative",
                  }}
                >
                  {/* Notification Dot */}
                  {portfolio.hasNotification && (
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

                  {/* Badges Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginBottom: 8,
                      gap: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Interest badge */}
                    {!isImpact && (
                      <View
                        style={{
                          backgroundColor: "white",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: "#155D5F",
                            fontWeight: "600",
                            fontSize: 9,
                          }}
                        >
                          {portfolio.defaultInterest}
                        </Text>
                      </View>
                    )}

                    {/* Dynamic badge */}
                    {portfolio.badgeType && portfolio.badgeValue && (
                      <View
                        style={{
                          backgroundColor: badgeColor.bg,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: badgeColor.text,
                            fontWeight: "700",
                            fontSize: 9,
                          }}
                        >
                          {portfolio.badgeValue}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Icon */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: portfolio.iconBg,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name={portfolio.iconName as any}
                      size={16}
                      color={portfolio.iconColor}
                    />
                  </View>

                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: "#1A1A1A" }}
                  >
                    {portfolio.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: "#64748B",
                      marginTop: 2,
                      lineHeight: 13,
                    }}
                    numberOfLines={2}
                  >
                    {portfolio.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};
