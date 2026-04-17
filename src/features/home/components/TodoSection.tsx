import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
  isComplete: boolean;
  dependency?: string; // id of task that must be complete
}

const TODO_DATA: TodoItem[] = [
  {
    id: "kyc-l2",
    title: "Proceed to level 2",
    description: "Complete your KYC registration to enable withdrawal",
    icon: "id-card-outline",
    path: "/profile/kyc/level-2" as any,
    isComplete: false,
  },
  {
    id: "kyc-l3",
    title: "Proceed to level 3",
    description: "Verify your address to remove all transaction limits",
    icon: "location-outline",
    path: "/profile/kyc/level-3" as any,
    isComplete: false,
    dependency: "kyc-l2",
  },
  {
    id: "secure",
    title: "Secure your account",
    description: "Enable biometrics or 2FA for enhanced security",
    icon: "shield-checkmark-outline",
    path: "/profile/security" as any,
    isComplete: false,
  },
  {
    id: "fund",
    title: "Fund your wallet",
    description: "Make your first deposit to start building wealth",
    icon: "wallet-outline",
    path: "/wallet/deposit" as any,
    isComplete: false,
  },
  {
    id: "goal",
    title: "Set your first Goal",
    description: "Build the discipline to reach your financial goals",
    icon: "flag-outline",
    path: "/portfolios" as any,
    isComplete: false,
  },
  {
    id: "tribe",
    title: "Join a Tribe",
    description: "Join a wealth community to grow with others",
    icon: "people-outline",
    path: "/portfolios/wealth-group" as any,
    isComplete: false,
  },
  {
    id: "email",
    title: "Verify your email",
    description: "Confirm your email to secure your account access",
    icon: "mail-outline",
    path: "/profile/verify-email" as any,
    isComplete: true,
  },
];

const TodoCard = ({
  item,
  onPress,
}: {
  item: TodoItem;
  onPress: (path: any) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => onPress(item.path)}
    className="rounded-[15px] p-4 mr-4 relative"
    style={{
      width: 218,
      height: 91,
      backgroundColor: "#FFCF6533",
    }}
  >
    <View className="flex-row justify-between items-start mb-1">
      <Text
        className="text-[#1A1A1A] font-bold text-[14px] leading-tight flex-1 mr-2"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <View className="mt-[-2px]">
        <Ionicons name={item.icon} size={18} color="#1A1A1A" />
      </View>
    </View>
    <Text
      className="text-[#64748B] text-[10px] leading-[14px] font-medium pr-2"
      numberOfLines={2}
    >
      {item.description}
    </Text>

    {!item.isComplete && (
      <View
        className="absolute w-[12px] h-[12px] rounded-full bg-[#FF4B4B] border-[2px] border-white"
        style={{ top: -2, right: -2 }}
      />
    )}
  </TouchableOpacity>
);

export const TodoSection = () => {
  const router = useRouter();

  // Logic: Only show incomplete tasks, and hide those with incomplete dependencies
  const visibleTodos = TODO_DATA.filter((item) => {
    if (item.isComplete) return false;
    if (item.dependency) {
      const dep = TODO_DATA.find((t) => t.id === item.dependency);
      return dep ? dep.isComplete : true;
    }
    return true;
  });

  if (visibleTodos.length === 0) return null;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">Todo</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {visibleTodos.map((item) => (
          <TodoCard
            key={item.id}
            item={item}
            onPress={(path) => router.push(path)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
