import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .min(10, { message: "Please enter a valid phone number" })
      .optional(),
    wealthPreference: z.string().optional(),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, { message: "You must agree to the Terms and Conditions" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const requestOtpSchema = z.object({
  destination: z
    .string()
    .min(1, { message: "Email or phone number is required" }),
  purpose: z.enum(["SIGNUP", "RESET"]),
});

export type RequestOtpFormData = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  destination: z.string().min(1, { message: "Destination is required" }),
  purpose: z.enum(["SIGNUP", "RESET"]),
  code: z
    .string()
    .min(4, { message: "OTP code must be at least 4 digits" })
    .max(6, { message: "OTP code cannot exceed 6 digits" })
    .regex(/^\d+$/, { message: "OTP code must contain numbers only" }),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({
  destination: z
    .string()
    .min(1, { message: "Email or phone number is required" }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    destination: z.string().min(1, { message: "Destination is required" }),
    resetToken: z.string().min(1, { message: "Reset token is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z
    .string()
    .min(8, { message: "New password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" }),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
