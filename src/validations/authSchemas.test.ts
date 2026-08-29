import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "./authSchemas";

describe("Authentication Zod Schemas", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "SecretPassword123!",
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail when email is invalid", () => {
      const invalidData = {
        email: "not-an-email",
        password: "SecretPassword123!",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter a valid email address");
      }
    });

    it("should fail when required fields are missing", () => {
      const result = loginSchema.safeParse({ email: "", password: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    const validRegistration = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "+2348012345678",
      wealthPreference: "IMPACT_WEALTH",
      agreeToTerms: true,
      password: "SecurePassword1!",
      confirmPassword: "SecurePassword1!",
    };

    it("should validate correct registration payload", () => {
      const result = registerSchema.safeParse(validRegistration);
      expect(result.success).toBe(true);
    });

    it("should fail when agreeToTerms is false", () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        agreeToTerms: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("You must agree to the Terms and Conditions");
      }
    });

    it("should fail when wealthPreference is missing", () => {
      const { wealthPreference, ...dataWithoutWealthPreference } = validRegistration;
      const result = registerSchema.safeParse(dataWithoutWealthPreference);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Required");
      }
    });

    it("should fail when passwords do not match", () => {
      const result = registerSchema.safeParse({
        ...validRegistration,
        confirmPassword: "DifferentPassword1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("should enforce strong password rules (uppercase + numbers + min 8 chars)", () => {
      const weakPassword = {
        ...validRegistration,
        password: "weak",
        confirmPassword: "weak",
      };
      const result = registerSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });
  });

  describe("verifyOtpSchema", () => {
    it("should validate a valid 6-digit numeric code", () => {
      const result = verifyOtpSchema.safeParse({
        destination: "test@example.com",
        purpose: "SIGNUP",
        code: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("should fail when OTP code contains letters", () => {
      const result = verifyOtpSchema.safeParse({
        destination: "test@example.com",
        purpose: "SIGNUP",
        code: "12ab56",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("OTP code must contain numbers only");
      }
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate matching new password and token", () => {
      const result = resetPasswordSchema.safeParse({
        destination: "test@example.com",
        resetToken: "token-123",
        newPassword: "NewStrongPass1!",
        confirmPassword: "NewStrongPass1!",
      });
      expect(result.success).toBe(true);
    });
  });
});
