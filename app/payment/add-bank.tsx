import {
  useAddPayoutAccountMutation,
  useGetSupportedBanksQuery,
  useResolveBankAccountMutation,
} from "@/src/store/api/payoutAccountApi";
import { PayoutBank } from "@/src/types/wallet";
import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddBankScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<PayoutBank | null>(null);
  const [userName, setUserName] = useState("");
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: banksData, isLoading: loadingBanks } = useGetSupportedBanksQuery();
  const banks = banksData?.items || [];

  const [resolveAccount, { isLoading: isResolving }] = useResolveBankAccountMutation();
  const [addPayoutAccount, { isLoading: isAdding }] = useAddPayoutAccountMutation();

  // Auto-resolve account name on account number & bank selection
  useEffect(() => {
    let isMounted = true;
    const resolve = async () => {
      if (accountNumber.length === 10 && selectedBank?.code) {
        setResolveError(null);
        try {
          const payload = {
            accountNumber,
            bankCode: selectedBank.code,
          };
          console.log("=== API REQUEST ===");
          console.log("Endpoint: POST /api/v1/payout-accounts/resolve");
          console.log("Payload:", JSON.stringify(payload, null, 2));
          
          const res = await resolveAccount(payload).unwrap();
          
          console.log("=== API RESPONSE ===");
          console.log("Success:", JSON.stringify(res, null, 2));
          
          if (isMounted) {
            setUserName(res.accountName);
            setResolveError(null);
          }
        } catch (error: any) {
          console.log("=== API ERROR ===");
          console.log("Error:", JSON.stringify(error, null, 2));
          console.warn("Bank verification failed:", error);
          if (isMounted) {
            setUserName("");
            setResolveError(
              error?.data?.message ||
                error?.message ||
                "Unable to resolve account details. Please verify your account number."
            );
          }
        }
      } else {
        setUserName("");
        setResolveError(null);
      }
    };
    resolve();
    return () => {
      isMounted = false;
    };
  }, [accountNumber, selectedBank, resolveAccount]);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddBank = async () => {
    if (!accountNumber || !selectedBank || !userName) return;

    try {
      await addPayoutAccount({
        accountNumber,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      }).unwrap();
      Alert.alert("Success", "Bank account added successfully!");
      router.back();
    } catch (err: any) {
      console.error("Failed to add payout account:", err);
      Alert.alert("Error", err?.data?.message || err?.message || "Failed to add bank account");
    }
  };

  const isFormReady =
    accountNumber.length === 10 &&
    !!selectedBank &&
    !!userName.trim() &&
    !isAdding &&
    !isResolving;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Add Bank Account" />

      <ScrollView
        className="flex-1 px-5 pt-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="gap-y-6">
          {/* Account Number */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Bank Account Number
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="Enter 10-digit account number"
                placeholderTextColor="#9CA3AF"
                value={accountNumber}
                onChangeText={(val) => {
                  setAccountNumber(val);
                  setResolveError(null);
                }}
                keyboardType="numeric"
                maxLength={10}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>

          {/* Select Bank */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Select Bank
            </Text>
            <TouchableOpacity
              onPress={() => setShowBankPicker(true)}
              className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-[#EFF7F8] rounded-full items-center justify-center mr-3">
                  <Ionicons name="library-outline" size={16} color="#155D5F" />
                </View>
                <Text
                  className={`text-[15px] font-semibold ${selectedBank ? "text-[#111827]" : "text-[#9CA3AF]"}`}
                >
                  {selectedBank ? selectedBank.name : "Select bank"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* User's Name */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Bank User's Name
            </Text>
            <View
              className={`h-16 bg-[#F9FAFB] border ${resolveError ? "border-red-300" : userName ? "border-emerald-300" : "border-[#F3F4F6]"} rounded-2xl px-4 flex-row items-center justify-between`}
            >
              <TextInput
                value={userName}
                placeholder={isResolving ? "Resolving account name..." : "Account name will appear here"}
                placeholderTextColor="#9CA3AF"
                editable={false}
                className="text-[15px] font-semibold text-[#111827] flex-1"
              />
              {isResolving && (
                <ActivityIndicator size="small" color="#155D5F" />
              )}
              {!isResolving && userName ? (
                <View className="w-6 h-6 bg-emerald-100 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="#059669" />
                </View>
              ) : null}
            </View>
            {resolveError && (
              <Text className="text-[12px] text-red-500 font-medium mt-1.5 px-1">
                {resolveError}
              </Text>
            )}
          </View>

          {/* Narrative */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Narrative (Optional)
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                placeholder="e.g. My primary savings account"
                placeholderTextColor="#9CA3AF"
                value={narrative}
                onChangeText={setNarrative}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddBank}
          disabled={!isFormReady}
          className={`mt-10 h-16 rounded-2xl items-center justify-center ${isFormReady ? "bg-[#155D5F]" : "bg-[#155D5F]/40"}`}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-base font-bold">Add Bank</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={{ paddingTop: insets.top, flex: 1 }} className="bg-white">
          <View className="px-5 h-14 flex-row items-center border-b border-[#F3F4F6]">
            <TouchableOpacity
              onPress={() => setShowBankPicker(false)}
              className="mr-4"
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">Select Bank</Text>
          </View>

          <View className="px-5 py-4">
            <View className="h-12 bg-[#F9FAFB] rounded-xl px-4 flex-row items-center">
              <Ionicons
                name="search"
                size={20}
                color="#9CA3AF"
                className="mr-2"
              />
              <TextInput
                placeholder="Search banks..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-base h-full"
              />
            </View>
          </View>

          {loadingBanks ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#155D5F" />
            </View>
          ) : (
            <FlatList
              data={filteredBanks}
              keyExtractor={(item, index) => `${item.code || ""}-${index}`}
              className="px-5"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankPicker(false);
                    setSearchQuery("");
                  }}
                  className="py-4 border-b border-[#F9FAFB] flex-row items-center"
                >
                  <View className="w-10 h-10 bg-[#EFF7F8] rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="library-outline"
                      size={20}
                      color="#155D5F"
                    />
                  </View>
                  <Text className="text-base font-semibold text-[#111827]">
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
