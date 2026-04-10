import React from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SuccessModalProps extends ModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
}

interface ConfirmationModalProps extends ModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  type: "bank" | "card";
}

export const RemoveConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  type,
}: ConfirmationModalProps) => {
  const icon = type === "bank" ? "library" : "card";
  const iconImg =
    type === "bank"
      ? require("@/assets/images/bank-removed.png")
      : require("@/assets/images/card-removed.png");

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

              <View className="mb-6">
                <Image
                  source={iconImg}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="text-[22px] font-extrabold text-[#111827] mb-3 text-center">
                {title} <Text className="text-[#FBBF24]">⚠️</Text>
              </Text>

              <Text className="text-[14px] text-[#6B7280] text-center leading-[20px] mb-8">
                {description}
              </Text>

              <View className="flex-row w-full gap-x-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 h-14 border border-[#E5E7EB] rounded-2xl items-center justify-center"
                >
                  <Text className="text-base font-bold text-[#111827]">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  className="flex-1 h-14 bg-[#FFF2F2] border border-[#FEE2E2] rounded-2xl items-center justify-center"
                >
                  <Text className="text-base font-bold text-[#EF4444]">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const CardAddedModal = ({
  visible,
  onClose,
  onConfirm,
}: SuccessModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/50 items-center justify-center px-4">
      <View className="bg-white rounded-[32px] w-full p-8 items-center max-w-[340px]">
        <View className="w-1.5 h-1.5 bg-[#BABABA] rounded-full mb-6" />

        <View className="mb-6">
          <Image
            source={require("@/assets/images/card-added.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-[22px] font-extrabold text-[#111827] mb-3 text-center">
          Card Added Successfully ✅
        </Text>

        <Text className="text-[14px] text-[#6B7280] text-center leading-[20px] mb-8">
          Your card has been successfully added to your Wealthconomy account.
          You can now use it for seamless transactions.
        </Text>

        <TouchableOpacity
          onPress={onConfirm}
          className="w-full h-14 border border-[#E5E7EB] rounded-2xl items-center justify-center"
        >
          <Text className="text-base font-bold text-[#111827]">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const InsertPinModal = ({
  visible,
  onClose,
  onConfirm,
}: ModalProps & { onConfirm: (pin: string) => void }) => {
  const [pin, setPin] = React.useState("");

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        onConfirm(newPin);
        setPin("");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-[40px] p-8 items-center">
              <View className="w-20 h-1.5 bg-[#BABABA] rounded-full mb-8" />

              <View className="w-20 h-20 bg-[#EFF7F8] rounded-3xl items-center justify-center mb-6">
                <Image
                  source={require("@/assets/images/change-pin.png")}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              </View>

              <Text className="text-[24px] font-extrabold text-[#155D5F] mb-2">
                Insert your Pin
              </Text>
              <Text className="text-[14px] text-[#6B7280] mb-8 text-center">
                Please insert pin to complete transaction
              </Text>

              <View className="flex-row gap-x-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className={`w-14 h-14 rounded-2xl items-center justify-center border ${pin.length >= i ? "bg-[#EFF7F8] border-[#155D5F]" : "bg-[#F9FAFB] border-[#E5E7EB]"}`}
                  >
                    {pin.length >= i && (
                      <View className="w-3 h-3 bg-[#155D5F] rounded-full" />
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={() => {}}>
                <Text className="text-[#155D5F] font-bold underline mb-8">
                  Forgot your pin?
                </Text>
              </TouchableOpacity>

              {/* Number pad would go here for a real implementaton, or just trigger success for demo */}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const TransferSuccessModal = ({
  visible,
  onClose,
  onConfirm,
  description,
}: SuccessModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-[40px] p-8 items-center pb-12">
        <View className="w-20 h-1.5 bg-[#BABABA] rounded-full mb-8" />

        <View className="w-32 h-32 items-center justify-center mb-6">
          <Image
            source={require("@/assets/images/success.png")}
            style={{
              width: 120,
              height: 120,
              position: "absolute",
              opacity: 0.5,
            }}
            resizeMode="contain"
          />
          <Image
            source={require("@/assets/images/funds.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-[24px] font-extrabold text-[#111827] mb-2">
          Funds Transferred Successfully ✅
        </Text>

        <Text className="text-[14px] text-[#6B7280] text-center leading-[22px] mb-8 px-4">
          {description}
        </Text>

        <TouchableOpacity
          onPress={onConfirm}
          className="w-full h-16 bg-[#155D5F] rounded-2xl items-center justify-center shadow-lg"
        >
          <Text className="text-white text-base font-bold">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
