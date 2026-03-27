import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

const Header = ({ title, showBack = true, rightElement }: HeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 h-14 bg-white">
      <View className="w-11">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-base font-bold text-black text-center flex-1">
        {title}
      </Text>

      <View className="w-11 items-end">{rightElement}</View>
    </View>
  );
};

export default Header;
