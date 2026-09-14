import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";
import { logout, setCredentials } from "../slices/authSlice";
import { setLockout } from "../slices/appStatusSlice";

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      // Attempt to get a new pair of tokens
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
        // Store the new tokens and user profile
        api.dispatch(
          setCredentials({
            user: res.data.user,
            token: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          })
        );
        // Retry the original request with the newly issued token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - revoke session client-side
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
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
    } catch (e) {
      console.warn("⚠️ [baseQueryWithLockout] Error while checking lockout status:", e);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithLockout,
  tagTypes: ["User", "WealthGroup", "Portfolio", "Payment", "Auth", "Kyc", "File", "Notification", "Referral", "Blog", "Library", "Wallet", "PayoutAccount", "Withdrawal", "Activity"],
  endpoints: () => ({}),
});
