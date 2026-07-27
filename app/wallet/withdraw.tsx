import {
  useAddPayoutAccountMutation,
  useGetSupportedBanksQuery,
  useGetUserPayoutAccountsQuery,
  useResolveBankAccountMutation,
} from "@/src/store/api/payoutAccountApi";
import { useInitiateWithdrawalMutation } from "@/src/store/api/withdrawalApi";
import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Step =
  | "select-recipient"
  | "recipient-details"
  | "select-bank"
  | "preview"
  | "pin";

export default function WithdrawScreen() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [step, setStep] = useState<Step>("select-recipient");
  const pinRefs = useRef<Array<TextInput | null>>([]);
  const [pinValues, setPinValues] = useState(["", "", "", ""]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("Select bank");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [wealthPlan] = useState(plan || "WealthFlex");

  // Selected existing payout account id (if any)
  const [selectedPayoutAccountId, setSelectedPayoutAccountId] = useState<string | null>(null);

  // RTK Query Hooks
  const { data: payoutAccountsData } = useGetUserPayoutAccountsQuery();
  const recipients = payoutAccountsData?.items || [];

  const { data: banksData, isLoading: isLoadingBanks, isError: isBankError, refetch: refetchBanks } = useGetSupportedBanksQuery();
  const banks = banksData?.items || [];

  const [resolveAccount, { isLoading: isVerifying }] = useResolveBankAccountMutation();
  const [addPayoutAccount] = useAddPayoutAccountMutation();
  const [initiateWithdrawal, { isLoading: isWithdrawing }] = useInitiateWithdrawalMutation();

  const loading = isWithdrawing;

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = val.replace(/[^\d.]/g, "");
    const amountNum = parseFloat(cleaned) || 0;
    return amountNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const clearInputs = () => {
    setAmount("");
    setAccountNumber("");
    setSelectedBank("Select bank");
    setSelectedBankCode("");
    setUserName("");
    setNarrative("");
    setSelectedPayoutAccountId(null);
  };

  // Auto-fetch account name
  useEffect(() => {
    const resolveName = async () => {
      // If we already selected an existing payout account, we don't need to resolve
      if (selectedPayoutAccountId) return;
      
      if (accountNumber.length === 10 && selectedBankCode) {
        try {
          const res = await resolveAccount({
            accountNumber,
            bankCode: selectedBankCode,
          }).unwrap();
          setUserName(res.accountName);
        } catch (error) {
          console.error("Verification failed:", error);
          setUserName(""); // Clear on failure
        }
      }
    };
    resolveName();
  }, [accountNumber, selectedBankCode, resolveAccount, selectedPayoutAccountId]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank === "Select bank") {
      setStep("select-bank");
    }
  }, [accountNumber, selectedBank]);

  const handleBack = () => {
    if (step === "pin") setStep("preview");
    else if (step === "preview") setStep("recipient-details");
    else if (step === "select-bank") setStep("recipient-details");
    else if (step === "recipient-details") setStep("select-recipient");
    else router.back();
  };

  const getTitle = () => {
    if (step === "select-recipient") return "Wealth Transfer";
    if (step === "recipient-details") return "Wealth Withdrawal";
    if (step === "select-bank") return "Select Bank";
    if (step === "preview") return `${wealthPlan} Preview`;
    if (step === "pin") return "";
    return "";
  };

  const renderSelectRecipient = () => (
    <Animated.View entering={FadeInDown.duration(600).delay(150)} className="px-5">
      <Text className="text-[#4B5563] text-[14px] font-extrabold mb-1 mt-4">
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
            <Text className="text-[#4B5563] text-[13px] font-bold mt-1">
              Transfer funds to a bank account not in your recent list
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {recipients.length > 0 && (
        <>
          <Text className="text-[#1A1A1A] font-extrabold text-[16px] mb-5 mt-6">
            Recent Recipients
          </Text>

          <View className="space-y-4 gap-4">
            {recipients.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                className="flex-row items-center"
                onPress={() => {
                  setSelectedPayoutAccountId(item.id);
                  setAccountNumber(item.accountNumber);
                  setSelectedBank(item.bankName);
                  setSelectedBankCode(item.bankCode);
                  setUserName(item.accountName);
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
                    {item.accountName}
                  </Text>
                  <Text className="text-[#4B5563] text-[13px] font-bold">
                    {item.bankName} - {item.accountNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );

  const renderRecipientDetails = () => (
    <Animated.View entering={FadeInDown.duration(600).delay(150)} className="px-5">
      <Text className="text-[#374151] text-[14px] font-extrabold mb-8 mt-4">
        Amount(₦) <Text className="font-extrabold">₦3,500,000.00 max</Text>
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
            maxLength={10}
            value={accountNumber}
            onChangeText={(val) => {
              setAccountNumber(val);
              setSelectedPayoutAccountId(null); // Clear selected account if they edit
            }}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
            Select Bank
          </Text>
          <TouchableOpacity
            onPress={() => {
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
          <View className="relative">
            <TextInput
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] pr-12"
              value={userName}
              onChangeText={setUserName}
              editable={!isVerifying && !selectedPayoutAccountId}
            />
            {isVerifying && (
              <View className="absolute right-4 top-4">
                <ActivityIndicator size="small" color="#155D5F" />
              </View>
            )}
          </View>
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

      {(() => {
        const isFormValid =
          amount &&
          accountNumber.length === 10 &&
          selectedBank !== "Select bank" &&
          userName;
        return (
          <ThemedButton
            title="Proceed"
            onPress={() => setStep("preview")}
            disabled={!isFormValid || isVerifying}
            style={{
              backgroundColor: !isFormValid || isVerifying ? "#E0E0E0" : "#155D5F",
              opacity: !isFormValid || isVerifying ? 0.45 : 1,
            }}
            className="mt-10"
          />
        );
      })()}
    </Animated.View>
  );

  const getFilteredBanks = () => {
    if (!banks) return [];
    if (!bankSearchQuery) return banks;
    return banks.filter((bank) =>
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
            {getFilteredBanks().map((bank) => (
              <TouchableOpacity
                key={bank.code}
                onPress={() => {
                  setSelectedBank(bank.name);
                  setSelectedBankCode(bank.code);
                  setStep("recipient-details");
                  setSelectedPayoutAccountId(null);
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
    <Animated.View entering={FadeInDown.duration(600).delay(150)} className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Please, recheck and confirm before making the transaction.
      </Text>

      <View
        className="bg-[#F8F8F8] p-6 rounded-t-[24px] relative self-center"
        style={{
          width: 350,
          minHeight: 220,
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
        <View className="flex-row mb-6 mt-2">
          <View className="flex-1">
            <Text className="text-[#9CA3AF] text-[12px] mb-1.5">
              Wealth to Withdraw
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              ₦{formatAmount(amount)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#9CA3AF] text-[12px] mb-1.5">
              Account No.
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              {accountNumber || "0000000000"}
            </Text>
          </View>
        </View>

        <View className="flex-row mb-6">
          <View className="flex-1">
            <Text className="text-[#9CA3AF] text-[12px] mb-1.5">
              Account Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[15px] pr-2">
              {userName || "Unknown"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#9CA3AF] text-[12px] mb-1.5">
              Bank Name
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[15px] pr-2">
              {selectedBank === "Select bank" ? "---" : selectedBank}
            </Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="flex-1">
            <Text className="text-[#9CA3AF] text-[12px] mb-1.5">
              Narrative
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[15px]">
              {narrative || "---"}
            </Text>
          </View>
        </View>

        {/* Jagged Edge Components */}
        <View
          className="flex-row absolute -bottom-[10px] left-0 right-0 overflow-hidden"
          style={{ width: 350.1 }}
        >
          {Array.from({ length: 38 }).map((_, i) => (
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
        onPress={() => setStep("pin")}
        className="mt-14"
      />
    </Animated.View>
  );

  const renderPin = () => (
    <Animated.View entering={FadeInDown.duration(600).delay(150)} className="px-5 items-center mt-6">
      <Image
        source={require("@/assets/images/change-pin.png")}
        style={{ width: 120, height: 120, marginBottom: 10 }}
        resizeMode="contain"
      />
      <Text className="text-[#155D5F] font-extrabold text-[24px] mb-2 mt-4">
        Insert your Pin
      </Text>
      <Text className="text-[#6B7280] text-[13px] mb-8 text-center">
        Please insert pin to complete transaction
      </Text>

      <View className="flex-row justify-center mb-8 w-full px-2" style={{ gap: 16 }}>
        {[0, 1, 2, 3].map((i) => (
          <TextInput
            key={i}
            value={pinValues[i]}
            ref={(el) => { pinRefs.current[i] = el; }}
            className="w-[55px] h-[55px] bg-[#F8F8F8] rounded-xl text-center text-[24px] font-bold text-[#1A1A1A]"
            keyboardType="numeric"
            maxLength={1}
            secureTextEntry
            onChangeText={(val) => {
              const newPins = [...pinValues];
              newPins[i] = val;
              setPinValues(newPins);
              if (val && i < 3) {
                pinRefs.current[i + 1]?.focus();
              }
            }}
          />
        ))}
      </View>

      <ThemedButton
        title="Confirm"
        disabled={pinValues.join("").length !== 4 || loading}
        loading={loading}
        className="mt-6 w-full"
        onPress={async () => {
          try {
            // First ensure we have a payout account ID
            let accountId = selectedPayoutAccountId;

            if (!accountId) {
              const newAccount = await addPayoutAccount({
                accountNumber,
                bankCode: selectedBankCode,
                bankName: selectedBank,
              }).unwrap();
              accountId = newAccount.id;
            }

            // Clean amount string to a valid number in kobo (assuming user typed naira)
            const cleanAmount = parseFloat(amount.replace(/[^\d.]/g, "")) * 100;
            
            await initiateWithdrawal({
              amount: cleanAmount,
              payoutAccountId: accountId,
            }).unwrap();

            setShowSuccess(true);
          } catch (e) {
            console.error("Failed to withdraw:", e);
          }
        }}
      />
    </Animated.View>
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
        {step === "pin" && renderPin()}
      </ScrollView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-[32px] p-8 items-center w-full max-w-[340px]">
            <Image
              source={require("@/assets/images/funds.png")}
              style={{ width: 140, height: 140, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text className="text-[#1A1A1A] font-extrabold text-[22px] text-center mb-4 leading-[28px]">
              Wealth Withdrawal Successful! ✅
            </Text>
            <Text className="text-[#4B5563] text-[14px] text-center mb-8 leading-[22px]">
              Dear WealthBuilder, you have successfully withdrawn ₦{formatAmount(amount)} from your {wealthPlan} savings portfolio. Keep building!
            </Text>
            <ThemedButton
              title="Confirm"
              onPress={() => {
                setShowSuccess(false);
                router.replace("/education/win-up"); // Standard success redirect, adjust as needed
              }}
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
