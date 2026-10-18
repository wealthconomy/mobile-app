import { useColorScheme } from "@/components/useColorScheme";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  KumbhSans_300Light,
  KumbhSans_400Regular,
  KumbhSans_500Medium,
  KumbhSans_600SemiBold,
  KumbhSans_700Bold,
  KumbhSans_800ExtraBold,
} from "@expo-google-fonts/kumbh-sans";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { GlobalLockoutModal } from "../src/components/common/GlobalLockoutModal";
import { AppInactivityLockModal } from "../src/components/common/AppInactivityLockModal";
import { ActivityIndicator, AppState, AppStateStatus, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch, useSelector } from "react-redux";
import "../global.css";
import { AppDispatch, RootState, store } from "../src/store";
import { loadAuthFromStorage } from "../src/store/slices/authSlice";
import { loadGroupsFromStorage } from "../src/store/slices/wealthGroupSlice";
import { lockAppForInactivity } from "../src/store/slices/appStatusSlice";

const queryClient = new QueryClient();

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    KumbhSans_300Light,
    KumbhSans_400Regular,
    KumbhSans_500Medium,
    KumbhSans_600SemiBold,
    KumbhSans_700Bold,
    KumbhSans_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
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
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, hasCompletedOnboarding, isLoading, user } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    dispatch(loadAuthFromStorage());
    dispatch(loadGroupsFromStorage());
  }, [dispatch]);

  // Inactivity / Background Auto-lock (45-60 seconds)
  const backgroundTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        backgroundTimeRef.current = Date.now();
      } else if (nextAppState === "active") {
        if (backgroundTimeRef.current && isAuthenticated) {
          const elapsedSeconds = (Date.now() - backgroundTimeRef.current) / 1000;
          // If app was left in background for 45 seconds or more, lock it
          if (elapsedSeconds >= 45) {
            dispatch(lockAppForInactivity());
          }
        }
        backgroundTimeRef.current = null;
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const inSetupPin = inAuthGroup && segments[1] === "setup-pin";

    // Check if authenticated user needs to setup their transaction PIN or app passcode
    const needsSecuritySetup =
      isAuthenticated &&
      user &&
      (user.hasTransactionPin === false || user.hasAppPasscode === false);

    if (!hasCompletedOnboarding) {
      if (!inOnboarding) {
        router.replace("/onboarding" as any);
      }
    } else if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login" as any);
      }
    } else if (needsSecuritySetup) {
      if (!inSetupPin) {
        router.replace("/(auth)/setup-pin" as any);
      }
    } else if (inAuthGroup || inOnboarding) {
      if (!inSetupPin) {
        router.replace("/(tabs)" as any);
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, segments, isLoading, user]);

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
              name="transactions/activities/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transactions/activities/[id]"
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
              name="portfolio/create/flow"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/detail/flow/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="portfolio/create/group"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="kyc/level2-intro"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="kyc/level2" options={{ headerShown: false }} />
            <Stack.Screen
              name="kyc/level3-intro"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="kyc/level3" options={{ headerShown: false }} />
            <Stack.Screen
              name="transactions/index"
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
              name="profile/my-referrals"
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
              name="profile/about"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/terms"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/privacy"
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
      {/* Global modals: Lockout and Inactivity Session Shield */}
      <GlobalLockoutModal />
      <AppInactivityLockModal />
    </SafeAreaProvider>
  );
}
