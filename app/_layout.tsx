import { useColorScheme } from "@/components/useColorScheme";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import "../global.css";
import { RootState, store } from "../src/store";

const queryClient = new QueryClient();

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const inTabs = segments[0] === "(tabs)";

    if (!hasCompletedOnboarding) {
      if (!inOnboarding) router.replace("/onboarding" as any);
    } else if (!isAuthenticated) {
      if (!inAuthGroup) router.replace("/(auth)/login" as any);
    } else if (inAuthGroup || inOnboarding) {
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, hasCompletedOnboarding, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#155D5F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile/notifications/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/notifications/settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transactions/activities"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="education/win-up"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transactions/wealth-flex"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="education/wise-up"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="support/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="support/faq" options={{ headerShown: false }} />
            <Stack.Screen
              name="support/chat"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/create/goal"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/create/fix"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/detail/goal/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/detail/fix/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/create/fam"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/detail/fam/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/create/auto"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/detail/auto/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/create/group"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/detail/group/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="wallet/top-up"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/invite"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transactions/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transactions/detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="wallet/deposit"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="wallet/withdraw"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/security"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="support/reading-list"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="blog/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="payment/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payment/add-bank"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payment/use-card"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payment/account-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payment/insert-pin"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
