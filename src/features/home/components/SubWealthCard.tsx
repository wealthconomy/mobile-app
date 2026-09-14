import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { router } from "expo-router";
import { ArrowUp, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { BalanceText } from "../../../components/common/BalanceText";

interface SubWealthCardProps {
  description?: string;
  amount?: string;
  dailyGrowth?: string | number;
  onButtonPress?: () => void;
  onTransferPress?: () => void;
  showButton?: boolean;
  badge?: string;
  badgeBg?: string;
  style?: any;
}

export const SubWealthCard = ({
  description,
  amount = "₦0.00",
  dailyGrowth,
  onButtonPress,
  onTransferPress,
  showButton = true,
  badge,
  badgeBg = "#155D5F",
  style,
}: SubWealthCardProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const { data: walletData } = useGetWalletSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const growthKobo = dailyGrowth ?? walletData?.dailyGrowth;
  const growthFormatted = growthKobo
    ? (parseFloat(growthKobo.toString()) / 100).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  const handleButtonPress = () => {
    if (onTransferPress) {
      onTransferPress();
    } else if (onButtonPress) {
      onButtonPress();
    } else {
      router.push("/portfolios/" as any);
    }
  };

  return (
    <View
      className="relative overflow-hidden"
      style={[
        {
          width: "100%",
          maxWidth: 365,
          height: 170,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 20,
          borderBottomRightRadius: 50,
          borderBottomLeftRadius: 20,
          backgroundColor: "#155D5F",
          borderWidth: 0.7,
          borderColor: "#D9D9D9",
          shadowColor: "#323232",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 13,
          elevation: 5,
          alignSelf: "center",
        },
        style,
      ]}
    >
      {/* Background Image: money-bag2 */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 159,
          height: 159,
          top: 27,
          right: -20,
          opacity: 0.3,
          zIndex: 1,
        }}
      >
        <Image
          source={require("../../../../assets/images/money-bag2.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>

      {/* Decorative Background Shape */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: 250,
          height: 200,
          top: 100,
          left: 10,
          backgroundColor: "#E2E2E233",
          borderRadius: 100,
          zIndex: 2,
        }}
      />

      <View className="px-5 pt-[25px] h-full" style={{ zIndex: 10 }}>
        {/* Top Section */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-[15px] font-medium opacity-90">
              Total Savings
            </Text>
            {badge && (
              <View
                style={{
                  backgroundColor: badgeBg,
                  paddingHorizontal: 8,
                  paddingVertical: 2.5,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 9 }}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowBalance(!showBalance)}
            className="p-1"
            activeOpacity={0.7}
          >
            {showBalance ? (
              <Eye size={20} color="white" />
            ) : (
              <EyeOff size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Amount Section */}
        <View className="mb-2">
          {showBalance ? (
            <BalanceText amount={amount} fontSize={32} color="white" />
          ) : (
            <Text className="text-white text-[32px] font-extrabold tracking-tight">
              ***
            </Text>
          )}
          <View className="flex-row items-center space-x-1">
            <Text className="text-white text-[13px] font-medium opacity-80">
              Your wealth grew by ₦{growthFormatted} today
            </Text>
            <ArrowUp size={14} color="#95F370" />
          </View>
        </View>

        {/* Bottom Section */}
        {/* Description Text */}
        <Text
          className="text-white text-[10px] font-medium opacity-100"
          style={{
            position: "absolute",
            width: Platform.OS === "android" ? 135 : 170,
            top: Platform.OS === "android" ? 126 : 138,
            left: 10,
            lineHeight: 14,
          }}
        >
          {description}
        </Text>

        {/* Transfer Button */}
        {showButton && (
          <TouchableOpacity
            onPress={handleButtonPress}
            className="bg-[#FFCF65] items-center justify-center"
            style={{
              position: "absolute",
              width: Platform.OS === "android" ? 136 : 150,
              height: Platform.OS === "android" ? 32 : 37,
              top: Platform.OS === "android" ? 116 : 123,
              left: Platform.OS === "android" ? undefined : 186,
              right: Platform.OS === "android" ? 10 : undefined,
              borderRadius: Platform.OS === "android" ? 16 : 18,
            }}
            activeOpacity={0.9}
          >
            <Text
              className="text-[#1A1A1A] font-bold"
              style={{
                fontSize: Platform.OS === "android" ? 11 : 12,
              }}
            >
              Transfer to Portfolio
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
