import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface PortfolioCardProps {
  title: string;
  description: string;
  image: any;
  type: "flex" | "goal";
}

export const PortfolioCard = ({
  title,
  description,
  image,
  type,
}: PortfolioCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (type === "flex") {
      router.push("/wealth-flex" as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`relative overflow-hidden p-4 rounded-3xl mr-4 border w-[180px] h-[135px] ${
        type === "flex"
          ? "bg-[#FFF0EF] border-[#FEE2E2]"
          : "bg-[#FEE6F2] border-[#FCE7F3]"
      }`}
    >
      {/* Icon/Image */}
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${
          type === "flex" ? "bg-rose-100" : "bg-fuchsia-100"
        }`}
      >
        <Image
          source={image}
          className="w-5 h-5"
          resizeMode="contain"
          style={{ tintColor: type === "flex" ? "#EF4444" : "#D00E71" }}
        />
      </View>

      <View>
        <Text className="text-[#1A1A1A] font-bold text-sm mb-1">{title}</Text>
        <Text
          className="text-[#6B7280] text-[10px] leading-[14px] pr-4"
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {/* Background Decorative Image (Wallet or Target) */}
      <Image
        source={
          type === "flex"
            ? require("../../../../assets/images/wallet.png")
            : require("../../../../assets/images/arrow.png")
        }
        className="absolute w-16 h-16 -bottom-2 -right-2 opacity-10"
        resizeMode="contain"
        style={{ tintColor: type === "flex" ? "#155D5F" : "#FFCF65" }}
      />
    </TouchableOpacity>
  );
};
