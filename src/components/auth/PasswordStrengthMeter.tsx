import React from "react";
import { Text, View } from "react-native";
import { AUTH_COLORS } from "./authConstants";

type StrengthRule = { label: string; test: (p: string) => boolean };

export const STRENGTH_RULES: StrengthRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  {
    label: "One special character (!@#$...)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = "" }) => {
  if (password.length === 0) return null;

  return (
    <View
      style={{
        marginTop: -4,
        marginBottom: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: AUTH_COLORS.DARK,
          marginBottom: 8,
        }}
      >
        Password requirements:
      </Text>
      {STRENGTH_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <View
            key={rule.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 5,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: passed ? AUTH_COLORS.SUCCESS : "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {passed && (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: "bold",
                    marginBottom: 1,
                  }}
                >
                  ✓
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                color: passed ? AUTH_COLORS.SUCCESS : AUTH_COLORS.SECONDARY,
              }}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
