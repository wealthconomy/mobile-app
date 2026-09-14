import Header from "@/src/components/common/Header";
import { AppToast, ToastState } from "@/src/components/common/AppToast";
import { useExitGroupMutation, useGetGroupDetailsQuery } from "@/src/store/api/groupApi";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExitGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [exitGroup, { isLoading: isExiting }] = useExitGroupMutation();
  const { data: group } = useGetGroupDetailsQuery(id as string, { skip: !id });

  const handleConfirmExit = async () => {
    try {
      await exitGroup(id as string).unwrap();
      setShowExitModal(false);
      setToast({ type: "success", title: "Exited Tribe", message: "You have successfully exited this group." });
      setTimeout(() => {
        router.replace("/(tabs)/portfolios/wealth-group" as any);
      }, 900);
    } catch (err: any) {
      setShowExitModal(false);
      const msg = err?.data?.message || err?.message || "Failed to exit group.";
      setToast({ type: "error", title: "Exit Failed", message: msg });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Exit Group" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 py-6">
          <View className="items-center mb-8">
            <Text className="text-[26px] font-bold text-[#1A1A1A] mb-2 text-center">
              Exiting Group?
            </Text>
            <Text className="text-[14px] text-[#64748B] text-center px-4">
              Leaving a group affects your tribe standing and payout schedule.
            </Text>
          </View>

          <View className="w-full mb-8">
            <Text className="text-[16px] font-bold text-[#1A1A1A] mb-4">
              Before you go:
            </Text>

            <View className="mb-4">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Team:</Text> Your exit might delay the payout cycle for other members.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-[14px] leading-[22px] text-[#1A1A1A]">
                <Text className="font-bold">The Funds:</Text> Your settled contributions will be credited back to your main wallet.
              </Text>
            </View>
          </View>

          <View className="w-full mb-8">
            <Text className="text-[14px] text-[#64748B] font-medium mb-3">
              Reason for leaving (Optional)
            </Text>
            <TextInput
              className="bg-[#F6F6F6] rounded-2xl p-4 text-[#1A1A1A] min-h-[120px]"
              multiline
              textAlignVertical="top"
              placeholder="Tell the admin why you are leaving..."
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {group && !group.allowEarlyExit && (
            <View className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-1">
                <Ionicons name="lock-closed" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                <Text className="text-[#991B1B] font-bold text-sm">Early Exit is Locked</Text>
              </View>
              <Text className="text-[#7F1D1D] text-xs leading-5">
                The admin has set a No Withdrawal policy for this tribe. Voluntary early exit is not permitted until the group reaches its maturity date.
              </Text>
            </View>
          )}

          {group && group.allowEarlyExit && (group as any).penaltySetting === "IMMEDIATE_5" && (
            <View
              style={{
                backgroundColor: "#FFFBEB",
                borderColor: "#FCD34D",
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Ionicons name="warning" size={17} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={{ color: "#92400E", fontWeight: "800", fontSize: 13 }}>
                  Early Exit Penalty Applies
                </Text>
              </View>
              <Text style={{ color: "#78350F", fontSize: 12, lineHeight: 18 }}>
                A <Text style={{ fontWeight: "700" }}>5% penalty</Text> will be deducted from your accumulated savings for exiting early. The remaining balance will be credited directly to your Main Wallet.
              </Text>
            </View>
          )}

          <View className="w-full pb-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-full h-14 bg-white border border-[#E2E8F0] rounded-2xl items-center justify-center mb-4"
            >
              <Text className="text-[#64748B] font-bold text-base">
                Stay with Group
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowExitModal(true)}
              disabled={isExiting || (group && !group.allowEarlyExit)}
              className={`w-full h-14 rounded-2xl items-center justify-center ${
                group && !group.allowEarlyExit ? "bg-gray-100" : "bg-[#FFE4E4]"
              }`}
            >
              {isExiting ? (
                <ActivityIndicator color="#FF5A5A" />
              ) : (
                <Text
                  className={`font-bold text-base ${
                    group && !group.allowEarlyExit ? "text-gray-400" : "text-[#FF5A5A]"
                  }`}
                >
                  {group && !group.allowEarlyExit ? "Exit Locked (No Withdrawal)" : "Exit Group"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ─── EXIT TRIBE CUSTOM MODAL ───────────────────────────────────── */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                <Image
                  source={require("../../../../../../assets/images/terminate.png")}
                  style={{ width: 80, height: 80, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: "#1A1A1A",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Exit Tribe?
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    textAlign: "center",
                    marginBottom: 14,
                    lineHeight: 18,
                  }}
                >
                  {(group as any)?.penaltySetting === "IMMEDIATE_5"
                    ? "Are you sure you want to leave this tribe? A 5% penalty will be deducted from your accumulated savings before your refund is credited to your Main Wallet."
                    : "Are you sure you want to leave this tribe? Your accumulated savings will be refunded directly into your Main Wallet immediately."}
                </Text>

                {(group as any)?.penaltySetting === "IMMEDIATE_5" ? (
                  <View
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFBEB",
                      borderColor: "#FCD34D",
                      borderWidth: 1,
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Ionicons name="warning" size={20} color="#D97706" />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: "#78350F",
                        fontWeight: "600",
                        lineHeight: 18,
                      }}
                    >
                      A <Text style={{ fontWeight: "800" }}>5% early exit penalty</Text> will be deducted from your accumulated savings. The remaining balance will be sent to your Main Wallet.
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      backgroundColor: "#F0FDF4",
                      borderColor: "#BBF7D0",
                      borderWidth: 1,
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: "#166534",
                        fontWeight: "600",
                        lineHeight: 18,
                      }}
                    >
                      Your full accumulated savings will be refunded directly into your Main Wallet immediately.
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                  <TouchableOpacity
                    onPress={() => setShowExitModal(false)}
                    disabled={isExiting}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#E5E5E5",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirmExit}
                    disabled={isExiting}
                    style={{
                      flex: 1,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: "#FEE2E2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isExiting ? (
                      <ActivityIndicator color="#EF4444" size="small" />
                    ) : (
                      <Text style={{ fontSize: 14, color: "#E53935", fontWeight: "700" }}>
                        Exit Tribe
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <AppToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    maxWidth: 400,
  },
});
