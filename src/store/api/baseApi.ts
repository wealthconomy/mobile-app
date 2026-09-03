import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";
import { logout, setCredentials } from "../slices/authSlice";

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

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "WealthGroup", "Portfolio", "Payment", "Auth", "Kyc", "File", "Notification", "Referral", "Blog", "Library", "Wallet", "PayoutAccount", "Withdrawal", "Activity"],
  endpoints: () => ({}),
});
