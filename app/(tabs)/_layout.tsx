import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Tabs } from "expo-router";
import { Home, PiggyBank, TrendingUp, User } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#155D5F",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontWeight: "bold", color: "#323232" },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          backgroundColor: "#fff",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Wealthconomy",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wealth-save"
        options={{
          title: "Wealth Save",
          tabBarIcon: ({ color }) => <PiggyBank size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wealth-vest"
        options={{
          title: "Wealth Vest",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "My Account",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
