import { Bank, bankService } from "@/src/api/bankService";
import Header from "@/src/components/common/Header";
import { AppDispatch } from "@/src/store";
import { addBank } from "@/src/store/slices/paymentSlice";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

export default function AddBankScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [userName, setUserName] = useState("Simon John"); // Auto-filled for demo
  const [narrative, setNarrative] = useState("Gift");
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const fetchedBanks = await bankService.fetchBanks();
        setBanks(fetchedBanks);
      } catch (error) {
        console.error("Error loading banks:", error);
      } finally {
        setLoadingBanks(false);
      }
    };
    loadBanks();
  }, []);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddBank = () => {
    if (!accountNumber || !selectedBank) return;

    dispatch(
      addBank({
        id: Math.random().toString(36).substr(2, 9),
        name: userName,
        bankName: selectedBank.name,
        accountNumber: accountNumber,
      }),
    );
    router.back();
  };

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
                onChangeText={setAccountNumber}
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
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                value={userName}
                onChangeText={setUserName}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>

          {/* Narrative */}
          <View>
            <Text className="text-[14px] font-medium text-[#6B7280] mb-2">
              Narrative
            </Text>
            <View className="h-16 bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl px-4 justify-center">
              <TextInput
                value={narrative}
                onChangeText={setNarrative}
                className="text-[15px] font-semibold text-[#111827]"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddBank}
          disabled={!accountNumber || !selectedBank}
          className={`mt-10 h-16 rounded-2xl items-center justify-center ${accountNumber && selectedBank ? "bg-[#155D5F]" : "bg-[#155D5F]/50"}`}
        >
          <Text className="text-white text-base font-bold">Add Bank</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View className="flex-1 bg-white">
          <View className="bg-white border-b border-[#F3F4F6]">
            <SafeAreaView edges={["top"]}>
              <View className="px-5 h-14 flex-row items-center">
                <TouchableOpacity
                  onPress={() => setShowBankPicker(false)}
                  className="mr-4"
                >
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">Select Bank</Text>
              </View>
            </SafeAreaView>
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
              keyExtractor={(item) => item.code}
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
