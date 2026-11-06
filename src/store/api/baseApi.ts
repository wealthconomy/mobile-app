import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";
import { logout, setCredentials } from "../slices/authSlice";
import { setLockout } from "../slices/appStatusSlice";

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data: T;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const isPublicEndpoint = (url: string): boolean => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].trim().toLowerCase();

  // Public config, health, or static routes
  if (
    cleanUrl.includes("/public/") ||
    cleanUrl.startsWith("/public") ||
    cleanUrl.startsWith("public/") ||
    cleanUrl.includes("/health")
  ) {
    return true;
  }

  // Public authentication endpoints
  if (
    cleanUrl.endsWith("/auth/login") ||
    cleanUrl.endsWith("/auth/register") ||
    cleanUrl.endsWith("/auth/request-otp") ||
    cleanUrl.endsWith("/auth/verify-otp") ||
    cleanUrl.endsWith("/auth/forgot-password") ||
    cleanUrl.endsWith("/auth/reset-password") ||
    cleanUrl.endsWith("/auth/refresh") ||
    cleanUrl.endsWith("/auth/biometric-login") ||
    cleanUrl.endsWith("/auth/logout")
  ) {
    return true;
  }

  return false;
};

// Module-level single-flight synchronization
let refreshPromise: Promise<boolean> | null = null;
let hasDispatchedLogout = false;
let lastSessionToken: string | null = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    if (!endpoint?.toLowerCase().includes("upload") && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return headers;
  },
});

/**
 * Advanced Re-authentication interceptor
 * Automatically catches 401 errors and hits /auth/refresh with rotating refreshToken.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const requestUrl = typeof args === "string" ? args : args.url;
  const state = api.getState() as RootState;
  const requestToken = state.auth.token;
  const isPublic = isPublicEndpoint(requestUrl);

  // 1. Guard against firing protected requests without a token
  if (!requestToken && !isPublic) {
    return {
      error: {
        status: 401,
        data: {
          message: "Not authenticated",
        },
      },
    };
  }

  // Reset single-flight logout tracking if a new session token is detected
  if (requestToken && requestToken !== lastSessionToken) {
    lastSessionToken = requestToken;
    hasDispatchedLogout = false;
    refreshPromise = null;
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const currentState = api.getState() as RootState;
    const currentToken = currentState.auth.token;
    const isAuthenticated = currentState.auth.isAuthenticated;
    const refreshToken = currentState.auth.refreshToken;

    // 2. Ignore 401 if state is not authenticated or token changed while request was in-flight
    if (!isAuthenticated || !currentToken || currentToken !== requestToken) {
      return result;
    }

    // Do not force logout if operating with mock tokens or without backend URL configured
    if (currentToken.startsWith("mock-jwt-token") || !process.env.EXPO_PUBLIC_API_URL) {
      return result;
    }

    // 3. Single-flight refresh attempt
    if (refreshToken) {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshResult = await rawBaseQuery(
              {
                url: "/auth/refresh",
                method: "POST",
                body: { refreshToken },
              },
              api,
              extraOptions
            );

            if (refreshResult.data) {
              const res = refreshResult.data as ApiResponse<{
                accessToken: string;
                refreshToken: string;
                user: any;
              }>;

              if (res?.data?.accessToken) {
                lastSessionToken = res.data.accessToken;
                hasDispatchedLogout = false;
                api.dispatch(
                  setCredentials({
                    user: res.data.user,
                    token: res.data.accessToken,
                    refreshToken: res.data.refreshToken,
                  })
                );
                return true;
              }
            }
            return false;
          } catch {
            return false;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const refreshSuccess = await refreshPromise;
      if (refreshSuccess) {
        // Retry original request with newly issued credentials
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // 4. Never dispatch logout when already logged out, and ensure single-flight logout per session
        const latestState = api.getState() as RootState;
        if (latestState.auth.isAuthenticated && !hasDispatchedLogout) {
          hasDispatchedLogout = true;
          api.dispatch(logout());
        }
      }
    } else {
      // No refresh token available - single-flight logout
      const latestState = api.getState() as RootState;
      if (latestState.auth.isAuthenticated && !hasDispatchedLogout) {
        hasDispatchedLogout = true;
        api.dispatch(logout());
      }
    }
  }

  return result;
};

/**
 * Global Lockout interceptor
 * Wraps the reauth chain. Detects Maintenance / Suspended / Blocked signals from any
 * API response and dispatches setLockout into Redux.
 *
 * Only fires when the user is authenticated — errors on the login screen surface
 * normally to the form instead of being swallowed by the lockout modal.
 */
const baseQueryWithLockout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQueryWithReauth(args, api, extraOptions);

  if (result.error) {
    try {
      // Only intercept for authenticated users — leave login/signup errors alone
      const isAuthenticated = (api.getState() as RootState).auth.isAuthenticated;
      if (!isAuthenticated) return result;

      const status = result.error.status;
      const errorData: any = result.error.data;

      const rawMsg = Array.isArray(errorData?.message)
        ? errorData.message.join(" ")
        : typeof errorData?.message === "string"
        ? errorData.message
        : typeof errorData?.error === "string"
        ? errorData.error
        : typeof errorData?.code === "string"
        ? errorData.code
        : typeof errorData === "string"
        ? errorData
        : "";

      const errorMsg = rawMsg.toLowerCase();
      const errorCode: string = (typeof errorData?.code === "string" ? errorData.code : "").toUpperCase();
      const lockoutMessage = Array.isArray(errorData?.message)
        ? errorData.message.join(", ")
        : typeof errorData?.message === "string"
        ? errorData.message
        : undefined;

      // 1. Maintenance Mode — HTTP 503 or message contains "maintenance"
      if (status === 503 || errorMsg.includes('maintenance')) {
        api.dispatch(
          setLockout({
            type: 'MAINTENANCE',
            title: 'System Under Maintenance',
            message:
              lockoutMessage ||
              'Wealthconomy is currently undergoing scheduled maintenance. Please check back shortly.',
          })
        );
      }
      // 2. Account Suspended
      else if (errorMsg.includes('suspend') || errorCode === 'USER_SUSPENDED') {
        api.dispatch(
          setLockout({
            type: 'SUSPENDED',
            title: 'Account Suspended',
            message:
              lockoutMessage ||
              'Your account has been temporarily suspended by the administration. Please contact support.',
          })
        );
      }
      // 3. Account Blocked
      else if (errorMsg.includes('block') || errorCode === 'USER_BLOCKED') {
        api.dispatch(
          setLockout({
            type: 'BLOCKED',
            title: 'Account Blocked',
            message:
              lockoutMessage ||
              'Your account has been permanently blocked due to policy or compliance violations.',
          })
        );
      }
    } catch {
      console.warn("[baseQueryWithLockout] Error while checking lockout status");
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithLockout,
  tagTypes: ["User", "WealthGroup", "Portfolio", "Payment", "Auth", "Kyc", "File", "Notification", "Referral", "Blog", "Library", "Wallet", "PayoutAccount", "Withdrawal", "Activity", "SupportChat", "GroupReport"],
  endpoints: () => ({}),
});
