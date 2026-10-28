import {
  HomeIcon,
  MyAccountIcon,
  WealthSaveIcon,
  WealthVestIcon,
} from "@/src/components/TabIcons";
import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
          height: Platform.OS === "ios" ? 88 : 70 + insets.bottom,
          paddingBottom:
            Platform.OS === "ios" ? 28 : Math.max(8, 12 + insets.bottom),
          paddingTop: 12,
        },
        tabBarLabel: ({ children, color }) => (
          <Text
            maxFontSizeMultiplier={1.2}
            numberOfLines={1}
            style={{
              fontSize: 12,
              marginTop: 4,
              fontWeight: "500",
              color,
              textAlign: "center",
            }}
          >
            {children}
          </Text>
        ),
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
          tabBarIcon: ({ color, focused }) => (
            <WealthSaveIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wealth-vest"
        options={{
          title: "WealthVest",
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
