import { BalanceText } from "@/src/components/common/BalanceText";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

export const WealthCard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const router = useRouter();

  return (
    <View
      className="relative overflow-hidden"
      style={{
        width: 365,
        height: 170,
        borderRadius: 20,
        backgroundColor: "#008185",
        shadowColor: "#323232",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 13,
        elevation: 10,
        alignSelf: "center",
      }}
    >
      {/* SVG Background Patterns & Overlays */}
      <View className="absolute inset-0">
        <Svg width="365" height="170" viewBox="0 0 365 170" fill="none">
          <Defs>
            <ClipPath id="clip-card">
              <Rect width="365" height="170" rx="20" fill="white" />
            </ClipPath>
          </Defs>
          <G clipPath="url(#clip-card)">
            {/* Money Bag Image Placeholder/Overlay in SVG style */}
            {/* We will use the actual Image below for better control, but here is the overlay path from design */}
            <Path
              d="M12.8547 103.501C199.278 216 201.16 10.4858 336.742 62.6498C472.323 114.814 336.742 216 336.742 216H12.8547C12.8547 216 -173.568 -8.99748 12.8547 103.501Z"
              fill="white"
              fillOpacity="0.1"
            />
          </G>
        </Svg>
      </View>

      {/* Money Bag Image */}
      <Image
        source={require("../../../../assets/images/money-bag.png")}
        className="absolute"
        style={{
          width: 210,
          height: 210,
          top: -39,
          left: 228,
          opacity: 0.3,
          transform: [{ rotate: "20.35deg" }],
        }}
        resizeMode="contain"
      />

      <View
        className="p-[17.5px] h-full justify-between"
        style={{ zIndex: 10 }}
      >
        <View style={{ gap: 4 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-[13px] font-medium opacity-70">
              Total Wealth
            </Text>
            <TouchableOpacity
              onPress={() => setShowBalance(!showBalance)}
              className="p-1"
              activeOpacity={0.7}
            >
              {showBalance ? (
                <Eye size={18} color="white" />
              ) : (
                <EyeOff size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-baseline"
            onPress={() => router.push("/win-up" as any)}
            activeOpacity={0.8}
          >
            {showBalance ? (
              <BalanceText amount="₦300,735.42" fontSize={32} color="white" />
            ) : (
              <Text className="text-white text-[32px] font-extrabold tracking-tight">
                ••••••••
              </Text>
            )}
            <Text className="text-white text-[35px] font-light ml-5 mb-1">
              ›
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center space-x-1 mt-1">
            <Text className="text-white text-[12px] font-medium">
              Your wealth grew by N230.00 today
            </Text>
            <Text className="text-[#95F370] text-[14px] font-bold">↑</Text>
          </View>
        </View>

        {/* View Wealth Button - Navigates to Portfolio */}
        <TouchableOpacity
          className="bg-[#FFCF65] flex-row items-center justify-center"
          style={{
            width: 128,
            height: 37,
            borderRadius: 10,
            padding: 10,
            alignSelf: "flex-end",
            marginBottom: 5,
            marginRight: 5,
          }}
          activeOpacity={0.9}
          onPress={() => router.push("/portfolios/" as any)}
        >
          <Text className="text-[#1A1A1A] font-bold text-[12px]">
            View Wealth
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
