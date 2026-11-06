import { setCredentials, setBiometricsEnabled } from "../slices/authSlice";
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
  kycLevel?: number;
  kycStatus?: string;
  hasTransactionPin?: boolean;
  hasAppPasscode?: boolean;
  pinHash?: string | null;
}

export interface SetupPasscodeRequest {
  passcode: string;
}

export interface VerifyPasscodeRequest {
  passcode: string;
}

export interface UpdatePasscodeRequest {
  oldPasscode: string;
  newPasscode: string;
}

export interface JoinWaitlistRequest {
  feature: string;
  email?: string;
  fullName?: string;
  intendedInvestment?: string;
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

export interface ResetPinRequest {
  newPin: string;
  password?: string;
  otp?: string;
}

export interface ResetPasscodeRequest {
  newPasscode: string;
  password?: string;
  otp?: string;
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
          // Ignore AbortError and network cancellations
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
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(setBiometricsEnabled(body.biometricsEnabled));
        } catch {
          // Handled by caller
        }
      },
    }),
    deleteAccount: builder.mutation<ApiResponse<{ ok: boolean }>, void>({
      query: () => ({
        url: "/user/account",
        method: "DELETE",
      }),
    }),
    setupPasscode: builder.mutation<ApiResponse<any>, SetupPasscodeRequest>({
      query: (body) => ({
        url: "/user/passcode/setup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    verifyPasscode: builder.mutation<ApiResponse<{ valid: boolean }>, VerifyPasscodeRequest>({
      query: (body) => ({
        url: "/user/passcode/verify",
        method: "POST",
        body,
      }),
    }),
    updatePasscode: builder.mutation<ApiResponse<any>, UpdatePasscodeRequest>({
      query: (body) => ({
        url: "/user/passcode/update",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    joinWaitlist: builder.mutation<ApiResponse<any>, JoinWaitlistRequest>({
      query: (body) => ({
        url: "/waitlist",
        method: "POST",
        body,
      }),
    }),
    forgotPin: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: "/user/pin/forgot",
        method: "POST",
      }),
    }),
    resetPin: builder.mutation<ApiResponse<any>, ResetPinRequest>({
      query: (body) => ({
        url: "/user/pin/reset",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    forgotPasscode: builder.mutation<ApiResponse<any>, void>({
      query: () => ({
        url: "/user/passcode/forgot",
        method: "POST",
      }),
    }),
    resetPasscode: builder.mutation<ApiResponse<any>, ResetPasscodeRequest>({
      query: (body) => ({
        url: "/user/passcode/reset",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
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
  useForgotPinMutation,
  useResetPinMutation,
  useUpdateNotificationSettingsMutation,
  useToggleBiometricsMutation,
  useDeleteAccountMutation,
  useSetupPasscodeMutation,
  useVerifyPasscodeMutation,
  useUpdatePasscodeMutation,
  useForgotPasscodeMutation,
  useResetPasscodeMutation,
  useJoinWaitlistMutation,
} = userApi;
