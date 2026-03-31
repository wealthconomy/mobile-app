import {
  HomeIcon,
  MyAccountIcon,
  WealthSaveIcon,
  WealthVestIcon,
} from "@/src/components/TabIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#155D5F",
        tabBarInactiveTintColor: "#2E2E2E",
        headerShown: false, // change this to false globally
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          backgroundColor: "#fff",
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Wealthconomy",
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolios"
        options={{
          title: "Portfolio",
          unmountOnBlur: true,
          tabBarIcon: ({ color, focused }) => (
            <WealthSaveIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wealth-vest"
        options={{
          title: "Wealth Vest",
          tabBarIcon: ({ color, focused }) => (
            <WealthVestIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-account"
        options={{
          title: "My account",
          tabBarIcon: ({ color, focused }) => (
            <MyAccountIcon focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
