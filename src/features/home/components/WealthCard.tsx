import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export const WealthCard = () => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <View className="w-full bg-primary rounded-[32px] p-6 relative overflow-hidden h-[190px] shadow-lg shadow-black">
      {/* Decorative Money Bag Background */}
      <Image
        source={require("../../../../assets/images/money-bag.png")}
        className="absolute w-[160px] h-[160px] -top-5 -right-[30px] opacity-15 rotate-[-15deg]"
        resizeMode="contain"
      />

      {/* Decorative Gradient/Overlay Effect */}
      <View className="absolute w-full h-full bg-white/5 rounded-[32px] top-1/2 -left-[10%] rotate-[-10deg]" />

      <View className="z-10 h-full justify-between">
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white/70 text-sm font-medium">
              Total Wealth
            </Text>
            <TouchableOpacity
              onPress={() => setShowBalance(!showBalance)}
              className="p-1"
            >
              {showBalance ? (
                <Eye size={18} color="rgba(255,255,255,0.8)" />
              ) : (
                <EyeOff size={18} color="rgba(255,255,255,0.8)" />
              )}
            </TouchableOpacity>
          </View>
          <View className="flex-row items-baseline space-x-2">
            <Text className="text-white text-4xl font-bold tabular-nums">
              {showBalance ? "₦300,735.42" : "••••••••"}
            </Text>
            <TouchableOpacity className="p-1">
              <Text className="text-white/60 text-lg">›</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center space-x-1.5 mt-2 bg-white/20 self-start px-2.5 py-1 rounded-full">
            <Text className="text-white/95 text-[10px] font-medium">
              Your wealth grew to{" "}
              <Text className="font-bold">N230.00 today</Text>
            </Text>
            <Text className="text-[#A7F3D0] text-[10px] font-extrabold">↑</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-gold rounded-2xl py-2.5 px-6 self-end"
          activeOpacity={0.9}
        >
          <Text className="text-black font-bold text-xs uppercase tracking-wider">
            View Wealth
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
