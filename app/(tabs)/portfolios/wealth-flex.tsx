import { BalanceText } from "@/src/components/common/BalanceText";
import Header from "@/src/components/common/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Custom SVGs from user specs
const CardDepositIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M1.25 14.6875C1.25 15.2677 1.48047 15.8241 1.8907 16.2343C2.30094 16.6445 2.85734 16.875 3.4375 16.875H16.5625C17.1427 16.875 17.6991 16.6445 18.1093 16.2343C18.5195 15.8241 18.75 15.2677 18.75 14.6875V8.67188H1.25V14.6875ZM3.82812 11.7188C3.82812 11.4079 3.95159 11.1099 4.17136 10.8901C4.39113 10.6703 4.6892 10.5469 5 10.5469H6.875C7.1858 10.5469 7.48387 10.6703 7.70364 10.8901C7.92341 11.1099 8.04688 11.4079 8.04688 11.7188V12.5C8.04688 12.8108 7.92341 13.1089 7.70364 13.3286C7.48387 13.5484 7.1858 10.6703 6.875 13.6719H5C4.6892 13.6719 4.39113 13.5484 4.17136 13.3286C3.95159 13.1089 3.82812 12.8108 3.82812 12.5V11.7188ZM16.5625 3.125H3.4375C2.85734 3.125 2.30094 3.35547 1.8907 3.7657C1.48047 4.17594 1.25 4.73234 1.25 5.3125V6.32812H18.75V5.3125C18.75 4.73234 18.5195 4.17594 18.1093 3.7657C17.6991 3.35547 17.1427 3.125 16.5625 3.125Z"
      fill="#F44336"
    />
  </Svg>
);

const ReceivedMoneyIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <Rect width="38" height="38" rx="19" fill="#F44336" />
    <Path
      d="M23.4193 14.5824L14.5805 23.4212M14.5805 23.4212L14.3595 16.5711M14.5805 23.4212L21.4306 23.6422"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TransferMoneyIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <Rect width="38" height="38" rx="19" fill="#F44336" />
    <Path
      d="M14.9823 23.7861L23.0171 14.2105M23.0171 14.2105L23.8343 21.0153M23.0171 14.2105L16.1738 14.5874"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

import { PortfolioDetailSkeleton } from "@/src/features/home/components/DashboardSkeletons";

export default function WealthFlexScreen() {
  const [showBalance, setShowBalance] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [loading, setLoading] = useState(true);
  const amount = "₦300,735.42";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Header title="WealthFlex" onBack={() => router.back()} />
        <PortfolioDetailSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="WealthFlex" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
      >
        {/* Total Savings Card */}
        <View
          className="relative overflow-hidden self-center mb-8"
          style={{
            width: 366,
            height: 140,
            borderRadius: 20,
            backgroundColor: "#F4433633", // Red with 20% opacity
            shadowColor: "#323232",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 13,
            elevation: 4,
          }}
        >
          {/* Wallet Image - User's latest tweaks */}
          <Image
            source={require("../../../assets/images/wallet.png")}
            className="absolute"
            style={{
              width: 169.01,
              height: 169.01,
              top: -9,
              left: 235,
              transform: [{ rotate: "320.33deg" }],
              opacity: 0.3,
              zIndex: 1,
            }}
            resizeMode="contain"
          />

          {/* Text Container - Restored absolute positioning */}
          <View
            style={{
              position: "absolute",
              top: 28,
              left: 20,
              width: 326, // 366 (card width) - 40 (20 left/right padding)
              zIndex: 10,
            }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[#1A1A1A] text-[13px] font-medium opacity-90">
                Total Savings
              </Text>
              <TouchableOpacity
                onPress={() => setShowBalance(!showBalance)}
                className="p-1"
                activeOpacity={0.7}
              >
                {showBalance ? (
                  <Eye size={18} color="#1A1A1A" />
                ) : (
                  <EyeOff size={18} color="#1A1A1A" />
                )}
              </TouchableOpacity>
            </View>

            {/* Amount Section */}
            <View className="mb-2">
              {showBalance ? (
                <BalanceText amount={amount} fontSize={32} color="#1A1A1A" />
              ) : (
                <Text className="text-[#1A1A1A] text-[32px] font-extrabold tracking-tight">
                  ••••••••
                </Text>
              )}
              <View className="flex-row items-center space-x-1 mt-1">
                <Text className="text-[#64748B] text-[13px] font-medium opacity-80">
                  Your wealth grew by N230.00 today
                </Text>
                <Text className="text-[#4CAF50] text-[14px] font-bold ml-1">
                  ↑
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Whats on wealthflex card (Tips Box) */}
        {showTips && (
          <View className="bg-[#FFF5F5] rounded-[24px] p-6 mb-8">
            <TouchableOpacity
              className="absolute right-4 top-4 z-10"
              onPress={() => setShowTips(false)}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#F44336"
                style={{ opacity: 0.2 }}
              />
            </TouchableOpacity>

            <Text
              className="font-extrabold text-[12px] mb-4"
              style={{ width: 332, lineHeight: 12, color: "#F44336" }}
            >
              What’s on WealthFlex?
            </Text>

            <View style={{ width: 332 }}>
              <View className="flex-row mb-3 items-start">
                <Text className="mr-2 text-[10px]">👉</Text>
                <Text
                  className="text-[10px] flex-1 leading-[15px]"
                  style={{ color: "#F44336" }}
                >
                  <Text className="font-bold">Fast Funding:</Text> Use "Deposit
                  Funds" to see your unique wealth account details for the
                  fastest deposit experience.
                </Text>
              </View>

              <View className="flex-row items-start">
                <Text className="mr-2 text-[10px]">👉</Text>
                <Text
                  className="text-[10px] flex-1 leading-[15px]"
                  style={{ color: "#F44336" }}
                >
                  <Text className="font-bold">Instant Impact:</Text> Watch your
                  funds reflect in seconds and start growing immediately.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            className="flex-row items-center"
            style={{
              width: 177,
              height: 75,
              borderRadius: 13,
              backgroundColor: "#F06358",
              paddingTop: 21,
              paddingRight: 30,
              paddingBottom: 21,
              paddingLeft: 11,
              gap: 10,
            }}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/deposit",
                params: { plan: "WealthFlex" },
              })
            }
          >
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="add" size={20} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-[14px]">
                Deposit Funds
              </Text>
              <Text className="text-white mt-2 text-[10px]">
                {"Add to your Wealth\nAccount"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            style={{
              width: 177,
              height: 75,
              borderRadius: 13,
              backgroundColor: "#FFF2F1",
              borderWidth: 0.7,
              borderColor: "#F06358",
              paddingTop: 21,
              paddingRight: 30,
              paddingBottom: 21,
              paddingLeft: 11,
              gap: 10,
            }}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/withdraw",
                params: { plan: "WealthFlex" },
              })
            }
          >
            <View className="w-8 h-8 rounded-full bg-[#FFE9E9] items-center justify-center">
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={24}
                color="#F06358"
              />
            </View>
            <View>
              <Text
                className="font-bold text-[14px]"
                style={{ color: "#F06358" }}
              >
                Withdraw Funds
              </Text>
              <Text className="text-[10px] mt-2" style={{ color: "#F06358" }}>
                {"Move to Bank or other\nportfolio"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-[1px] bg-[#EEEEEE] mb-8" />

        {/* Flex Transactions Section */}
        <View>
          <View className="flex-row justify-between items-center mb-6 px-1">
            <Text className="text-[#1A1A1A] font-bold text-[18px]">
              Flex Transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/wealth-flex-transactions")}
            >
              <Text className="text-[#1A1A1A] text-[13px] font-bold">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transactions List Preview Wrapper */}
          <View
            style={{
              width: 383,
              alignSelf: "center",
              borderRadius: 20,
              padding: 10,
              backgroundColor: "#F6F6F6",
              gap: 10,
            }}
          >
            <TransactionItem
              title="Card Deposit - Simon Peter"
              date="April 12, 2023"
              amount="-N68,000.00"
              status="Successful"
              type="deposit"
            />
            <TransactionItem
              title="Received from Oluwatope"
              date="April 12, 2023"
              amount="+₦68,000.00"
              status="Successful"
              type="received"
            />
            <TransactionItem
              title="Transfer to Wealth Save"
              date="April 12, 2023"
              amount="-N68,000.00"
              status="Successful"
              type="transfer"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TransactionItem({ title, date, amount, status, type }: any) {
  const isCredit = amount.includes("+");

  const getIcon = () => {
    if (type === "deposit") return <CardDepositIcon />;
    if (type === "received") return <ReceivedMoneyIcon />;
    return <TransferMoneyIcon />;
  };

  const getIconBg = () => {
    if (type === "deposit") return "bg-[#FFF5F5]";
    return "bg-transparent"; // Handled by SVG rect for others
  };

  return (
    <TouchableOpacity
      style={{
        width: 366,
        height: 66,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
      activeOpacity={0.9}
      onPress={() => router.push("/transaction-detail")}
    >
      <View
        className={`w-11 h-11 items-center justify-center mr-3 ${getIconBg()} rounded-full`}
      >
        {getIcon()}
      </View>
      <View className="flex-1">
        <Text
          className="text-[#1A1A1A] font-bold text-[13px] mb-1"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-[#9CA3AF] text-[10px] font-medium">{date}</Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-bold text-[13px] mb-1.5 ${isCredit ? "text-[#4CAF50]" : "text-[#1A1A1A]"}`}
        >
          {amount}
        </Text>
        <View className="bg-[#E7F5F5] px-2 py-0.5 rounded-md">
          <Text className="text-[#155D5F] text-[9px] font-bold">{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
