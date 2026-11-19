import {
  getMessaging,
  getToken,
  requestPermission as requestFirebasePermission,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  setBackgroundMessageHandler,
  AuthorizationStatus,
  RemoteMessage,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  handleNotificationNavigation,
  NotificationPayloadData,
} from "../utils/notificationRouter";
import { notificationApi } from "../store/api/notificationApi";
import { AppDispatch } from "../store";

const FCM_TOKEN_STORAGE_KEY = "@wealth_fcm_token";

let pendingNotificationData: NotificationPayloadData | null = null;
let isNavigationReady = false;
let hasCheckedInitialNotification = false;
let hasRegisteredBackgroundHandler = false;

// Cache of recently received message IDs to prevent duplicate processing
const processedMessageIds = new Map<string, number>();

function isDuplicateMessage(messageId?: string): boolean {
  if (!messageId) return false;
  const now = Date.now();
  // Prune entries older than 30 seconds
  for (const [id, timestamp] of processedMessageIds.entries()) {
    if (now - timestamp > 30000) {
      processedMessageIds.delete(id);
    }
  }
  if (processedMessageIds.has(messageId)) {
    return true;
  }
  processedMessageIds.set(messageId, now);
  return false;
}

function logPushEvent(stage: string, payload?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`\n========== [PUSH][${stage}] ${timestamp} ==========`);
  if (payload !== undefined) {
    try {
      console.log(JSON.stringify(payload, null, 2));
    } catch {
      console.log(payload);
    }
  }
  console.log("========================================================\n");
}

// Register background/headless FCM receiver once at module load
try {
  if (!hasRegisteredBackgroundHandler) {
    hasRegisteredBackgroundHandler = true;
    setBackgroundMessageHandler(getMessaging(), async (remoteMessage: RemoteMessage) => {
      logPushEvent("RECEIVED_BACKGROUND", {
        messageId: remoteMessage.messageId,
        sentTime: remoteMessage.sentTime,
        notification: remoteMessage.notification,
        data: remoteMessage.data,
      });
    });
  }
} catch (error) {
  console.warn("[PUSH] Could not register background message handler:", error);
}

export function setNotificationNavigationReady(ready: boolean): void {
  isNavigationReady = ready;
  if (ready && pendingNotificationData) {
    const nextData = pendingNotificationData;
    pendingNotificationData = null;
    logPushEvent("FLUSH_QUEUED_NAVIGATION", nextData);
    handleNotificationNavigation(nextData);
  }
}

export function clearPendingNotificationNavigation(): void {
  pendingNotificationData = null;
}

function queueOrNavigateNotification(data?: NotificationPayloadData | null): void {
  if (!data) {
    logPushEvent("TAP_NO_DATA", "Notification had no `data` payload to route.");
    return;
  }

  if (isNavigationReady) {
    logPushEvent("NAVIGATE_NOW", data);
    handleNotificationNavigation(data);
  } else {
    logPushEvent("QUEUED_UNTIL_UNLOCKED_OR_READY", data);
    pendingNotificationData = data;
  }
}

// Configure how notifications are presented when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
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

    logPushEvent("TOKEN_REGISTER_REQUEST", {
      platform,
      deviceId,
      environment,
      tokenPreview: `${token.slice(0, 18)}...${token.slice(-10)}`,
    });

    const response = await dispatch(
      notificationApi.endpoints.registerPushToken.initiate({
        token,
        platform,
        deviceId,
        environment,
      })
    ).unwrap();

    logPushEvent("TOKEN_REGISTERED_SUCCESS", response);
  } catch (error) {
    console.error("[PUSH][TOKEN_REGISTER_FAILED]", error);
  }
}

/**
 * Deregister the device push token when user logs out
 */
export async function deregisterPushTokenFromBackend(
  dispatch: AppDispatch
): Promise<void> {
  clearPendingNotificationNavigation();
  setNotificationNavigationReady(false);
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

  logPushEvent("LISTENERS_ACTIVE", { isAuthenticated });

  // 1. App opened from cold start via notification tap (handle once per runtime launch)
  if (!hasCheckedInitialNotification) {
    hasCheckedInitialNotification = true;
    getInitialNotification(messagingInstance)
      .then((remoteMessage: RemoteMessage | null) => {
        if (remoteMessage) {
          logPushEvent("TAP_COLD_START", {
            messageId: remoteMessage.messageId,
            notification: remoteMessage.notification,
            data: remoteMessage.data,
          });
          queueOrNavigateNotification(remoteMessage.data);
        }
      })
      .catch((err: unknown) => console.warn("[PUSH] Error getting initial notification:", err));
  }

  // 2. App opened from background via notification tap
  const unsubscribeNotificationOpened = onNotificationOpenedApp(
    messagingInstance,
    (remoteMessage: RemoteMessage) => {
      logPushEvent("TAP_BACKGROUND", {
        messageId: remoteMessage.messageId,
        notification: remoteMessage.notification,
        data: remoteMessage.data,
      });
      queueOrNavigateNotification(remoteMessage.data);
    }
  );

  // 3. Foreground message received: display local notification banner
  const unsubscribeForeground = onMessage(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      if (isDuplicateMessage(remoteMessage.messageId)) {
        logPushEvent("DUPLICATE_MESSAGE_SKIPPED", {
          messageId: remoteMessage.messageId,
        });
        return;
      }

      logPushEvent("RECEIVED_FOREGROUND", {
        messageId: remoteMessage.messageId,
        sentTime: remoteMessage.sentTime,
        notification: remoteMessage.notification,
        data: remoteMessage.data,
      });

      // Refresh inbox badge / list
      dispatch(notificationApi.util.invalidateTags(["Notification"]));

      // Display local banner if notification or data title/body is present
      const title =
        remoteMessage.notification?.title ??
        (typeof remoteMessage.data?.title === "string"
          ? remoteMessage.data.title
          : undefined);
      const body =
        remoteMessage.notification?.body ??
        (typeof remoteMessage.data?.body === "string"
          ? remoteMessage.data.body
          : undefined);

      if (title || body) {
        // NOTE: On iOS, if remoteMessage.notification is present, iOS (UNUserNotificationCenter)
        // already presents the remote notification natively via setNotificationHandler({ shouldShowBanner: true }).
        // Scheduling a local notification here on iOS causes a duplicate banner!
        const isIosRemoteWithNotification =
          Platform.OS === "ios" && Boolean(remoteMessage.notification);

        if (!isIosRemoteWithNotification) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: title ?? "Wealthconomy",
              body: body ?? "",
              data: remoteMessage.data ?? {},
              sound: "default",
            },
            trigger: null, // show immediately
          });
          logPushEvent("LOCAL_BANNER_DISPLAYED", { title, body });
        } else {
          logPushEvent("IOS_NATIVE_BANNER_HANDLED", {
            note: "iOS displayed remote banner natively via setNotificationHandler; skipped local duplicate",
            title,
            body,
          });
        }
      } else {
        logPushEvent("FOREGROUND_SILENT_DATA_ONLY", remoteMessage.data ?? {});
      }
    }
  );

  // 4. Local notification interaction listener (when user taps the foreground local banner)
  const localNotificationSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      logPushEvent("TAP_LOCAL_BANNER", {
        title: response.notification.request.content.title,
        data,
      });
      if (data) {
        queueOrNavigateNotification(data as NotificationPayloadData);
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
