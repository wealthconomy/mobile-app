/**
 * Authentication API — API-ready mock layer.
 * Replace BASE_URL and remove mock delays when the backend is ready.
 */

// const BASE_URL = 'https://your-api.com/api/v1/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  wealthPreference?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authApi = {
  /** POST /auth/login */
  login: async (email: string, _password: string): Promise<AuthResponse> => {
    await delay(1500);
    // Real: return fetch(`${BASE_URL}/login`, { method: 'POST', body: JSON.stringify({ email, password: _password }) }).then(r => r.json());
    return {
      user: { id: "1", email, name: email.split("@")[0] },
      token: "mock-jwt-token",
    };
  },

  /** POST /auth/signup */
  signup: async (
    email: string,
    _password: string,
    name: string,
    phone?: string,
    wealthPreference?: string,
    referralCode?: string,
  ): Promise<AuthResponse> => {
    await delay(1500);
    // Real: return fetch(`${BASE_URL}/signup`, { method: 'POST', body: JSON.stringify({ email, password: _password, name, phone, wealthPreference, referralCode }) }).then(r => r.json());
    return {
      user: { id: "2", email, name, phone, wealthPreference },
      token: "mock-jwt-token-new",
    };
  },

  /** POST /auth/otp/verify — used for both post-signup & post-forgot-password */
  verifyOtp: async (
    email: string,
    otp: string,
    _context: "signup" | "forgot-password",
  ): Promise<OtpResponse> => {
    await delay(1200);
    // Real: return fetch(`${BASE_URL}/otp/verify`, { method: 'POST', body: JSON.stringify({ email, otp, context: _context }) }).then(r => r.json());
    void otp; // mark as used
    return { success: true, message: "OTP verified successfully." };
  },

  /** POST /auth/otp/resend */
  resendOtp: async (
    email: string,
    _context: "signup" | "forgot-password",
  ): Promise<OtpResponse> => {
    await delay(1000);
    // Real: return fetch(`${BASE_URL}/otp/resend`, { method: 'POST', body: JSON.stringify({ email, context: _context }) }).then(r => r.json());
    void email;
    return { success: true, message: "OTP resent successfully." };
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    await delay(1200);
    // Real: return fetch(`${BASE_URL}/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) }).then(r => r.json());
    void email;
    return {
      success: true,
      message: "Password reset code sent to your email.",
    };
  },

  /** POST /auth/reset-password */
  resetPassword: async (
    email: string,
    _newPassword: string,
    _otp: string,
  ): Promise<ResetPasswordResponse> => {
    await delay(1200);
    // Real: return fetch(`${BASE_URL}/reset-password`, { method: 'POST', body: JSON.stringify({ email, newPassword: _newPassword, otp: _otp }) }).then(r => r.json());
    void email;
    return { success: true, message: "Password reset successfully." };
  },
};
