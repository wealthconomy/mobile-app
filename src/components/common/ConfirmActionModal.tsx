import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

export interface ConfirmActionSummaryRow {
  label: string;
  value: string;
}

export interface ConfirmActionModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  summaryRows: ConfirmActionSummaryRow[];
  confirmLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmActionModal({
  visible,
  onCancel,
  onConfirm,
  title,
  summaryRows,
  confirmLabel = "Continue to PIN",
  isDestructive = false,
}: ConfirmActionModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.cardContainer}
            >
              <View style={styles.card}>
                {/* Header Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isDestructive ? "#FEE2E2" : "#E7F5F5" },
                  ]}
                >
                  <Ionicons
                    name={isDestructive ? "alert-circle-outline" : "shield-checkmark-outline"}
                    size={28}
                    color={isDestructive ? "#DC2626" : "#155D5F"}
                  />
                </View>

                {/* Modal Title */}
                <Text style={styles.title}>{title}</Text>

                <Text style={styles.subtitle}>
                  Please review the details below before proceeding to PIN confirmation.
                </Text>

                {/* Summary Box */}
                <View style={styles.summaryCard}>
                  {summaryRows.map((row, index) => {
                    const isLast = index === summaryRows.length - 1;
                    return (
                      <View
                        key={`summary-row-${index}`}
                        style={[
                          styles.summaryRow,
                          !isLast && styles.summaryRowBorder,
                        ]}
                      >
                        <Text style={styles.summaryLabel}>{row.label}</Text>
                        <Text style={styles.summaryValue} numberOfLines={2}>
                          {row.value}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={onCancel}
                    style={styles.cancelBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onConfirm}
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: isDestructive ? "#DC2626" : "#155D5F" },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 390,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
    maxWidth: "65%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default ConfirmActionModal;

