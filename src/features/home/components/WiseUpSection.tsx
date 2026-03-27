import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface WiseUpCardProps {
  title: string;
  description: string;
  image: any;
}

export const WiseUpCard = ({ title, description, image }: WiseUpCardProps) => (
  <View className="bg-[#F8F8F8] rounded-[10px] mr-4 overflow-hidden border border-gray-100 w-[169px] h-[107px]">
    <Image
      source={image}
      className="absolute w-full h-full"
      resizeMode="cover"
    />
    <View className="flex-1 bg-black/40 p-3 justify-end">
      <Text
        className="text-white font-bold text-[11px] leading-tight mb-0.5"
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text className="text-white/70 text-[9px]" numberOfLines={1}>
        {description}
      </Text>
    </View>
  </View>
);

export const WiseUpSection = () => {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">Wise Up</Text>
        <TouchableOpacity>
          <Text className="text-[#155D5F] text-sm font-medium">View all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
      >
        <WiseUpCard
          title="Emergency Funds 101"
          description="Why your Wealth Flex account is..."
          image={require("../../../../assets/images/advert.jpg")}
        />
        <WiseUpCard
          title="Automation Secrets"
          description="How to build wealth while you sleep."
          image={require("../../../../assets/images/advert.jpg")}
        />
        <WiseUpCard
          title="Investment Basics"
          description="Start growing your wealth today."
          image={require("../../../../assets/images/advert.jpg")}
        />
      </ScrollView>
    </View>
  );
};
