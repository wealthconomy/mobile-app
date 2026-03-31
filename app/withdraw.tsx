import { Bank, bankService } from "@/src/api/bankService";
import { paymentService } from "@/src/api/paymentService";
import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step =
  | "select-recipient"
  | "recipient-details"
  | "select-bank"
  | "preview";

const INITIAL_RECIPIENTS = [
  {
    id: 1,
    name: "James Jackson",
    bankName: "Opay",
    accountNumber: "62345278396",
  },
  {
    id: 2,
    name: "Gem Mike",
    bankName: "First Bank of Nigeria Limited",
    accountNumber: "03638265782",
  },
  {
    id: 3,
    name: "Sarah Simon",
    bankName: "Kuda Bank",
    accountNumber: "1234567890",
  },
];

export default function WithdrawScreen() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENTS);
  const [step, setStep] = useState<Step>("select-recipient");
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("Select bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [wealthPlan] = useState(plan || "WealthFlex");

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = val.replace(/[^\d.]/g, "");
    const amount = parseFloat(cleaned) || 0;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const clearInputs = () => {
    setAmount("");
    setAccountNumber("");
    setSelectedBank("Select bank");
    setUserName("");
    setNarrative("");
  };

  const {
    data: banks,
    isLoading: isLoadingBanks,
    isError: isBankError,
    refetch: refetchBanks,
  } = useQuery({
    queryKey: ["banks"],
    queryFn: bankService.fetchBanks,
  });

  const handleBack = () => {
    if (step === "preview") setStep("recipient-details");
    else if (step === "select-bank") setStep("recipient-details");
    else if (step === "recipient-details") setStep("select-recipient");
    else router.back();
  };

  const getTitle = () => {
    if (step === "select-recipient") return "Transfer Funds";
    if (step === "recipient-details") return "Recipient Bank Account";
    if (step === "select-bank") return "Select Bank";
    if (step === "preview") return `${wealthPlan} Preview`;
    return "";
  };

  const renderSelectRecipient = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-1 mt-4">
        Send to a recipient
      </Text>

      <View className="mt-6 border-t border-b border-gray-100">
        <TouchableOpacity
          onPress={() => {
            clearInputs();
            setStep("recipient-details");
          }}
          className="flex-row items-center py-6 px-1"
          activeOpacity={0.7}
        >
          <View className="w-12 h-12 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
            <Ionicons name="add" size={30} color="#155D5F" />
          </View>
          <View className="flex-1">
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              Send to new recipient
            </Text>
            <Text className="text-[#6B7280] text-[11px] mt-0.5">
              Transfer funds to a bank account not in your recent list
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text className="text-[#1A1A1A] font-extrabold text-[16px] mb-5 mt-6">
        Recent Recipients
      </Text>

      <View className="space-y-4 gap-4">
        {recipients.map(
          (item: (typeof INITIAL_RECIPIENTS)[0], index: number) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center"
              onPress={() => {
                setAccountNumber(item.accountNumber);
                setSelectedBank(item.bankName);
                setUserName(item.name);
                setStep("recipient-details");
              }}
            >
              <View className="w-10 h-10 bg-[#E6F4F4] rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons
                  name="bank-outline"
                  size={20}
                  color="#155D5F"
                />
              </View>
              <View>
                <Text className="text-[#1A1A1A] font-bold text-sm">
                  {item.name}
                </Text>
                <Text className="text-[#6B7280] text-[11px]">
                  {item.bankName} - {item.accountNumber}
                </Text>
              </View>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );

  const renderRecipientDetails = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Amount(₦) <Text className="font-bold">₦3,500,000.00 max</Text>
      </Text>

      <View className="space-y-6 gap-5">
        <View>
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
            Bank Account Number
          </Text>
          <TextInput
            placeholder="0000000000"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Select Bank
          </Text>
          <TouchableOpacity
            onPress={async () => {
              setLoading(true);
              await new Promise((res) => setTimeout(res, 600)); // Mock transition lag
              setLoading(false);
              setStep("select-bank");
            }}
            className="bg-[#F8F8F8] p-4 rounded-xl flex-row justify-between items-center"
          >
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-gray-200 rounded-full items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="bank-outline"
                  size={14}
                  color="#6B7280"
                />
              </View>
              <Text className="text-[#1A1A1A]">{selectedBank}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Bank User's Name
          </Text>
          <TextInput
            placeholder="Simon John"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            editable={false}
            value={userName}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Narrative
          </Text>
          <TextInput
            placeholder="Purpose (e.g. Rent)"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
            value={narrative}
            onChangeText={setNarrative}
          />
        </View>
      </View>

      <ThemedButton
        title="Proceed"
        onPress={async () => {
          setLoading(true);
          await new Promise((res) => setTimeout(res, 800));
          setLoading(false);
          setStep("preview");
        }}
        loading={loading}
        className="mt-10"
      />
    </View>
  );

  const getFilteredBanks = () => {
    if (!banks) return [];
    if (!bankSearchQuery) return banks;
    return banks.filter((bank: Bank) =>
      bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()),
    );
  };

  const renderSelectBank = () => (
    <View className="px-5 mt-4">
      {isLoadingBanks ? (
        <View className="items-center justify-center py-20">
          <ActivityIndicator color="#155D5F" size="large" />
          <Text className="text-[#6B7280] text-xs mt-4">Loading banks...</Text>
        </View>
      ) : isBankError ? (
        <View className="items-center justify-center py-20 px-10">
          <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
          <Text className="text-[#1A1A1A] font-bold text-center mt-4">
            Failed to load banks
          </Text>
          <TouchableOpacity
            onPress={() => refetchBanks()}
            className="mt-4 bg-[#E6F4F4] px-6 py-2 rounded-full"
          >
            <Text className="text-[#155D5F] font-bold text-xs">Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View className="mb-6 flex-row items-center bg-[#F8F8F8] px-4 py-2 rounded-xl">
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Search bank name"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 h-10 text-[#1A1A1A]"
              value={bankSearchQuery}
              onChangeText={setBankSearchQuery}
              autoFocus
            />
          </View>

          <View className="space-y-4 gap-4">
            {getFilteredBanks().map((bank: Bank) => (
              <TouchableOpacity
                key={bank.id}
                onPress={() => {
                  setSelectedBank(bank.name);
                  setStep("recipient-details");
                }}
                className="bg-[#F8F8F8] p-4 rounded-xl"
              >
                <Text className="text-[#1A1A1A] font-medium">{bank.name}</Text>
              </TouchableOpacity>
            ))}
            {getFilteredBanks().length === 0 && (
              <View className="items-center justify-center py-10">
                <Text className="text-[#6B7280] text-center">
                  No banks matching "{bankSearchQuery}"
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
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
          borderColor: "#fefcfc40",
          borderWidth: 0.8,
          borderBottomWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        {/* Wealthconomy Logo */}
        <Image
          source={require("../assets/images/wealth.png")}
          style={{
            width: 80,
            height: 20,
            position: "absolute",
            right: 20,
            top: 20,
          }}
          resizeMode="contain"
        />

        <View className="flex-row justify-between mb-8 mt-2 items-start">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Amount To Transfer
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
              {accountNumber || "0000000000"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Account Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {userName || "Unknown Recipient"}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Bank Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {selectedBank === "Select bank" ? "---" : selectedBank}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Wealth Send From
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {wealthPlan}
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
        onPress={async () => {
          setLoading(true);
          await paymentService.transferFunds({
            amount,
            accountNumber,
            bankName: selectedBank,
            narrative,
          });

          // Add to recent recipients if not already there
          const exists = recipients.some(
            (r) => r.accountNumber === accountNumber,
          );
          if (!exists && accountNumber && userName) {
            setRecipients((prev) => [
              {
                id: Date.now(),
                name: userName,
                bankName: selectedBank,
                accountNumber: accountNumber,
              },
              ...prev,
            ]);
          }

          setLoading(false);
          setShowSuccess(true);
        }}
        loading={loading}
        className="mt-14"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header title={getTitle()} onBack={handleBack} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === "select-recipient" && renderSelectRecipient()}
        {step === "recipient-details" && renderRecipientDetails()}
        {step === "select-bank" && renderSelectBank()}
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
              Funds Transferred Successfully ✅
            </Text>
            <Text className="text-[#6B7280] text-[12px] text-center mb-8 px-4">
              Congratulations, WealthBuilder! You have successfully transferred
              ₦{amount || "0.00"} from your {wealthPlan} account to{" "}
              {userName || "Simon John"} ({selectedBank} -{" "}
              {accountNumber || "1234567890"}).
              {"\n\n"}Current Balance: ₦XX,XXX.XX
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
