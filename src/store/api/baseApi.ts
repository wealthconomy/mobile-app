import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";
import { logout, setCredentials } from "../slices/authSlice";

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data: T;
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
  const requestUrl = typeof args === "string" ? args : args.url;
  const requestMethod = typeof args === "string" ? "GET" : args.method || "GET";
  console.log(`🚀 [API Request] ${requestMethod} ${requestUrl}`, {
    params: typeof args === "string" ? undefined : args.params,
    body: typeof args === "string" ? undefined : args.body,
  });

  let result = await rawBaseQuery(args, api, extraOptions);

  console.log(`📥 [API Response] ${requestMethod} ${requestUrl}\n`, JSON.stringify({
    status: result.meta?.response?.status,
    data: result.data,
    error: result.error,
  }, null, 2));

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      console.log("🔄 Attempting token refresh...");
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

      console.log("🔄 Token refresh response:", {
        status: refreshResult.meta?.response?.status,
        data: refreshResult.data,
        error: refreshResult.error,
      });

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
        console.log(`🚀 [API Retry] ${requestMethod} ${requestUrl}`);
        result = await rawBaseQuery(args, api, extraOptions);
        console.log(`📥 [API Retry Response] ${requestMethod} ${requestUrl}`, {
          status: result.meta?.response?.status,
          data: result.data,
          error: result.error,
        });
      } else {
        // Refresh failed - revoke session client-side
        console.log("❌ Token refresh failed, logging out...");
        api.dispatch(logout());
      }
    } else {
      console.log("❌ No refresh token found, logging out...");
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "WealthGroup", "Portfolio", "Payment", "Auth", "Kyc", "File", "Notification", "Referral", "Blog", "Library", "Wallet", "PayoutAccount", "Withdrawal"],
  endpoints: () => ({}),
});
