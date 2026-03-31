import { goalService, WealthGoal } from "@/src/api/goalService";
import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "form" | "preview" | "pin" | "success";

const CATEGORY_DETAILS: Record<string, { subtitle: string; emoji: string }> = {
  Rent: { subtitle: "Stay ahead of your landlord", emoji: "🏠" },
  Business: { subtitle: "Fund your entrepreneurship dreams", emoji: "💼" },
  "School Fees": { subtitle: "Fund your education dreams", emoji: "🎓" },
  Vacation: { subtitle: "Save for your dream trip", emoji: "✈️" },
};

export default function CreateGoalScreen() {
  const { category: initialCategory } = useLocalSearchParams<{
    category: string;
  }>();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(true);

  // Form State
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [pin, setPin] = useState("");
  const pinInputRef = useRef<TextInput>(null);

  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  const SOURCES = ["Wealth Save", "Wealth Flex", "Bank Account"];
  const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const cleaned = val.replace(/[^\d.]/g, "");
    const num = parseFloat(cleaned) || 0;
    return num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleContinue = () => {
    if (step === "form") {
      setStep("preview");
    } else if (step === "preview") {
      setStep("pin");
    }
  };

  const handleCreate = useCallback(async () => {
    setLoading(true);
    const newGoal: WealthGoal = {
      id: Date.now().toString(),
      title: goalName,
      subtitle: category,
      amount: formatAmount(amount),
      saved: "0.00",
      progress: 0,
      daysLeft: 365,
      endDate: endDate || "N/A",
      automationFrequency: isManual
        ? "Manual"
        : (frequency as any) || "Monthly",
      source: source || "Wealth Save",
    };

    try {
      await goalService.saveGoal(newGoal);
      setStep("success");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    goalName,
    category,
    amount,
    endDate,
    isManual,
    frequency,
    source,
    goalService,
  ]);

  useEffect(() => {
    if (pin.length === 4 && step === "pin") {
      handleCreate();
    }
  }, [pin, step, handleCreate]);

  const renderForm = () => (
    <View className="px-5">
      {showRules && (
        <View
          style={{
            width: 366,
            height: 226,
            borderRadius: 15,
            backgroundColor: "#FFE6F2B2",
          }}
          className="p-5 mb-8 relative mt-4 self-center"
        >
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowRules(false)}
          >
            <Ionicons name="close" size={20} color="#F3007A" />
          </TouchableOpacity>
          <Text
            style={{ color: "#F3007A" }}
            className="font-extrabold text-[12px] mb-6"
          >
            Important "Need to Know" Rules
          </Text>
          <View className="space-y-5 gap-5">
            <Text
              style={{ color: "#F3007A" }}
              className="text-[10px] leading-[15px]"
            >
              👉{" "}
              <Text
                style={{ color: "#F3007A" }}
                className="font-bold text-[12px]"
              >
                Interest Rate:
              </Text>{" "}
              Currently, Target Savings offers around 12% per annum, paid daily
              into your Flex account.
            </Text>
            <Text
              style={{ color: "#F3007A" }}
              className="text-[10px] leading-[15px]"
            >
              👉{" "}
              <Text
                style={{ color: "#F3007A" }}
                className="font-bold text-[12px]"
              >
                The 3% Breaking Fee:
              </Text>{" "}
              If you need to withdraw your money before the maturity date you
              set, PiggyVest charges a 3% penalty fee on the entire balance.
              This is to discourage you from touching your "goal" money
              prematurely.
            </Text>
            <Text
              style={{ color: "#F3007A" }}
              className="text-[10px] leading-[15px]"
            >
              👉{" "}
              <Text
                style={{ color: "#F3007A" }}
                className="font-bold text-[12px]"
              >
                Goal Completion:
              </Text>{" "}
              You must reach at least 70% of your target amount by the end date
              to be considered "successful" and avoid certain restrictions on
              future targets.
            </Text>
          </View>
        </View>
      )}

      <View className="space-y-6 gap-6 mb-10">
        <View className="mb-6">
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Target Goal
          </Text>
          <TextInput
            placeholder="e.g., 'Tuition fee,' 'New Laptop,' or 'Wedding'"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F3F4F6] p-4 rounded-xl text-[#1A1A1A]"
            value={goalName}
            onChangeText={setGoalName}
          />
        </View>

        <View className="mb-6">
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Category
          </Text>
          <TextInput
            placeholder="Rent, Travel, Education, Business, etc."
            placeholderTextColor="#9CA3AF"
            className="bg-[#F3F4F6] p-4 rounded-xl text-[#1A1A1A]"
            value={category}
            onChangeText={setCategory}
          />
        </View>

        <View className="mb-6">
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Wealth Source
          </Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowSourceDropdown(!showSourceDropdown)}
            className="bg-[#F3F4F6] p-4 rounded-xl flex-row justify-between items-center"
          >
            <Text
              className={
                source
                  ? "text-[#1A1A1A] font-medium"
                  : "text-[#9CA3AF] font-medium"
              }
            >
              {source || "Select funding source"}
            </Text>
            <Ionicons
              name={showSourceDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#1A1A1A"
            />
          </TouchableOpacity>
          {showSourceDropdown && (
            <View className="bg-white rounded-xl mt-2 overflow-hidden elevation-5 shadow-lg border border-[#F3F4F6]">
              {SOURCES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setSource(s);
                    setShowSourceDropdown(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <Text style={{ color: "#323232", fontSize: 15 }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2 pt-3">
            Goal Amount(₦)
          </Text>
          <TextInput
            placeholder="₦3,500,000.00"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] mb-5"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Automation Frequency
          </Text>
          <TouchableOpacity
            onPress={() => setShowFreqDropdown(!showFreqDropdown)}
            className="bg-[#F8F8F8] p-4 rounded-xl flex-row justify-between items-center mb-1"
          >
            <Text
              className={
                frequency
                  ? "text-[#1A1A1A] font-medium"
                  : "text-[#9CA3AF] font-medium"
              }
            >
              {frequency || "Daily, Weekly, or Monthly"}
            </Text>
            <Ionicons
              name={showFreqDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#1A1A1A"
            />
          </TouchableOpacity>
          {showFreqDropdown && (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E5E5E5",
                borderRadius: 12,
                backgroundColor: "#fff",
                marginTop: 4,
                overflow: "hidden",
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 6,
              }}
            >
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => {
                    setFrequency(f);
                    setShowFreqDropdown(false);
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <Text style={{ color: "#323232", fontSize: 15 }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center pt-3">
          <View className="flex-1 mr-4">
            <Text className="text-[#1A1A1A] font-bold text-[12px] pt-3">
              Manual
            </Text>
            <Text className="text-[#9CA3AF] text-[10px]">
              "Top Up" whenever you have spare cash (no automation)
            </Text>
          </View>
          <Switch
            value={isManual}
            onValueChange={setIsManual}
            trackColor={{ false: "#C9C9C9", true: "#155D5F" }}
            ios_backgroundColor="#C9C9C9"
            thumbColor={
              Platform.OS === "ios"
                ? "#FFFFFF"
                : isManual
                  ? "#FFFFFF"
                  : "#999999"
            }
          />
        </View>

        <View className="mb-10">
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2 pt-3">
            End Date
          </Text>
          <TextInput
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F3F4F6] p-4 rounded-xl text-[#1A1A1A]"
            value={endDate}
            onChangeText={setEndDate}
          />
          <Text className="text-[#9CA3AF] text-[9px] mt-2 italic">
            Note: To earn the full interest, you must meet your target amount
            and reach this date
          </Text>
        </View>
      </View>

      <ThemedButton
        title="Continue"
        onPress={handleContinue}
        disabled={!goalName || !amount}
        className="mb-10"
      />
    </View>
  );

  const renderPreview = () => (
    <View className="px-5">
      <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
        Please, recheck and confirm before making the transaction.
      </Text>

      <View
        className="bg-[#F6F6F6] p-8 rounded-t-[24px] relative self-center"
        style={{
          width: 365,
          height: 310,
          borderColor: "#fefcfc40",
          borderWidth: 0.8,
          borderBottomWidth: 0,
        }}
      >
        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium ">
              Goal Amount
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              ₦{formatAmount(amount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
              Category
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {category}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
              Funding Source
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {source || "Wealth Save"}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
              End Date
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {endDate || "24th Jan 2023"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
              Wealth Growth
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              ₦2,463.00
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
              Method
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {isManual ? "Manual" : "Automation"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View>
            <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
              Automation Frequency
            </Text>
            <Text className="text-[#1A1A1A] font-bold text-[16px]">
              {isManual ? "None" : frequency || "Monthly"}
            </Text>
          </View>
        </View>

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
        title="Continue"
        onPress={handleContinue}
        className="mt-14"
      />
    </View>
  );

  const renderPin = () => (
    <View className="items-center px-5 mt-10">
      <Image
        source={require("../assets/images/change-pin.png")}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />
      <Text className="text-[#1A1A1A] font-extrabold text-[24px] mt-6 mb-2">
        Insert your Pin
      </Text>
      <Text className="text-[#6B7280] text-center text-[13px] mb-10 leading-[20px] px-4">
        You must insert your pin to confirm to completely create your Wealth
        Goal
      </Text>

      {/* Pin Input Display - Clickable */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => pinInputRef.current?.focus()}
        className="flex-row justify-center space-x-4 gap-4 mb-10"
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className="w-16 h-16 bg-[#F8F8F8] rounded-xl items-center justify-center border border-[#E5E5E5]"
          >
            <Text className="text-[20px] font-bold">{pin[i] ? "●" : ""}</Text>
          </View>
        ))}
      </TouchableOpacity>

      {/* Hidden Real Input */}
      <TextInput
        ref={pinInputRef}
        className="absolute opacity-0"
        value={pin}
        onChangeText={setPin}
        maxLength={4}
        keyboardType="numeric"
        autoFocus
      />

      <View className="mb-10 px-8">
        <Text className="text-[#6B7280] text-center text-[12px]">
          If you have forgotten your pin, change it from your settings page
        </Text>
      </View>

      <View className="items-center mb-12">
        <Ionicons name="finger-print" size={36} color="#155D5F" />
        <Text className="text-[#155D5F] font-bold mt-2 text-[14px]">
          Use fingerprint
        </Text>
      </View>

      {loading && (
        <View className="items-center">
          <Text className="text-[#F3007A] font-bold">Creating Goal...</Text>
        </View>
      )}
    </View>
  );

  const renderSuccess = () => (
    <View className="items-center px-5 mt-10">
      <View className="relative items-center justify-center mb-10">
        <Image
          source={require("../assets/images/success.png")}
          style={{ width: 280, height: 280, opacity: 0.3 }}
          resizeMode="contain"
        />
        <Image
          source={require("../assets/images/setgoal.png")}
          style={{ width: 160, height: 160, position: "absolute" }}
          resizeMode="contain"
        />
      </View>

      <Text className="text-[#1A1A1A] font-extrabold text-[26px] text-center mb-4 leading-[32px]">
        You have set a Wealth Goal🥳🎯
      </Text>

      <Text className="text-[#6B7280] text-center text-[14px] leading-[22px] mb-12 px-2">
        Congratulations, WealthBuilder! You have successfully funded your Wealth
        Goal account. Your money is now looking forward to help you achieve your
        goal.🥳{"\n"}
        <Text className="font-bold text-[#1A1A1A]">
          Current Balance: ₦{formatAmount(amount)}
        </Text>
      </Text>

      <ThemedButton
        title="Close"
        onPress={() => router.replace("/portfolios/wealth-goal" as any)}
        className="w-full"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      {step !== "success" && (
        <Header
          title={
            step === "form"
              ? "Create a WealthGoal"
              : step === "preview"
                ? "WealthGoal Preview"
                : step === "pin"
                  ? "Insert Pin"
                  : ""
          }
          onBack={() => {
            if (step === "preview") setStep("form");
            else if (step === "pin") setStep("preview");
            else router.back();
          }}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="py-2">
            {step === "form" && (
              <View>
                <Text className="px-5 text-[#6B7280] text-[13px] mb-4">
                  Start aiming towards your goal
                </Text>
                {CATEGORY_DETAILS[category] && (
                  <View
                    style={{
                      backgroundColor: "#FFEEF7",
                      borderRadius: 15,
                      padding: 16,
                      marginHorizontal: 20,
                      marginBottom: 20,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                      <Text className="text-[24px]">
                        {CATEGORY_DETAILS[category].emoji}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-extrabold text-[16px] text-[#F3007A] mb-0.5">
                        {category}
                      </Text>
                      <Text className="text-[11px] text-[#F3007A] opacity-70">
                        {CATEGORY_DETAILS[category].subtitle}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
            {step === "form" && renderForm()}
            {step === "preview" && renderPreview()}
            {step === "pin" && renderPin()}
            {step === "success" && renderSuccess()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
