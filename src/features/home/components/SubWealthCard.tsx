import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { BalanceText } from "../../../components/common/BalanceText";

interface SubWealthCardProps {
  description: string;
  amount?: string;
  onButtonPress?: () => void;
  showButton?: boolean;
}

export const SubWealthCard = ({
  description,
  amount = "₦300,735.42",
  onButtonPress,
  showButton = true,
}: SubWealthCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      router.push("/portfolios/" as any);
    }
  };

  return (
    <View
      className="relative overflow-hidden"
      style={{
        width: 366,
        height: 170,
        borderRadius: 20,
        backgroundColor: "#155D5F",
        borderWidth: 0.7,
        borderColor: "#D9D9D9",
        shadowColor: "#323232",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 13,
        elevation: 5,
        alignSelf: "center",
      }}
    >
      {/* Background Image: money-bag2 */}
      <Image
        source={require("../../../../assets/images/money-bag2.png")}
        className="absolute"
        style={{
          width: 159,
          height: 159,
          top: 27,
          left: 247,
          opacity: 0.3,
          zIndex: 1,
        }}
        resizeMode="contain"
      />

      {/* Decorative Background Shape */}
      <View
        className="absolute"
        style={{
          width: 210,
          height: 200,
          top: 120,
          left: 10,
          backgroundColor: "#E2E2E233",
          borderRadius: 100,
          zIndex: 5,
        }}
      />

      <View className="px-5 pt-[25px] h-full" style={{ zIndex: 10 }}>
        {/* Top Section */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white text-[15px] font-medium opacity-90">
            Total Savings
          </Text>
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
              ••••••••
            </Text>
          )}
          <View className="flex-row items-center space-x-1">
            <Text className="text-white text-[13px] font-medium opacity-80">
              Your wealth grew by N230.00 today
            </Text>
            <Text className="text-[#95F370] text-[14px] font-bold">↑</Text>
          </View>
        </View>

        {/* Bottom Section */}
        {/* Description Text */}
        <Text
          className="text-white text-[10px] font-medium opacity-100"
          style={{
            position: "absolute",
            width: 170,
            top: 138,
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
              width: 171,
              height: 37,
              top: 123,
              left: 186,
              borderRadius: 10,
            }}
            activeOpacity={0.9}
          >
            <Text className="text-[#1A1A1A] font-bold text-[12px]">
              Transfer to Portfolio
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
