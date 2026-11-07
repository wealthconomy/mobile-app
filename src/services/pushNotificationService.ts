import {
  getMessaging,
  getToken,
  requestPermission as requestFirebasePermission,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  AuthorizationStatus,
  RemoteMessage,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleNotificationNavigation } from "../utils/notificationRouter";
import { notificationApi } from "../store/api/notificationApi";
import { AppDispatch } from "../store";

const FCM_TOKEN_STORAGE_KEY = "@wealth_fcm_token";

// Configure how notifications are presented when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure Android notification channels (Required for Android 8.0+)
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Wealthconomy Notifications",
      description: "General and transactional alerts for Wealthconomy",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#155D5F",
      sound: "default",
      showBadge: true,
      enableLights: true,
      enableVibrate: true,
    });
  } catch (error) {
    console.warn("Failed to create Android notification channel:", error);
  }
}

/**
 * Retrieve unique hardware / vendor identifier
 */
export async function getDeviceId(): Promise<string> {
  try {
    if (Platform.OS === "android") {
      return Application.getAndroidId() || "android_device";
    }
    if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId || "ios_device";
    }
  } catch (err) {
    console.warn("Could not retrieve device ID:", err);
  }
  return "unknown_device";
}

/**
 * Request notification permissions from OS (iOS & Android 13+)
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    // 1. Setup Android channel
    if (Platform.OS === "android") {
      await setupAndroidNotificationChannel();
    }

    // 2. Request Firebase permission
    const messagingInstance = getMessaging();
    const authStatus = await requestFirebasePermission(messagingInstance);
    const isGranted =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    // 3. Check Expo Notifications permissions as backup
    if (!isGranted) {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    }

    return isGranted;
  } catch (error) {
    console.warn("Failed to request push notification permission:", error);
    return false;
  }
}

/**
 * Fetch and persist the current FCM registration token
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const messagingInstance = getMessaging();
    const token = await getToken(messagingInstance);
    if (token) {
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    }
    return token;
  } catch (error) {
    console.warn("Could not retrieve FCM token:", error);
    return null;
  }
}

/**
 * Get previously saved FCM token from storage
 */
export async function getStoredFcmToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Register the device push token with the Wealthconomy backend
 */
export async function registerPushTokenWithBackend(
  dispatch: AppDispatch,
  fcmToken?: string
): Promise<void> {
  try {
    const hasPermission = await requestPushPermission();
    if (!hasPermission) {
      console.log("Push notification permission not granted by user");
      return;
    }

    const token = fcmToken || (await getFcmToken());
    if (!token) {
      console.warn("No FCM token available for backend registration");
      return;
    }

    console.log("==========================================");
    console.log("📱 FCM Device Token for Testing:");
    console.log(token);
    console.log("==========================================");

    const deviceId = await getDeviceId();
    const platform = Platform.OS === "ios" ? "ios" : "android";
    const environment = __DEV__ ? "development" : "production";

    await dispatch(
      notificationApi.endpoints.registerPushToken.initiate({
        token,
        platform,
        deviceId,
        environment,
      })
    ).unwrap();

    console.log("Push token registered successfully with Wealthconomy backend");
  } catch (error) {
    console.error("Failed to register push token with backend:", error);
  }
}

/**
 * Deregister the device push token when user logs out
 */
export async function deregisterPushTokenFromBackend(
  dispatch: AppDispatch
): Promise<void> {
  try {
    const token = (await getStoredFcmToken()) || (await getFcmToken());
    if (token) {
      await dispatch(
        notificationApi.endpoints.deregisterPushToken.initiate({ token })
      ).unwrap();
      await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
      console.log("Push token deregistered from backend");
    }
  } catch (error) {
    console.warn("Failed to deregister push token from backend:", error);
  }
}

/**
 * Set up listeners for foreground messages, background tap navigation, cold-start tap navigation, and token refresh
 */
export function setupPushNotificationListeners(
  dispatch: AppDispatch,
  isAuthenticated: boolean
): () => void {
  const messagingInstance = getMessaging();

  // 1. App opened from cold start via notification tap
  getInitialNotification(messagingInstance)
    .then((remoteMessage: RemoteMessage | null) => {
      if (remoteMessage?.data) {
        console.log("App opened from cold start via notification tap:", remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      }
    })
    .catch((err: unknown) => console.warn("Error getting initial notification:", err));

  // 2. App opened from background via notification tap
  const unsubscribeNotificationOpened = onNotificationOpenedApp(
    messagingInstance,
    (remoteMessage: RemoteMessage) => {
      if (remoteMessage?.data) {
        console.log("App opened from background via notification tap:", remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      }
    }
  );

  // 3. Foreground message received: display local notification banner
  const unsubscribeForeground = onMessage(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      console.log("Foreground notification received:", remoteMessage);

      // Refresh inbox badge / list
      dispatch(notificationApi.util.invalidateTags(["Notification"]));

      // Display local banner if notification title/body is present
      if (remoteMessage.notification?.title || remoteMessage.notification?.body) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title ?? "Wealthconomy",
            body: remoteMessage.notification.body ?? "",
            data: remoteMessage.data ?? {},
            sound: "default",
          },
          trigger: null, // show immediately
        });
      }
    }
  );

  // 4. Local notification interaction listener (when user taps the foreground local banner)
  const localNotificationSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data) {
        handleNotificationNavigation(data);
      }
    });

  // 5. Token rotation listener
  const unsubscribeTokenRefresh = onTokenRefresh(
    messagingInstance,
    async (newToken: string) => {
      console.log("FCM token refreshed:", newToken);
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, newToken);
      if (isAuthenticated) {
        await registerPushTokenWithBackend(dispatch, newToken);
      }
    }
  );

  return () => {
    unsubscribeNotificationOpened();
    unsubscribeForeground();
    localNotificationSubscription.remove();
    unsubscribeTokenRefresh();
  };
}
