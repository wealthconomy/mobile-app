import { setCredentials } from "../slices/authSlice";
import { RootState } from "../index";
import { baseApi, ApiResponse } from "./baseApi";

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  referralCode?: string;
  username?: string;
  bio?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  address?: string;
  biometricsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  walletBalance?: string;
  totalSavings?: string;
  totalInterest?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  phone?: string;
  username?: string;
  bio?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  address?: string;
}

export interface SetupPinRequest {
  pin: string;
}

export interface VerifyPinRequest {
  pin: string;
}

export interface UpdatePinRequest {
  oldPin: string;
  newPin: string;
}

export interface NotificationSettingsRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
}

export interface BiometricToggleRequest {
  biometricsEnabled: boolean;
}

export interface UsersListQueryParams {
  populate?: string[];
  q?: string;
  limit?: number;
  after?: string;
  before?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: string;
}

export interface UsersListResponseData {
  items: UserProfile[];
  nextCursor?: string;
  prevCursor?: string;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => "/user/me",
      providesTags: ["User"],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const token = (getState() as RootState).auth.token || "";
          const refreshToken = (getState() as RootState).auth.refreshToken || "";
          if (token && data.data) {
            dispatch(
              setCredentials({
                user: data.data,
                token,
                refreshToken,
              })
            );
          }
        } catch {
          // fetch failed
        }
      },
    }),
    updateMyProfile: builder.mutation<ApiResponse<UserProfile>, UpdateProfileRequest>({
      query: (body) => ({
        url: "/user/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const token = (getState() as RootState).auth.token || "";
          const refreshToken = (getState() as RootState).auth.refreshToken || "";
          if (token && data.data) {
            dispatch(
              setCredentials({
                user: data.data,
                token,
                refreshToken,
              })
            );
          }
        } catch {
          // fetch failed
        }
      },
    }),
    getDashboardSummary: builder.query<ApiResponse<any>, void>({
      query: () => "/user/dashboard-summary",
      providesTags: ["User", "Portfolio", "Payment"],
    }),
    getUserById: builder.query<ApiResponse<UserProfile>, string>({
      query: (id) => `/user/${id}`,
    }),
    listUsers: builder.query<ApiResponse<UsersListResponseData>, UsersListQueryParams | void>({
      query: (params) => ({
        url: "/user",
        params: params || {},
      }),
    }),
    setupPin: builder.mutation<ApiResponse<any>, SetupPinRequest>({
      query: (body) => ({
        url: "/user/pin/setup",
        method: "POST",
        body,
      }),
    }),
    verifyPin: builder.mutation<ApiResponse<any>, VerifyPinRequest>({
      query: (body) => ({
        url: "/user/pin/verify",
        method: "POST",
        body,
      }),
    }),
    updatePin: builder.mutation<ApiResponse<any>, UpdatePinRequest>({
      query: (body) => ({
        url: "/user/pin/update",
        method: "PUT",
        body,
      }),
    }),
    updateNotificationSettings: builder.mutation<ApiResponse<{ ok: boolean }>, NotificationSettingsRequest>({
      query: (body) => ({
        url: "/user/notifications/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    toggleBiometrics: builder.mutation<ApiResponse<{ ok: boolean }>, BiometricToggleRequest>({
      query: (body) => ({
        url: "/user/biometrics/toggle",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteAccount: builder.mutation<ApiResponse<{ ok: boolean }>, void>({
      query: () => ({
        url: "/user/account",
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetDashboardSummaryQuery,
  useGetUserByIdQuery,
  useListUsersQuery,
  useSetupPinMutation,
  useVerifyPinMutation,
  useUpdatePinMutation,
  useUpdateNotificationSettingsMutation,
  useToggleBiometricsMutation,
  useDeleteAccountMutation,
} = userApi;
