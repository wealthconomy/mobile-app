import { paymentService } from "@/src/api/paymentService";
import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "select-method" | "use-card" | "preview";

export default function DepositScreen() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [step, setStep] = useState<Step>("select-method");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [wealthPlan] = useState(plan || "WealthFlex");

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = val.replace(/[^\d.]/g, "");
    const amount = parseFloat(cleaned) || 0;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const getTitle = () => {
    if (step === "select-method") return "Deposit Funds";
    if (step === "use-card") return "Use Card";
    if (step === "preview") return `${wealthPlan} Preview`;
    return "";
  };

  const handleBack = () => {
    if (step === "preview") setStep("use-card");
    else if (step === "use-card") setStep("select-method");
    else router.back();
  };

  const renderSelectMethod = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb- mt-4">
        Select your digital payment method
      </Text>

      <View className="mt-8 border-t border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setStep("use-card")}
          className="flex-row items-center py-6 px-1 border-b border-gray-50"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
            <Ionicons name="card-outline" size={24} color="#155D5F" />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              Top-up with Card
            </Text>
            <Text className="text-[#6B7280] text-[11px] mt-0.5">
              Add funds directly from your ATM card
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-6 px-1"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
            <MaterialCommunityIcons
              name="bank-outline"
              size={24}
              color="#155D5F"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              Add via bank transfer
            </Text>
            <Text className="text-[#6B7280] text-[11px] mt-0.5">
              Fund your wallet by sending money from your NG bank account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View className="px-1 mt-8">
        <Text className="text-[#6B7280] text-[13px] mb-6">Saved cards</Text>
        <TouchableOpacity className="flex-row items-center mb-6">
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png",
            }}
            style={{ width: 32, height: 20, resizeMode: "contain" }}
            className="mr-4"
          />
          <View>
            <Text className="text-[#1A1A1A] font-bold text-sm">**** 4252</Text>
            <Text className="text-[#6B7280] text-[11px]">Default card</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png",
            }}
            style={{ width: 32, height: 20, resizeMode: "contain" }}
            className="mr-4"
          />
          <View>
            <Text className="text-[#1A1A1A] font-bold text-sm">**** 8372</Text>
            <Text className="text-[#6B7280] text-[11px]">Secondary card</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-[#155D5F] rounded-2xl p-4 flex-row items-center justify-center mt-10"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="white" className="mr-2" />
        <Text className="text-white font-bold ml-2">Add card</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUseCard = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Input your card details
      </Text>

      <View className="space-y-6 gap-5">
        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Amount(₦)
          </Text>
          <TextInput
            placeholder="₦0.00"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Card number
          </Text>
          <TextInput
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
          />
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
              Expiry Date
            </Text>
            <TextInput
              placeholder="MM / YY"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-xs mb-2">CVV</Text>
            <TextInput
              placeholder="123"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Name on card
          </Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">Pin</Text>
          <TextInput
            placeholder="****"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
            secureTextEntry
          />
        </View>
      </View>

      <ThemedButton
        title="Confirm"
        onPress={async () => {
          setLoading(true);
          await paymentService.depositViaCard({
            amount,
            cardNumber: "",
            expiryDate: "",
            cvv: "",
            nameOnCard: "",
            pin: "",
          });
          setLoading(false);
          setStep("preview");
        }}
        loading={loading}
        className="mt-10"
      />
    </View>
  );

  const renderPreview = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Please, recheck and confirm before making the transaction.
      </Text>

      <View
        className="bg-[#F6F6F6] p-6 rounded-t-[24px] relative self-center"
        style={{
          width: 365,
          height: 250,
          borderWidth: 0.8,
          borderColor: "#00000040",
          borderBottomWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Amount To Deposit
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              ₦{formatAmount(amount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Account No.
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              8736123335
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Account Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              Simon Peter
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Bank Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              Opay
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Wealth Send Into
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              WinUp
            </Text>
          </View>
        </View>

        {/* Jagged Edge Components */}
        <View
          className="flex-row absolute -bottom-[10px] left-0 right-0 overflow-hidden"
          style={{ width: 365.1 }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 14,
                height: 14,
                backgroundColor: "white",
                transform: [{ rotate: "45deg" }],
                marginTop: 4,
              }}
            />
          ))}
        </View>
      </View>

      <ThemedButton
        title="Confirm"
        onPress={() => setShowSuccess(true)}
        className="mt-14"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header title={getTitle()} onBack={handleBack} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === "select-method" && renderSelectMethod()}
        {step === "use-card" && renderUseCard()}
        {step === "preview" && renderPreview()}
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-10">
          <View className="bg-white rounded-[32px] p-8 items-center w-full">
            <Image
              source={require("@/assets/images/funds.png")}
              style={{ width: 120, height: 120, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text className="text-[#1A1A1A] font-bold text-[20px] text-center mb-2">
              Funds Deposited Successfully ✅
            </Text>
            <Text className="text-[#6B7280] text-[12px] text-center mb-8 px-4">
              Congratulations, WealthBuilder! You have successfully deposited ₦
              {formatAmount(amount)} into your WinUp account.
            </Text>
            <ThemedButton
              title="Confirm"
              onPress={() => {
                setShowSuccess(false);
                router.replace("/win-up");
              }}
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
