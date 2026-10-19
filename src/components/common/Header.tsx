import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/common/ui/Text";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
  align?: "center" | "left";
}

const Header = ({
  title,
  showBack = true,
  rightElement,
  onBack,
  align = "center",
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
        variant="h2"
        className={`font-kumbh-extrabold flex-1 px-2 ${
          align === "left" ? "text-left" : "text-center"
        }`}
      >
        {title}
      </Text>

      <View className="min-w-[44px] items-end">{rightElement}</View>
    </View>
  );
};

export default Header;
