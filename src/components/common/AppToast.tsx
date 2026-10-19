/**
 * AppToast — A lightweight slide-up in-app toast notification.
 * Replaces native Alert.alert for success / error / info messages.
 *
 * Usage:
 *   const [toast, setToast] = useState<ToastState | null>(null);
 *   setToast({ type: "success", title: "Done!", message: "Action completed." });
 *   <AppToast toast={toast} onDismiss={() => setToast(null)} />
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Modal, Platform, Text, TouchableOpacity, View } from "react-native";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
  /** Auto-dismiss after ms. Default 3500. Pass 0 to disable. */
  duration?: number;
}

interface AppToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

const CONFIG: Record<ToastType, { bg: string; iconBg: string; icon: any; iconColor: string }> = {
  success: {
    bg: "#FFFFFF",
    iconBg: "#F0FDF4",
    icon: "checkmark-circle",
    iconColor: "#16A34A",
  },
  error: {
    bg: "#FFFFFF",
    iconBg: "#FEF2F2",
    icon: "close-circle",
    iconColor: "#DC2626",
  },
  info: {
    bg: "#FFFFFF",
    iconBg: "#EFF6FF",
    icon: "information-circle",
    iconColor: "#2563EB",
  },
  warning: {
    bg: "#FFFFFF",
    iconBg: "#FFFBEB",
    icon: "warning",
    iconColor: "#D97706",
  },
};

export function AppToast({ toast, onDismiss }: AppToastProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;

    // Slide down from top
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 60,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const duration = toast.duration ?? 3500;
    if (duration > 0) {
      timerRef.current = setTimeout(() => dismiss(), duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  if (!toast) return null;

  const cfg = CONFIG[toast.type];

  return (
    <Modal transparent animationType="none" visible={!!toast} onRequestClose={dismiss}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          paddingTop: Platform.OS === "ios" ? 56 : 42,
          paddingHorizontal: 16,
        }}
        pointerEvents="box-none"
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            backgroundColor: cfg.bg,
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.14,
            shadowRadius: 20,
            elevation: 12,
            gap: 14,
            borderWidth: 1,
            borderColor: "#F1F5F9",
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: cfg.iconBg,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Ionicons name={cfg.icon} size={24} color={cfg.iconColor} />
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: toast.message ? 3 : 0,
              }}
            >
              {toast.title}
            </Text>
            {toast.message ? (
              <Text style={{ fontSize: 13, color: "#64748B", lineHeight: 18 }}>
                {toast.message}
              </Text>
            ) : null}
          </View>

          {/* Dismiss X */}
          <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
