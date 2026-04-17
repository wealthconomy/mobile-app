import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

const Header = ({
  title,
  showBack = true,
  rightElement,
  onBack,
}: HeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 h-14 bg-white">
      <View className="min-w-[44px]">
        {showBack && (
          <TouchableOpacity
            onPress={onBack || (() => router.back())}
            className="w-11 h-11 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <Text
        numberOfLines={1}
        className="text-xl font-extrabold text-[#323232] text-center flex-1 px-2"
      >
        {title}
      </Text>

      <View className="min-w-[44px] items-end">{rightElement}</View>
    </View>
  );
};

export default Header;
