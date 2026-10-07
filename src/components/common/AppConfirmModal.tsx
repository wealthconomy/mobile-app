/**
 * AppConfirmModal — In-app confirmation dialog that replaces destructive Alert.alert
 * calls that had a Cancel + Confirm button pattern.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState<ConfirmState | null>(null);
 *
 *   setConfirm({
 *     title: "Remove Member",
 *     message: "Are you sure you want to remove John?",
 *     confirmLabel: "Remove",
 *     isDestructive: true,
 *     onConfirm: async () => { await removeMember(...); },
 *   });
 *
 *   <AppConfirmModal confirm={confirm} onDismiss={() => setConfirm(null)} />
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  /** Called when the user confirms. Can be async. */
  onConfirm: () => void | Promise<void>;
}

interface AppConfirmModalProps {
  confirm: ConfirmState | null;
  onDismiss: () => void;
}

const THEME = "#155D5F";

export function AppConfirmModal({ confirm, onDismiss }: AppConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!confirm) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirm.onConfirm();
    } finally {
      setLoading(false);
      onDismiss();
    }
  };

  const isDestructive = confirm.isDestructive ?? false;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!confirm}
      onRequestClose={onDismiss}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: 28,
            width: "100%",
            maxWidth: 380,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDestructive ? "#FEF2F2" : "#F0FDF4",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name={isDestructive ? "warning" : "help-circle"}
              size={32}
              color={isDestructive ? "#DC2626" : THEME}
            />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#1A1A1A",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {confirm.title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 13,
              color: "#64748B",
              textAlign: "center",
              lineHeight: 19,
              marginBottom: 26,
            }}
          >
            {confirm.message}
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            {/* Cancel */}
            <TouchableOpacity
              onPress={onDismiss}
              disabled={loading}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#64748B", fontWeight: "700", fontSize: 14 }}>
                {confirm.cancelLabel ?? "Cancel"}
              </Text>
            </TouchableOpacity>

            {/* Confirm */}
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                backgroundColor: isDestructive ? "#EF4444" : THEME,
                alignItems: "center",
                justifyContent: "center",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
                  {confirm.confirmLabel ?? "Confirm"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
