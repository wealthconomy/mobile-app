import { RootState } from "@/src/store";
import { useListGroupsQuery } from "@/src/store/api/groupApi";
import { useGetPortfoliosQuery } from "@/src/store/api/portfolioApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector } from "react-redux";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type PortfolioItem = {
  type: "flex" | "fix" | "goal" | "fam" | "flow" | "group";
  title: string;
  description: string;
  targetRoute: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  bg: string;
  border: string;
  image: any;
  imageStyle: any;
};

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

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const uid = currentUser?.id;

  // Real live portfolio queries per backend endpoint
  const { data: flexData } = useGetPortfoliosQuery({ type: "wealthflex" });
  const { data: fixData } = useGetPortfoliosQuery({ type: "wealthfix" });
  const { data: goalData } = useGetPortfoliosQuery({ type: "wealthgoal" });
  const { data: famData } = useGetPortfoliosQuery({ type: "wealthfam" });
  const { data: flowData } = useGetPortfoliosQuery({ type: "wealthflow" });
  const { data: groupsData } = useListGroupsQuery();

  const flexItems = (flexData?.items || []).filter(
    (p) => p.status === "ACTIVE",
  );
  const fixItems = (fixData?.items || []).filter((p) => p.status === "ACTIVE");
  const goalItems = (goalData?.items || []).filter(
    (p) => p.status === "ACTIVE",
  );
  const famItems = (famData?.items || []).filter((p) => p.status === "ACTIVE");
  const flowItems = (flowData?.items || []).filter(
    (p) => p.status === "ACTIVE",
  );
  const groupItems = (groupsData?.items || []).filter((g) => {
    if (!uid) return false;
    if (g.creatorId === uid || (g as any).creator?.id === uid) return true;
    if (g.isAdmin) return true;
    const uStatus = (g as any).userStatus || (g as any).memberStatus;
    if (uStatus === "ACTIVE" || uStatus === "PAID" || uStatus === "UNPAID")
      return true;
    if (g.isMember && uStatus !== "PENDING") return true;
    return false;
  });

  // Build the list containing only user's created/active portfolios
  const activePortfolioList: PortfolioItem[] = useMemo(() => {
    const list: PortfolioItem[] = [];

    // 1. WealthFlex
    if (flexItems.length > 0) {
      list.push({
        type: "flex",
        title: "WealthFlex",
        description: "Smart flexible savings; earn interest, access anytime.",
        targetRoute:
          flexItems.length === 1
            ? `/portfolio/detail/flex/${flexItems[0].id}`
            : "/(tabs)/portfolios/wealth-flex",
        iconName: "wallet-outline",
        iconColor: "#F44336",
        iconBg: "#FFD9D7",
        bg: "#FFF0EF",
        border: "#F4433666",
        image: require("../../../../assets/images/wallet.png"),
        imageStyle: {
          position: "absolute",
          width: 90,
          height: 90,
          top: 15,
          right: 5,
          opacity: 0.25,
          transform: [{ rotate: "-5deg" }],
        },
      });
    }

    // 2. WealthGoal
    if (goalItems.length > 0) {
      list.push({
        type: "goal",
        title: "WealthGoal",
        description: "Save with discipline and smash every goals.",
        targetRoute:
          goalItems.length === 1
            ? `/portfolio/detail/goal/${goalItems[0].id}`
            : "/(tabs)/portfolios/wealth-goal",
        iconName: "rocket-outline",
        iconColor: "#F3007A",
        iconBg: "#FDD7E4",
        bg: "#F8E5EE",
        border: "#F3007A66",
        image: require("../../../../assets/images/arrow.png"),
        imageStyle: {
          position: "absolute",
          width: 100,
          height: 100,
          top: 15,
          right: 5,
          opacity: 0.25,
          transform: [{ rotate: "-5deg" }],
        },
      });
    }

    // 3. WealthFix
    if (fixItems.length > 0) {
      list.push({
        type: "fix",
        title: "WealthFix",
        description: "Lock it in, block temptation, and watch your money grow.",
        targetRoute:
          fixItems.length === 1
            ? `/portfolio/detail/fix/${fixItems[0].id}`
            : "/(tabs)/portfolios/wealth-fix",
        iconName: "lock-closed-outline",
        iconColor: "#D48E00",
        iconBg: "#FFF1CC",
        bg: "#FFF9E6",
        border: "#FFCF6566",
        image: require("../../../../assets/images/fix.png"),
        imageStyle: {
          position: "absolute",
          width: 110,
          height: 110,
          top: 20,
          right: -20,
          opacity: 0.25,
          transform: [{ rotate: "-9deg" }],
        },
      });
    }

    // 4. WealthFam
    if (famItems.length > 0) {
      list.push({
        type: "fam",
        title: "WealthFam",
        description:
          "Build a wealthy family; save for kids, spouse, and loved ones.",
        targetRoute:
          famItems.length === 1
            ? `/portfolio/detail/fam/${famItems[0].id}`
            : "/(tabs)/portfolios/wealth-fam",
        iconName: "people-outline",
        iconColor: "#6366F1",
        iconBg: "#E0E0FF",
        bg: "#F0F0FF",
        border: "#6366F166",
        image: require("../../../../assets/images/fam.png"),
        imageStyle: {
          position: "absolute",
          width: 100,
          height: 100,
          top: 35,
          right: -10,
          opacity: 0.25,
          transform: [{ rotate: "-25deg" }],
        },
      });
    }

    // 5. WealthFlow
    if (flowItems.length > 0) {
      list.push({
        type: "flow",
        title: "WealthFlow",
        description: "Automated savings for a continuous wealth flow.",
        targetRoute:
          flowItems.length === 1
            ? `/portfolio/detail/flow/${flowItems[0].id}`
            : "/(tabs)/portfolios/wealth-flow",
        iconName: "refresh-outline",
        iconColor: "#0EA5E9",
        iconBg: "#BAE7FF",
        bg: "#E6F7FF",
        border: "#0EA5E966",
        image: require("../../../../assets/images/auto.png.png"),
        imageStyle: {
          position: "absolute",
          width: 90,
          height: 90,
          top: 25,
          right: 5,
          opacity: 0.25,
          transform: [{ rotate: "-1deg" }],
        },
      });
    }

    // 6. WealthGroup
    if (groupItems.length > 0) {
      list.push({
        type: "group",
        title: "WealthGroup",
        description: "Save together, grow together and win together.",
        targetRoute:
          groupItems.length === 1
            ? `/portfolio/detail/group/${groupItems[0].id}`
            : "/(tabs)/portfolios/wealth-group",
        iconName: "people-circle-outline",
        iconColor: "#4B5563",
        iconBg: "#E5E7EB",
        bg: "#F5F5F5",
        border: "#9CA3AF66",
        image: require("../../../../assets/images/group.png"),
        imageStyle: {
          position: "absolute",
          width: 120,
          height: 110,
          top: 40,
          right: -15,
          opacity: 0.25,
          transform: [{ rotate: "-15deg" }],
        },
      });
    }

    return list;
  }, [flexItems, fixItems, goalItems, famItems, flowItems, groupItems]);

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
      router.push(portfolio.targetRoute as any);
    }, 260);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
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
          {activePortfolioList.length === 0 ? (
            <View className="items-center justify-center py-10 px-6">
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="wallet-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-[16px] font-bold text-[#1A1A1A] mb-2 text-center">
                No Active Portfolios Found
              </Text>
              <Text className="text-[13px] text-[#6B7280] text-center mb-6 leading-5">
                You haven't created any active savings portfolios or groups to
                top up yet. Create a goal to start building wealth!
              </Text>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  setTimeout(
                    () => router.push("/(tabs)/portfolios" as any),
                    260,
                  );
                }}
                className="bg-[#0B575B] px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-sm">
                  Create a Portfolio
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: 14,
              }}
            >
              {activePortfolioList.map((portfolio) => (
                <TouchableOpacity
                  key={portfolio.type}
                  onPress={() => handleSelect(portfolio)}
                  activeOpacity={0.85}
                  style={{
                    width: "48%",
                    height: 125,
                    backgroundColor: portfolio.bg,
                    borderColor: portfolio.border,
                    borderWidth: 0.7,
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 50,
                    borderBottomLeftRadius: 20,
                    padding: 14,
                    overflow: "hidden",
                    position: "relative",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Background Watermark Image from Portfolio Page */}
                  <Image
                    source={portfolio.image}
                    style={portfolio.imageStyle}
                    resizeMode="contain"
                  />

                  {/* Top Row: Category Icon & Top Up Badge */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      zIndex: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: portfolio.iconBg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={portfolio.iconName as any}
                        size={16}
                        color={portfolio.iconColor}
                      />
                    </View>

                    <View
                      style={{
                        backgroundColor: "#EF4444",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 20,
                        marginTop: -35, // <-- Add this to push it up (try -4, -6, or -8)
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "700",
                          fontSize: 9,
                        }}
                      >
                        {portfolio.type === "group" ? "Deposit" : "Top Up"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ zIndex: 10 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#1A1A1A",
                      }}
                    >
                      {portfolio.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#64748B",
                        marginTop: 2,
                        lineHeight: 12,
                      }}
                      numberOfLines={2}
                    >
                      {portfolio.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};
