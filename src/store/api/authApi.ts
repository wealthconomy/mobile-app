import { setCredentials, logout } from "../slices/authSlice";
import { baseApi, ApiResponse } from "./baseApi";

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role?: string;
  username?: string | null;
  bio?: string | null;
  nextOfKinName?: string | null;
  nextOfKinRelationship?: string | null;
  nextOfKinPhone?: string | null;
  biometricsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
  wealthPreference?: string | null;
  kycLevel?: number;
  kycStatus?: string;
  isVerified?: boolean;
  authProvider?: string;
  referralCode?: string | null;
  referredByCode?: string | null;
  walletBalance?: string | number;
  totalSavings?: string | number;
  totalInterest?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  wealthPreference?: string;
  referralCode?: string;
}

export interface RegisterResponseData {
  next: string;
  destination: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokensData {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  resetToken?: string;
}

export interface RequestOtpPayload {
  destination: string;
  purpose: "SIGNUP" | "RESET";
}

export interface RequestOtpResponseData {
  expiresAt: string;
}

export interface VerifyOtpPayload {
  destination: string;
  purpose: "SIGNUP" | "RESET";
  code: string;
}

export interface ForgotPasswordPayload {
  destination: string;
}

export interface ForgotPasswordResponseData {
  next: string;
  expiresAt: string;
}

export interface ResetPasswordPayload {
  destination: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<RegisterResponseData>, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<ApiResponse<AuthTokensData>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data.accessToken) {
            dispatch(
              setCredentials({
                user: data.data.user,
                token: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              })
            );
          }
        } catch {
          // Silent catch to let UI handle errors via RTK Query result
        }
      },
    }),
    requestOtp: builder.mutation<ApiResponse<RequestOtpResponseData>, RequestOtpPayload>({
      query: (body) => ({
        url: "/auth/request-otp",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<ApiResponse<AuthTokensData>, VerifyOtpPayload>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (arg.purpose === "SIGNUP" && data.data.accessToken) {
            dispatch(
              setCredentials({
                user: data.data.user,
                token: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              })
            );
          }
        } catch {
          // Silent catch to let UI handle errors via RTK Query result
        }
      },
    }),
    forgotPassword: builder.mutation<ApiResponse<ForgotPasswordResponseData>, ForgotPasswordPayload>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<ApiResponse<{ ok: boolean }>, ResetPasswordPayload>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<ApiResponse<{ ok: boolean }>, ChangePasswordPayload>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    logoutSession: builder.mutation<ApiResponse<{ ok: boolean }>, LogoutPayload>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Silent catch - whether backend logout succeeds or fails, wipe client session
        } finally {
          dispatch(logout());
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useLogoutSessionMutation,
} = authApi;
