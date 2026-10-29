import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import {
  useAddPayoutAccountMutation,
  useGetSupportedBanksQuery,
  useGetUserPayoutAccountsQuery,
  useResolveBankAccountMutation,
} from "@/src/store/api/payoutAccountApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { useInitiateWithdrawalMutation } from "@/src/store/api/withdrawalApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useGetKycStatusQuery, useGetKycDocumentsQuery } from "@/src/store/api/kycApi";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { isLevel2Verified } from "@/src/features/kyc/utils/kycState";
import { PasscodeKeypad } from "@/src/components/common/PasscodeKeypad";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PayoutAccount, PayoutBank } from "@/src/types/wallet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
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
  | "preview";

const USE_CUSTOM_KEYPAD = Platform.OS === "android";

export default function WithdrawScreen() {
  const { plan } = useLocalSearchParams<{ plan: string }>();
  const [step, setStep] = useState<Step>("select-recipient");

  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("Select bank");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [wealthPlan] = useState(plan || "WealthFlex");
  const [selectedPayoutAccountId, setSelectedPayoutAccountId] = useState<
    string | null
  >(null);

  // RTK Query Hooks
  const { data: walletSummary } = useGetWalletSummaryQuery();
  const { data: savedPayoutsData, isLoading: isLoadingPayouts } =
    useGetUserPayoutAccountsQuery();
  const {
    data: banksData,
    isLoading: isLoadingBanks,
    isError: isBankError,
    refetch: refetchBanks,
  } = useGetSupportedBanksQuery();
  const [resolveAccount, { isLoading: isVerifying }] =
    useResolveBankAccountMutation();
  const [addPayoutAccount, { isLoading: isAddingPayout }] =
    useAddPayoutAccountMutation();
  const [initiateWithdrawal, { isLoading: isSubmittingWithdrawal }] =
    useInitiateWithdrawalMutation();
  const [verifyPinApi, { isLoading: isVerifyingPin }] = useVerifyPinMutation();

  const [showPinModal, setShowPinModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");
  const pinInputRef = useRef<TextInput>(null);

  const savedPayouts = savedPayoutsData?.items || [];
  const banks = banksData?.items || [];

  const formattedWalletBalance = walletSummary?.currentBalance
    ? (parseFloat(walletSummary.currentBalance) / 100).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  // User & KYC Verification Status Gate
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycData, isLoading: isLoadingKycStatus } = useGetKycStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: kycDocsResponse, isLoading: isLoadingKycDocs } = useGetKycDocumentsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [localKyc2Completed, setLocalKyc2Completed] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("@wealth_kyc_level_2_completed")
      .then((val) => {
        if (val === "true") {
          setLocalKyc2Completed(true);
        }
      })
      .finally(() => {
        setIsCheckingStorage(false);
      });
  }, []);

  const kycDocsPayload: any = kycDocsResponse?.data;
  const kycDocs: any = kycDocsPayload?.data || kycDocsPayload;
  const currentKycLevel = kycData?.data?.currentLevel ?? user?.kycLevel ?? 1;
  const kycStatus = String(kycData?.data?.status || user?.kycStatus || "").toUpperCase();

  const isKycVerified =
    isLevel2Verified(kycDocs, user) ||
    (currentKycLevel >= 2 && (kycStatus === "VERIFIED" || kycStatus === "APPROVED"));

  useEffect(() => {
    if (isKycVerified && (user?.kycLevel || 1) < 2) {
      dispatch(updateKycLevel(2));
      AsyncStorage.setItem("@wealth_kyc_level_2_completed", "true").catch(() => {});
    }
  }, [isKycVerified, user?.kycLevel, dispatch]);

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = val.replace(/[^\d.]/g, "");
    const amountVal = parseFloat(cleaned) || 0;
    return amountVal.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
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

  // Auto-resolve bank account name from backend
  useEffect(() => {
    let isMounted = true;
    const resolve = async () => {
      if (accountNumber.length === 10 && selectedBankCode && !userName) {
        try {
          const res = await resolveAccount({
            accountNumber,
            bankCode: selectedBankCode,
          }).unwrap();
          if (isMounted && res?.accountName) {
            setUserName(res.accountName);
          }
        } catch {
          console.warn("Verification failed");
          if (isMounted) {
            setUserName("");
          }
        }
      }
    };
    resolve();
    return () => {
      isMounted = false;
    };
  }, [accountNumber, selectedBankCode, resolveAccount, userName]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank === "Select bank") {
      setStep("select-bank");
    }
  }, [accountNumber, selectedBank]);

  const handleBack = () => {
    if (step === "preview") setStep("recipient-details");
    else if (step === "select-bank") setStep("recipient-details");
    else if (step === "recipient-details") setStep("select-recipient");
    else router.back();
  };

  const getTitle = () => {
    if (step === "select-recipient") return "Wealth Transfer";
    if (step === "recipient-details") return "Wealth Withdrawal";
    if (step === "select-bank") return "Select Bank";
    if (step === "preview") return `${wealthPlan} Preview`;
    return "";
  };

  const renderSelectRecipient = () => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(150)}
      className="px-5"
    >
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
        Saved Recipient Accounts
      </Text>

      {isLoadingPayouts ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator color="#155D5F" size="small" />
        </View>
      ) : savedPayouts.length === 0 ? (
        <View className="items-center justify-center py-8 px-4 bg-[#F9FAFB] rounded-2xl border border-gray-100 mb-6">
          <MaterialCommunityIcons
            name="account-clock-outline"
            size={36}
            color="#9CA3AF"
          />
          <Text className="text-[#1A1A1A] font-medium text-xs mt-2">
            No saved recipients
          </Text>
          <Text className="text-[#6B7280] text-[11px] text-center mt-1">
            Bank accounts you add or use will appear here for easy selection.
          </Text>
        </View>
      ) : (
        <View className="space-y-4 gap-4">
          {savedPayouts.map((item: PayoutAccount, index: number) => (
            <TouchableOpacity
              key={item.id || `payout-${index}`}
              className="flex-row items-center p-3 rounded-xl bg-[#F8F8F8]"
              onPress={() => {
                setAccountNumber(item.accountNumber);
                setSelectedBank(item.bankName);
                setSelectedBankCode(item.bankCode);
                setUserName(item.accountName);
                setSelectedPayoutAccountId(item.id);
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
              <View className="flex-1">
                <Text className="text-[#1A1A1A] font-bold text-sm">
                  {item.accountName}
                </Text>
                <Text className="text-[#6B7280] text-[11px]">
                  {item.bankName} - {item.accountNumber}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, "");
    if (!cleaned) {
      setAmount("");
      return;
    }
    const num = parseInt(cleaned, 10);
    setAmount(num.toLocaleString("en-US"));
  };

  const renderRecipientDetails = () => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(150)}
      className="px-5"
    >
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Wallet Balance:{" "}
        <Text className="font-bold text-[#155D5F]">
          ₦{formattedWalletBalance}
        </Text>
      </Text>

      {(() => {
        const walletBalanceInNaira = walletSummary?.currentBalance
          ? parseFloat(walletSummary.currentBalance) / 100
          : 0;
        const numericAmount = parseFloat(amount.replace(/,/g, "")) || 0;
        const isAmountExceeded = numericAmount > walletBalanceInNaira;

        const isFormValid =
          numericAmount > 0 &&
          !isAmountExceeded &&
          accountNumber.length === 10 &&
          selectedBank !== "Select bank" &&
          !!userName.trim();

        return (
          <View className="space-y-6 gap-5">
            <View>
              <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
                Amount (₦)
              </Text>
              <View
                className={`bg-[#F8F8F8] px-4 py-3.5 rounded-xl flex-row items-center ${
                  isAmountExceeded ? "border border-red-500" : ""
                }`}
              >
                <Text className="text-[#1A1A1A] font-semibold text-[16px] mr-1">
                  ₦
                </Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-[#1A1A1A] font-semibold text-[16px] p-0"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
              {isAmountExceeded && (
                <Text className="text-red-500 text-[12px] font-medium mt-1 px-1">
                  Amount is greater than wallet balance
                </Text>
              )}
            </View>

            <View>
              <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
                Bank Account Number
              </Text>
              <TextInput
                placeholder="0000000000"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] font-semibold text-[15px]"
                keyboardType="numeric"
                maxLength={10}
                value={accountNumber}
                onChangeText={(val) => {
                  setAccountNumber(val);
                  setUserName("");
                  setSelectedPayoutAccountId(null);
                }}
              />
            </View>

            <View>
              <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
                Select Bank
              </Text>
              <TouchableOpacity
                onPress={() => setStep("select-bank")}
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
                  <Text
                    className={`font-semibold ${
                      selectedBank !== "Select bank"
                        ? "text-[#1A1A1A]"
                        : "text-[#9CA3AF]"
                    }`}
                  >
                    {selectedBank}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-[#1A1A1A] font-bold text-xs mb-2">
                Account Holder Name
              </Text>
              <View className="relative">
                <TextInput
                  placeholder={
                    isVerifying
                      ? "Resolving account name..."
                      : "Account name will appear here"
                  }
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] pr-12 font-semibold"
                  value={userName}
                  onChangeText={setUserName}
                  editable={false}
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
                Narrative (Optional)
              </Text>
              <TextInput
                placeholder="Purpose (e.g. Withdrawal)"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A]"
                value={narrative}
                onChangeText={setNarrative}
              />
            </View>

            <ThemedButton
              title="Proceed to Preview"
              onPress={() => {
                if (!isKycVerified) {
                  setShowKycModal(true);
                  return;
                }
                setStep("preview");
              }}
              disabled={!isFormValid}
              textStyle={{
                color: !isFormValid ? "#1A1A1A" : "#FFFFFF",
                fontWeight: "600",
              }}
              style={{
                backgroundColor: !isFormValid ? "#E0E0E0" : "#155D5F",
                opacity: 1,
              }}
              className="mt-6"
            />
          </View>
        );
      })()}
    </Animated.View>
  );

  const getFilteredBanks = () => {
    if (!banks) return [];
    if (!bankSearchQuery) return banks;
    return banks.filter((bank: PayoutBank) =>
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
            {getFilteredBanks().map((bank: PayoutBank, index: number) => (
              <TouchableOpacity
                key={`${bank.code || "bank"}-${index}`}
                onPress={() => {
                  setSelectedBank(bank.name);
                  setSelectedBankCode(bank.code);
                  setUserName(""); // reset username to trigger resolve
                  setStep("recipient-details");
                }}
                className="bg-[#F8F8F8] p-4 rounded-xl flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] font-medium">{bank.name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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

  const handleOpenPinPrompt = () => {
    if (!isKycVerified) {
      setShowKycModal(true);
      return;
    }
    setPinValue("");
    setPinError("");
    setShowPinModal(true);
    if (!USE_CUSTOM_KEYPAD) {
      setTimeout(() => pinInputRef.current?.focus(), 300);
    }
  };

  const handleKeypadDigit = (digit: string) => {
    if (isVerifyingPin || isSubmittingWithdrawal) return;
    if (pinValue.length >= 4) return;
    const nextPin = (pinValue + digit).slice(0, 4);
    setPinValue(nextPin);
    setPinError("");
    if (nextPin.length === 4) {
      handleVerifyAndSubmitWithdrawal(nextPin);
    }
  };

  const handleKeypadBackspace = () => {
    if (isVerifyingPin || isSubmittingWithdrawal) return;
    setPinValue((prev) => prev.slice(0, -1));
    setPinError("");
  };

  const handleKeypadClear = () => {
    if (isVerifyingPin || isSubmittingWithdrawal) return;
    setPinValue("");
    setPinError("");
  };

  const handleVerifyAndSubmitWithdrawal = async (enteredPin: string) => {
    if (enteredPin.length !== 4) return;
    setPinError("");
    try {
      await verifyPinApi({ pin: enteredPin }).unwrap();
      setShowPinModal(false);
      await executeWithdrawal();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Incorrect transaction PIN. Please try again.";
      setPinError(msg);
      setPinValue("");
    }
  };

  const executeWithdrawal = async () => {
    const numericAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    if (numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    try {
      let payoutIdToUse = selectedPayoutAccountId;

      // If user typed a payout account that isn't saved yet, save it first
      if (!payoutIdToUse) {
        const addedPayout = await addPayoutAccount({
          accountNumber,
          bankCode: selectedBankCode,
          bankName: selectedBank,
        }).unwrap();
        payoutIdToUse = addedPayout?.id;
      }

      if (!payoutIdToUse) {
        throw new Error("Unable to establish payout account details.");
      }

      // Initiate real withdrawal
      await initiateWithdrawal({
        payoutAccountId: payoutIdToUse,
        amount: numericAmount,
      }).unwrap();

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Withdrawal error");
      Alert.alert(
        "Withdrawal Failed",
        error?.data?.message ||
          error?.message ||
          "Failed to complete withdrawal. Please try again.",
      );
    }
  };

  const renderPreview = () => (
    <Animated.View
      entering={FadeInDown.duration(600).delay(150)}
      className="px-5"
    >
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Please, recheck and confirm before making the transaction.
      </Text>

      <View
        className="bg-[#F6F6F6] p-6 rounded-t-[24px] relative w-full"
        style={{
          minHeight: 180,
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
        <View className="flex-row justify-between mb-6 mt-2 items-start">
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

        <View className="flex-row justify-between mb-6">
          <View className="flex-1 mr-2">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Account Name
            </Text>
            <Text
              className="text-[#1A1A1A] font-bold text-[15px]"
              numberOfLines={1}
            >
              {userName || "Unknown Recipient"}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-1.5 font-medium">
              Bank Name
            </Text>
            <Text
              className="text-[#1A1A1A] font-bold text-[15px]"
              numberOfLines={1}
            >
              {selectedBank === "Select bank" ? "---" : selectedBank}
            </Text>
          </View>
        </View>

        {/* Jagged Edge Components */}
        <View className="flex-row absolute -bottom-[10px] left-0 right-0 overflow-hidden w-full">
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
        title="Confirm Withdrawal"
        onPress={handleOpenPinPrompt}
        loading={isAddingPayout || isSubmittingWithdrawal}
        className="mt-14"
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
              Withdrawal Initiated ✅
            </Text>
            <Text className="text-[#6B7280] text-[12px] text-center mb-8 px-4">
              Your withdrawal of ₦{formatAmount(amount)} from your wallet
              account to {userName} ({selectedBank} - {accountNumber}) has been
              submitted successfully.
            </Text>
            <ThemedButton
              title="Done"
              onPress={() => {
                setShowSuccess(false);
                router.replace("/(tabs)/my-account");
              }}
              className="w-full"
            />
          </View>
        </View>
      </Modal>

      {/* KYC Level 2 Verification Gate Modal */}
      <Modal visible={!isKycVerified && !isLoadingKycStatus && !isLoadingKycDocs} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[28px] p-7 items-center w-full max-w-[340px]">
            <View className="w-16 h-16 rounded-full bg-[#155D5F]/10 items-center justify-center mb-4">
              <Ionicons name="shield-outline" size={34} color="#155D5F" />
            </View>
            <Text className="text-[#1A1A1A] font-extrabold text-[20px] text-center mb-2">
              Identity Verification Required
            </Text>
            <Text className="text-[#64748B] text-[13.5px] text-center mb-6 leading-[20px]">
              To enable withdrawals and protect your funds, Central Bank guidelines require you to complete KYC Level 2 identity verification.
            </Text>
            <ThemedButton
              title="Verify Identity Now"
              onPress={() => {
                router.replace("/kyc/level2-intro");
              }}
              style={{ width: "100%", backgroundColor: "#155D5F", height: 50, borderRadius: 14 }}
            />
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-3.5 py-2"
            >
              <Text className="text-[#64748B] font-semibold text-[14px]">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4-Digit Transaction PIN Authorization Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View
            className="bg-white rounded-[28px] p-5 items-center w-full max-w-[340px]"
            style={{ maxHeight: "96%" }}
          >
            <View className="w-12 h-12 rounded-full bg-[#E6F4F4] items-center justify-center mb-2">
              <Ionicons name="keypad-outline" size={24} color="#155D5F" />
            </View>
            <Text className="text-[#1A1A1A] font-extrabold text-[18px] text-center mb-1">
              Enter Transaction PIN
            </Text>
            <Text className="text-[#6B7280] text-[12px] text-center mb-3">
              Authorize withdrawal of ₦{formatAmount(amount)} to {userName || "recipient"}
            </Text>

            {/* Masked PIN Dots */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (!USE_CUSTOM_KEYPAD) {
                  pinInputRef.current?.focus();
                }
              }}
              accessibilityLabel={`Transaction PIN, ${pinValue.length} of 4 digits entered`}
              accessible={true}
              className="flex-row justify-center gap-3 mb-3"
            >
              {Array.from({ length: 4 }).map((_, index) => {
                const isFilled = index < pinValue.length;
                return (
                  <View
                    key={index}
                    style={{
                      width: USE_CUSTOM_KEYPAD ? 48 : 52,
                      height: USE_CUSTOM_KEYPAD ? 50 : 56,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: isFilled ? "#155D5F" : "#E5E7EB",
                      backgroundColor: isFilled ? "#EEF7F8" : "#F9FAFB",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isFilled && (
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: "#155D5F",
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </TouchableOpacity>

            {!USE_CUSTOM_KEYPAD && (
              <TextInput
                ref={pinInputRef}
                value={pinValue}
                onChangeText={(val) => {
                  const cleaned = val.replace(/[^0-9]/g, "").slice(0, 4);
                  setPinValue(cleaned);
                  setPinError("");
                  if (cleaned.length === 4) {
                    handleVerifyAndSubmitWithdrawal(cleaned);
                  }
                }}
                keyboardType="numeric"
                maxLength={4}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                autoFocus
              />
            )}

            {!!pinError && (
              <Text className="text-[#DC2626] font-semibold text-[12px] text-center mb-2">
                {pinError}
              </Text>
            )}

            {isVerifyingPin || isSubmittingWithdrawal ? (
              <View className="py-2 items-center">
                <ActivityIndicator size="small" color="#155D5F" />
                <Text className="text-[#6B7280] text-[11px] mt-1">
                  Verifying PIN & initiating transfer...
                </Text>
              </View>
            ) : null}

            {USE_CUSTOM_KEYPAD ? (
              <>
                <View style={{ width: "100%", marginVertical: 4 }}>
                  <PasscodeKeypad
                    onDigit={handleKeypadDigit}
                    onBackspace={handleKeypadBackspace}
                    onClear={handleKeypadClear}
                    disabled={isVerifyingPin || isSubmittingWithdrawal}
                    disableBottomInset={true}
                    compact={true}
                    style={{
                      backgroundColor: "#F3F4F6",
                      borderRadius: 16,
                      paddingHorizontal: 6,
                      paddingTop: 6,
                      paddingBottom: 6,
                      gap: 6,
                    }}
                  />
                </View>

                <View className="flex-row items-center justify-between w-full px-2 mt-2">
                  <TouchableOpacity
                    onPress={() => {
                      setShowPinModal(false);
                      router.push("/profile/security/change-pin" as any);
                    }}
                    className="py-1.5"
                  >
                    <Text className="text-[#155D5F] font-bold text-[13px]">
                      Forgot PIN?
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowPinModal(false)}
                    className="py-1.5"
                  >
                    <Text className="text-[#6B7280] font-semibold text-[13px]">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setShowPinModal(false);
                    router.push("/profile/security/change-pin" as any);
                  }}
                  className="mt-2 py-1.5"
                >
                  <Text className="text-[#155D5F] font-bold text-[13px]">
                    Forgot PIN?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowPinModal(false)}
                  className="mt-2 py-2"
                >
                  <Text className="text-[#6B7280] font-semibold text-[13px]">Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
