import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal = React.memo(
  ({ visible, onClose, onConfirm }: LogoutModalProps) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 bg-black/50 items-center justify-center px-4">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-[32px] w-full p-8 items-center max-w-[340px]">
                <View className="w-1.5 h-1.5 bg-[#BABABA] rounded-full mb-6" />

                <View className="w-20 h-20 bg-[#FFF5F5] rounded-3xl items-center justify-center mb-6">
                  <Ionicons name="log-out" size={40} color="#EF4444" />
                </View>

                <Text className="text-[22px] font-extrabold text-[#111827] mb-3">
                  Confirm Logout!
                </Text>

                <Text className="text-[15px] font-medium text-[#4B5563] text-center leading-[22px] mb-8">
                  To keep your portfolios secure, we will sign you out of this
                  session. You will need your password or Biometrics to jump
                  back in.
                </Text>

                <View className="flex-row w-full gap-x-3">
                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.8}
                    className="flex-1 h-16 border border-[#E5E7EB] rounded-2xl items-center justify-center"
                  >
                    <Text className="text-base font-bold text-[#111827]">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onConfirm}
                    activeOpacity={0.8}
                    className="flex-1 h-16 bg-[#FFF2F2] border border-[#FEE2E2] rounded-2xl items-center justify-center"
                  >
                    <Text className="text-base font-bold text-[#EF4444]">
                      Secure Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
);

LogoutModal.displayName = "LogoutModal";
