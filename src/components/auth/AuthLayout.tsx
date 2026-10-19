import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AUTH_COLORS } from "./authConstants";

interface AuthLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  scrollPaddingBottom?: number;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBackButton = false,
  scrollPaddingBottom = 32,
}) => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {showBackButton && (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 4,
            gap: 4,
          }}
        >
          <ChevronLeft size={24} color={AUTH_COLORS.DARK} style={{ width: 12 }} />
          <Text style={{ color: AUTH_COLORS.DARK, fontSize: 14, fontWeight: "500" }}>
            Back
          </Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: scrollPaddingBottom,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
