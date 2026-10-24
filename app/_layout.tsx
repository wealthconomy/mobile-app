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
import { UpdateRequiredModal } from "../src/components/common/UpdateRequiredModal";
import { SoftUpdatePrompt } from "../src/components/common/SoftUpdatePrompt";
import { useAppUpdateRequired } from "../src/hooks/useAppUpdateRequired";
import { useSoftAppUpdate } from "../src/hooks/useSoftAppUpdate";
import { ActivityIndicator, AppState, AppStateStatus, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch, useSelector } from "react-redux";
import "../global.css";
import { AppDispatch, RootState, store } from "../src/store";
import { loadAuthFromStorage } from "../src/store/slices/authSlice";
import { loadGroupsFromStorage } from "../src/store/slices/wealthGroupSlice";
import { lockAppForInactivity, isAppLockSuspended } from "../src/store/slices/appStatusSlice";

const queryClient = new QueryClient();

/**
 * Inactivity Lock Timeout in milliseconds.
 * Set to 0 to lock immediately upon the app moving to background.
 * Can be changed to > 0 (e.g. 45000) for a delayed background lock.
 */
const LOCK_TIMEOUT_MS = 0;

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
  const {
    isUpdateRequired,
    minAppVersion,
    currentVersion: requiredHookCurrentVersion,
    isReady,
  } = useAppUpdateRequired();
  const {
    isSoftPromptCandidate,
    isForcedUpdateByDeadline,
    currentVersion: softHookCurrentVersion,
    latestAppVersion,
    updateDeadline,
    updateMessage,
    isSnoozed,
    dismissPrompt,
  } = useSoftAppUpdate();
  const { isAuthenticated, hasCompletedOnboarding, isLoading, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const { isLocked, isInactivityLocked } = useSelector(
    (state: RootState) => state.appStatus,
  );

  const appVersion = softHookCurrentVersion || requiredHookCurrentVersion || null;
  const isForcedUpdate = isUpdateRequired || isForcedUpdateByDeadline;
  const forcedUpdateMessage = isForcedUpdateByDeadline ? (updateMessage || null) : null;
  const requiredVersion = isForcedUpdateByDeadline ? latestAppVersion : minAppVersion;

  const currentPath = segments.join("/");
  const isExemptScreen =
    segments[0] === "(auth)" ||
    segments[0] === "onboarding" ||
    currentPath.includes("setup-pin") ||
    currentPath.includes("change-passcode");

  const isSoftPromptEligible =
    isAuthenticated &&
    hasCompletedOnboarding &&
    !isExemptScreen &&
    !isForcedUpdate &&
    !isLocked &&
    !isInactivityLocked;

  const showSoftPrompt = isSoftPromptCandidate && !isSnoozed && isSoftPromptEligible;

  // Hide native splash screen only once both fonts and initial version check are ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  useEffect(() => {
    dispatch(loadAuthFromStorage());
    dispatch(loadGroupsFromStorage());
  }, [dispatch]);

  const backgroundTimeRef = useRef<number | null>(null);
  const latestStateRef = useRef({
    segments,
    user,
    isAuthenticated,
    hasCompletedOnboarding,
  });

  useEffect(() => {
    latestStateRef.current = {
      segments,
      user,
      isAuthenticated,
      hasCompletedOnboarding,
    };
  }, [segments, user, isAuthenticated, hasCompletedOnboarding]);

  // Cold-start lock safeguard: ensure passcode modal is showing before dashboard renders
  const coldStartLockCheckedRef = useRef(false);
  useEffect(() => {
    if (isLoading) return;
    if (!coldStartLockCheckedRef.current) {
      coldStartLockCheckedRef.current = true;
      const currentPath = segments.join("/");
      const isExemptScreen =
        segments[0] === "(auth)" ||
        segments[0] === "onboarding" ||
        currentPath.includes("setup-pin") ||
        currentPath.includes("change-passcode");

      if (
        isAuthenticated &&
        hasCompletedOnboarding &&
        user?.hasAppPasscode &&
        !isExemptScreen
      ) {
        dispatch(lockAppForInactivity());
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    user?.hasAppPasscode,
    segments,
    dispatch,
  ]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // 3. Do NOT lock on 'inactive' alone (iOS system dialogs, Face ID prompt, notification shade)
      if (nextAppState === "background") {
        // 4. Do NOT lock when lock is temporarily suspended (camera, photo picker, document picker, biometrics)
        if (isAppLockSuspended()) {
          return;
        }

        const {
          segments: currentSegments,
          user: currentUser,
          isAuthenticated: isAuth,
          hasCompletedOnboarding: isOnboarded,
        } = latestStateRef.current;

        const currentPath = currentSegments.join("/");
        // 5. Never lock on login, signup, onboarding, or passcode-creation screens
        const isExemptScreen =
          currentSegments[0] === "(auth)" ||
          currentSegments[0] === "onboarding" ||
          currentPath.includes("setup-pin") ||
          currentPath.includes("change-passcode");

        const hasPasscode = Boolean(currentUser?.hasAppPasscode);
        const isEligibleToLock =
          isAuth && isOnboarded && hasPasscode && !isExemptScreen;

        if (isEligibleToLock) {
          if (LOCK_TIMEOUT_MS === 0) {
            // Immediate lock on background transition
            dispatch(lockAppForInactivity());
          } else {
            backgroundTimeRef.current = Date.now();
          }
        }
      } else if (nextAppState === "active") {
        if (
          LOCK_TIMEOUT_MS > 0 &&
          backgroundTimeRef.current &&
          !isAppLockSuspended()
        ) {
          const {
            segments: currentSegments,
            user: currentUser,
            isAuthenticated: isAuth,
            hasCompletedOnboarding: isOnboarded,
          } = latestStateRef.current;

          const currentPath = currentSegments.join("/");
          const isExemptScreen =
            currentSegments[0] === "(auth)" ||
            currentSegments[0] === "onboarding" ||
            currentPath.includes("setup-pin") ||
            currentPath.includes("change-passcode");

          const hasPasscode = Boolean(currentUser?.hasAppPasscode);
          const isEligibleToLock =
            isAuth && isOnboarded && hasPasscode && !isExemptScreen;

          const elapsedMs = Date.now() - backgroundTimeRef.current;
          if (isEligibleToLock && elapsedMs >= LOCK_TIMEOUT_MS) {
            dispatch(lockAppForInactivity());
          }
        }
        backgroundTimeRef.current = null;
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    const inSetupPin = inAuthGroup && segments[1] === "setup-pin";
    const inPasswordResetFlow =
      inAuthGroup &&
      (segments[1] === "forgot-password" ||
        segments[1] === "otp" ||
        segments[1] === "reset-password" ||
        segments[1] === "success");

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
      if (!inSetupPin && !inPasswordResetFlow) {
        router.replace("/(auth)/setup-pin" as any);
      }
    } else if (inAuthGroup || inOnboarding) {
      if (!inSetupPin && !inPasswordResetFlow) {
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
              name="education/library"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="education/library/[id]"
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
            <Stack.Screen
              name="payment/return"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
      {/* Global modals: Lockout and Inactivity Session Shield */}
      {!isForcedUpdate && (
        <>
          <GlobalLockoutModal />
          <AppInactivityLockModal />
        </>
      )}
      {/* Soft update prompt (only when not forced, not locked, not on exempt screen, etc.) */}
      <SoftUpdatePrompt
        visible={showSoftPrompt}
        currentVersion={appVersion}
        latestAppVersion={latestAppVersion}
        updateDeadline={updateDeadline}
        updateMessage={updateMessage}
        onDismiss={dismissPrompt}
      />
      {/* Full-screen absolute overlay: Update Required */}
      <UpdateRequiredModal
        visible={isForcedUpdate}
        message={forcedUpdateMessage}
        currentVersion={appVersion}
        requiredVersion={requiredVersion}
      />
    </SafeAreaProvider>
  );
}
