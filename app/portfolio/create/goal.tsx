import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCreatePortfolioMutation } from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Step = "form" | "preview" | "pin" | "success";

const CATEGORY_DETAILS: Record<string, { subtitle: string; emoji: string }> = {
  Rent: { subtitle: "Stay ahead of your landlord", emoji: "🏠" },
  Business: { subtitle: "Fund your business dreams", emoji: "💼" },
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

  const [createPortfolio] = useCreatePortfolioMutation();
  const [verifyPin] = useVerifyPinMutation();

  // Wallet State
  const { data: walletData, refetch: refetchWallet } = useGetWalletSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetchWallet();
    }, [refetchWallet])
  );

  const walletBalanceNaira = parseFloat(walletData?.currentBalance || "0") / 100;
  const [createdGoalId, setCreatedGoalId] = useState<string | null>(null);

  // Form State
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [amount, setAmount] = useState("");
  const [autoSaveAmount, setAutoSaveAmount] = useState("");
  const [manualDepositAmount, setManualDepositAmount] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [isManual, setIsManual] = useState(false);
  
  // Date State
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // at least tomorrow
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calMode, setCalMode] = useState<"days" | "months" | "years">("days");
  const [calViewDate, setCalViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  });

  const [wealthPreference, setWealthPreference] = useState<"Interest Based" | "Impact Wealth">("Interest Based");
  const [pin, setPin] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const pinInputRef = useRef<TextInput>(null);

  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

  const formatAmount = (val: string | number) => {
    if (!val) return "0.00";
    const cleaned = typeof val === "number" ? val.toString() : val.replace(/[^\d.]/g, "");
    const num = parseFloat(cleaned) || 0;
    return num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateRecommendedSaving = () => {
    const target = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    if (target <= 0) return null;
    const now = new Date().getTime();
    const end = endDate.getTime();
    const days = Math.max(1, Math.ceil((end - now) / (1000 * 3600 * 24)));

    if (frequency === "Daily") {
      const perDay = Math.ceil(target / days);
      return `₦${perDay.toLocaleString("en-NG")} / day (${days} days)`;
    } else if (frequency === "Weekly") {
      const weeks = Math.max(1, Math.ceil(days / 7));
      const perWeek = Math.ceil(target / weeks);
      return `₦${perWeek.toLocaleString("en-NG")} / week (~${weeks} weeks)`;
    } else {
      const months = Math.max(1, Math.ceil(days / 30));
      const perMonth = Math.ceil(target / months);
      return `₦${perMonth.toLocaleString("en-NG")} / month (~${months} months)`;
    }
  };

  const calculateEstimatedInterest = () => {
    if (wealthPreference === "Impact Wealth") return "0.00";
    const target = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    const now = new Date().getTime();
    const end = endDate.getTime();
    const days = Math.max(1, Math.ceil((end - now) / (1000 * 3600 * 24)));
    // Estimated ~12% per annum on average progressive balance
    const interest = ((target * 0.12 * days) / 365) * 0.5;
    return interest.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) =>
    (new Date(year, month, 1).getDay() + 6) % 7;

  const renderCalendarGrid = () => {
    const month = calViewDate.getMonth();
    const year = calViewDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const days: React.ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={{ width: "14.28%" as any, aspectRatio: 1 }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);
      const isPast = cellDate <= today;
      const isSelected =
        endDate.getDate() === day &&
        endDate.getMonth() === month &&
        endDate.getFullYear() === year;

      days.push(
        <TouchableOpacity
          key={day}
          disabled={isPast}
          onPress={() => setEndDate(new Date(year, month, day))}
          style={{
            width: "14.28%" as any,
            aspectRatio: 1,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
            backgroundColor: isSelected ? "#155D5F" : "transparent",
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: isSelected ? "700" : "500",
              color: isSelected ? "#fff" : isPast ? "#D1D5DB" : "#323232",
            }}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          {dayNames.map((d) => (
            <Text
              key={d}
              style={{ width: "14.28%" as any, textAlign: "center", fontSize: 13, fontWeight: "600", color: "#6B7280" }}
            >
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{days}</View>
      </View>
    );
  };

  const renderMonthSelector = () => {
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 24, justifyContent: "space-between" }}>
        {MONTHS.map((m, idx) => {
          const isSelected = calViewDate.getMonth() === idx;
          return (
            <TouchableOpacity
              key={m}
              onPress={() => {
                const d = new Date(calViewDate);
                d.setMonth(idx);
                setCalViewDate(d);
                setCalMode("days");
              }}
              style={{
                width: "30%",
                paddingVertical: 14,
                marginBottom: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? "#155D5F" : "#F8F8F8",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? "700" : "600",
                  color: isSelected ? "#fff" : "#1A1A1A",
                }}
              >
                {m.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderYearSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear + i);

    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 24, justifyContent: "space-between" }}>
        {years.map((yr) => {
          const isSelected = calViewDate.getFullYear() === yr;
          return (
            <TouchableOpacity
              key={yr}
              onPress={() => {
                const d = new Date(calViewDate);
                d.setFullYear(yr);
                setCalViewDate(d);
                setCalMode("months");
              }}
              style={{
                width: "30%",
                paddingVertical: 14,
                marginBottom: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? "#155D5F" : "#F8F8F8",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? "700" : "600",
                  color: isSelected ? "#fff" : "#1A1A1A",
                }}
              >
                {yr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleContinue = () => {
    setIsNavigating(true);
    setTimeout(() => {
      if (step === "form") {
        setStep("preview");
      } else if (step === "preview") {
        setStep("pin");
      }
      setIsNavigating(false);
    }, 150);
  };

  const handleCreate = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Verify transaction PIN
      await verifyPin({ pin }).unwrap();

      // 2. Convert amounts from Naira to Kobo (integers)
      const targetAmountVal = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
      const targetAmountKobo = Math.round(targetAmountVal * 100);
      
      const autoSaveAmountVal = parseFloat(autoSaveAmount.replace(/[^\d.]/g, "")) || 0;
      const autoSaveAmountKobo = Math.round(autoSaveAmountVal * 100);
      
      const manualDepositVal = parseFloat(manualDepositAmount.replace(/[^\d.]/g, "")) || 0;
      const manualDepositKobo = Math.round(manualDepositVal * 100);

      const initialAmountKobo = isManual ? manualDepositKobo : autoSaveAmountKobo;

      const body: any = {
        name: goalName.trim(),
        amount: initialAmountKobo,
        targetAmount: targetAmountKobo,
        maturityDate: endDate.toISOString(),
        autoSaveEnabled: !isManual,
        autoSaveFrequency: (frequency ? frequency.toUpperCase() : "MONTHLY") as "DAILY" | "WEEKLY" | "MONTHLY",
        autoSaveAmount: isManual ? initialAmountKobo : autoSaveAmountKobo,
        autoSaveSource: "WALLET",
        nextAutoSaveDate: new Date(Date.now() + 86400000).toISOString(),
        metadata: {
          category: category.trim(),
          wealthPreference,
          fundingSource: "WALLET",
        },
      };

      console.log("🎯 [WealthGoal Create Request] Payload:\n", JSON.stringify(body, null, 2));

      const res: any = await createPortfolio({ type: "wealthgoal", body }).unwrap();
      console.log("✅ [WealthGoal Create Success] Response:\n", JSON.stringify(res, null, 2));

      if (res?.id) {
        setCreatedGoalId(res.id);
      }
      setStep("success");
    } catch (err: any) {
      console.error("❌ [WealthGoal Create Error] Full Error:\n", JSON.stringify(err, null, 2));
      const rawMsg = err?.data?.message;
      const errorMsg = Array.isArray(rawMsg)
        ? rawMsg.join(", ")
        : typeof rawMsg === "string"
        ? rawMsg
        : err?.data?.error || err?.message || "Failed to create WealthGoal. Please check your balance and try again.";
      
      if (typeof errorMsg === "string" && errorMsg.toLowerCase().includes("not set")) {
        Alert.alert(
          "Transaction PIN Required",
          "You have not set up a transaction PIN yet. Would you like to set one now to secure your investments?",
          [
            { text: "Set PIN Now", onPress: () => router.push("/profile/security/change-pin" as any) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert("Creation Failed", errorMsg);
      }
      setPin(""); // Clear invalid PIN
    } finally {
      setLoading(false);
    }
  }, [
    goalName,
    category,
    amount,
    autoSaveAmount,
    manualDepositAmount,
    endDate,
    isManual,
    frequency,
    wealthPreference,
    pin,
    verifyPin,
    createPortfolio,
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
            borderRadius: 15,
            backgroundColor: "#FFE6F2B2",
          }}
          className="p-5 mb-8 relative mt-4 self-center"
        >
          <TouchableOpacity
            className="absolute right-4 top-4 z-10"
            onPress={() => setShowRules(false)}
          >
            <Ionicons name="close" size={20} color="#F3007A" />
          </TouchableOpacity>
          <Text
            style={{ color: "#F3007A" }}
            className="font-extrabold text-[12px] mb-4"
          >
            Important "Need to Know" Rules
          </Text>
          <View className="space-y-4 gap-4">
            {wealthPreference === "Interest Based" && (
              <Text
                style={{ color: "#F3007A" }}
                className="text-[11px] leading-[16px]"
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
            )}
            <Text
              style={{ color: "#F3007A" }}
              className="text-[11px] leading-[16px]"
            >
              👉{" "}
              <Text
                style={{ color: "#F3007A" }}
                className="font-bold text-[12px]"
              >
                The 3% Breaking Fee:
              </Text>{" "}
              If you need to withdraw your money before the maturity date you
              set, a 3% penalty fee applies to ensure financial discipline.
            </Text>
            <Text
              style={{ color: "#F3007A" }}
              className="text-[11px] leading-[16px]"
            >
              👉{" "}
              <Text
                style={{ color: "#F3007A" }}
                className="font-bold text-[12px]"
              >
                Goal Completion:
              </Text>{" "}
              Reach at least 70% of your target amount by the end date
              to be considered successful.
            </Text>
          </View>
        </View>
      )}

      <View className="space-y-5 gap-5 mb-10">
        {/* Wealth Preference */}
        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Wealth Preference
          </Text>
          <View style={{ flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 4 }}>
            <TouchableOpacity 
              onPress={() => setWealthPreference("Interest Based")}
              style={{ flex: 1, backgroundColor: wealthPreference === "Interest Based" ? "#FFFFFF" : "transparent", paddingVertical: 12, borderRadius: 8, alignItems: "center", shadowColor: wealthPreference === "Interest Based" ? "#000" : "transparent", shadowOpacity: 0.1, shadowRadius: 2, elevation: wealthPreference === "Interest Based" ? 2 : 0 }}
            >
              <Text style={{ color: wealthPreference === "Interest Based" ? "#1A1A1A" : "#6B7280", fontWeight: wealthPreference === "Interest Based" ? "700" : "500", fontSize: 13 }}>Interest Based</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setWealthPreference("Impact Wealth")}
              style={{ flex: 1, backgroundColor: wealthPreference === "Impact Wealth" ? "#FFFFFF" : "transparent", paddingVertical: 12, borderRadius: 8, alignItems: "center", shadowColor: wealthPreference === "Impact Wealth" ? "#000" : "transparent", shadowOpacity: 0.1, shadowRadius: 2, elevation: wealthPreference === "Impact Wealth" ? 2 : 0 }}
            >
              <Text style={{ color: wealthPreference === "Impact Wealth" ? "#1A1A1A" : "#6B7280", fontWeight: wealthPreference === "Impact Wealth" ? "700" : "500", fontSize: 13 }}>Impact Wealth</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal Name */}
        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Wealth Goal Name
          </Text>
          <TextInput
            placeholder="e.g., 'Tuition fee,' 'New Laptop,' or 'Wedding'"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F3F4F6] p-4 rounded-xl text-[#1A1A1A] text-sm"
            value={goalName}
            onChangeText={setGoalName}
          />
        </View>

        {/* Category */}
        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Category
          </Text>
          <TextInput
            placeholder="Rent, Travel, Education, Business, etc."
            placeholderTextColor="#9CA3AF"
            className="bg-[#F3F4F6] p-4 rounded-xl text-[#1A1A1A] text-sm"
            value={category}
            onChangeText={setCategory}
          />
        </View>

        {/* Wealth Source */}
        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Funding Source
          </Text>
          <View className="bg-[#F3F4F6] p-4 rounded-xl flex-row justify-between items-center">
            <Text className="text-[#1A1A1A] font-medium text-sm">
              Main Wallet
            </Text>
          </View>
        </View>

        {/* Target Amount */}
        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Target Goal Amount (₦)
          </Text>
          <TextInput
            placeholder="₦0.00"
            placeholderTextColor="#9CA3AF"
            className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] font-bold text-base"
            keyboardType="numeric"
            value={amount ? `₦${amount}` : ""}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, "");
              const formatted = cleaned ? Number(cleaned).toLocaleString("en-NG") : "";
              setAmount(formatted);
            }}
          />
          {parseFloat(amount.replace(/[^\d.]/g, "")) > 0 &&
            parseFloat(amount.replace(/[^\d.]/g, "")) < 1000 && (
              <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" }}>
                Minimum target goal is ₦1,000.00
              </Text>
            )}
        </View>

        {/* Manual Switch */}
        <View className="flex-row justify-between items-center py-2">
          <View className="flex-1 mr-4">
            <Text className="text-[#1A1A1A] font-bold text-[12px]">
              Manual Savings
            </Text>
            <Text className="text-[#9CA3AF] text-[10px]">
              {isManual
                ? "You will manually top up whenever you wish."
                : "Automatic recurring debit enabled."}
            </Text>
          </View>
          <Switch
            value={isManual}
            onValueChange={setIsManual}
            trackColor={{ false: "#D1D5DB", true: "#155D5F" }}
            ios_backgroundColor="#D1D5DB"
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Starting Deposit (when manual savings is ON) */}
        {isManual && (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text className="text-[#1A1A1A] font-bold text-[12px]">
                Starting Deposit (₦)
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: "#6B7280", fontSize: 11, fontWeight: "500" }}>
                  Wallet:{" "}
                  <Text style={{ color: "#1A1A1A", fontWeight: "700" }}>
                    ₦{walletBalanceNaira.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/wallet/deposit" as any)}
                  style={{
                    backgroundColor: "#EEF6F6",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#155D5F", fontSize: 10, fontWeight: "700" }}>
                    + Fund
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              placeholder="₦1,000.00"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] font-bold text-base"
              keyboardType="numeric"
              value={manualDepositAmount ? `₦${manualDepositAmount}` : ""}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, "");
                const formatted = cleaned ? Number(cleaned).toLocaleString("en-NG") : "";
                setManualDepositAmount(formatted);
              }}
              style={{
                borderWidth: (parseFloat(manualDepositAmount.replace(/[^\d.]/g, "")) || 0) > walletBalanceNaira ? 1 : 0,
                borderColor: (parseFloat(manualDepositAmount.replace(/[^\d.]/g, "")) || 0) > walletBalanceNaira ? "#EF4444" : "transparent",
              }}
            />
            {(() => {
              const depositVal = parseFloat(manualDepositAmount.replace(/[^\d.]/g, "")) || 0;
              const targetVal = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
              if (depositVal > walletBalanceNaira) {
                return (
                  <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" }}>
                    ⚠️ Insufficient wallet balance. Fund your wallet or enter a lower starting amount.
                  </Text>
                );
              }
              if (depositVal > targetVal && targetVal > 0) {
                return (
                  <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" }}>
                    Starting deposit cannot exceed target goal amount.
                  </Text>
                );
              }
              if (depositVal > 0 && depositVal < 100) {
                return (
                  <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" }}>
                    Minimum starting deposit is ₦100.00
                  </Text>
                );
              }
              return (
                <Text className="text-[#9CA3AF] text-[10px] mt-1">
                  Initial amount debited from your wallet today to kickstart your savings goal.
                </Text>
              );
            })()}
          </View>
        )}

        {/* AutoSave Settings (only when NOT manual) */}
        {!isManual && (
          <>
            <View>
              <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
                Auto-Debit Frequency
              </Text>
              <TouchableOpacity
                onPress={() => setShowFreqDropdown(!showFreqDropdown)}
                className="bg-[#F8F8F8] p-4 rounded-xl flex-row justify-between items-center"
              >
                <Text className="text-[#1A1A1A] font-medium">
                  {frequency}
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

            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text className="text-[#1A1A1A] font-bold text-[12px]">
                  Auto-Save Amount (₦)
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: "#6B7280", fontSize: 11, fontWeight: "500" }}>
                    Wallet:{" "}
                    <Text style={{ color: "#1A1A1A", fontWeight: "700" }}>
                      ₦{walletBalanceNaira.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/wallet/deposit" as any)}
                    style={{
                      backgroundColor: "#EEF6F6",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#155D5F", fontSize: 10, fontWeight: "700" }}>
                      + Fund
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                placeholder="₦0.00"
                placeholderTextColor="#9CA3AF"
                className="bg-[#F8F8F8] p-4 rounded-xl text-[#1A1A1A] font-bold text-base"
                keyboardType="numeric"
                value={autoSaveAmount ? `₦${autoSaveAmount}` : ""}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  const formatted = cleaned ? Number(cleaned).toLocaleString("en-NG") : "";
                  setAutoSaveAmount(formatted);
                }}
                style={{
                  borderWidth: (parseFloat(autoSaveAmount.replace(/[^\d.]/g, "")) || 0) > walletBalanceNaira ? 1 : 0,
                  borderColor: (parseFloat(autoSaveAmount.replace(/[^\d.]/g, "")) || 0) > walletBalanceNaira ? "#EF4444" : "transparent",
                }}
              />
              {(() => {
                const targetVal = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
                const autoVal = parseFloat(autoSaveAmount.replace(/[^\d.]/g, "")) || 0;
                if (autoVal > walletBalanceNaira) {
                  return (
                    <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" }}>
                      ⚠️ Insufficient wallet balance for initial auto-save deduction.
                    </Text>
                  );
                }
                if (autoVal > targetVal && targetVal > 0) {
                  return (
                    <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 4, fontWeight: "500" }}>
                      Auto-save cannot exceed target goal amount.
                    </Text>
                  );
                }
                if (calculateRecommendedSaving()) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const rec = calculateRecommendedSaving();
                        if (rec) {
                          const numOnly = rec.split(" ")[0].replace(/[^\d.]/g, "");
                          setAutoSaveAmount(Number(numOnly).toLocaleString("en-NG"));
                        }
                      }}
                      style={{ marginTop: 6 }}
                    >
                      <Text style={{ color: "#0B575B", fontSize: 11, fontWeight: "600" }}>
                        💡 Recommended: {calculateRecommendedSaving()?.split(" (")[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <Text className="text-[#9CA3AF] text-[10px] mt-1">
                    First amount debited today, then automatically deducted {frequency.toLowerCase()}.
                  </Text>
                );
              })()}
            </View>
          </>
        )}

        {/* End Date Picker */}
        <View>
          <Text className="text-[#1A1A1A] font-bold text-[12px] mb-2">
            Target End Date
          </Text>
          <TouchableOpacity
            onPress={() => {
              setCalViewDate(new Date(endDate));
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}
            className="bg-[#F3F4F6] p-4 rounded-xl flex-row justify-between items-center"
          >
            <Text className="text-[#1A1A1A] font-medium text-sm">
              {endDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#155D5F" />
          </TouchableOpacity>
          <Text className="text-[#9CA3AF] text-[10px] mt-1.5 italic">
            Note: To earn the full interest, you must meet your target amount
            and reach this date
          </Text>
        </View>
      </View>

      {/* Custom Calendar Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={{ backgroundColor: "white", borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 }}>
                {/* Handle bar */}
                <View style={{ width: 80, height: 6, backgroundColor: "#BABABA", borderRadius: 999, alignSelf: "center", marginBottom: 24 }} />
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#323232", marginBottom: 20 }}>
                  Pick End Date
                </Text>

                {/* Month & Year Navigation Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setCalMode(calMode === "months" ? "days" : "months")}
                      style={{
                        backgroundColor: calMode === "months" ? "#EEF6F6" : "#F3F4F6",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: calMode === "months" ? "#155D5F" : "transparent",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>
                        {MONTHS[calViewDate.getMonth()]}
                      </Text>
                      <Ionicons name={calMode === "months" ? "chevron-up" : "chevron-down"} size={14} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setCalMode(calMode === "years" ? "days" : "years")}
                      style={{
                        backgroundColor: calMode === "years" ? "#EEF6F6" : "#F3F4F6",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: calMode === "years" ? "#155D5F" : "transparent",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A" }}>
                        {calViewDate.getFullYear()}
                      </Text>
                      <Ionicons name={calMode === "years" ? "chevron-up" : "chevron-down"} size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {calMode === "days" && (
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => {
                          const d = new Date(calViewDate);
                          d.setMonth(d.getMonth() - 1);
                          setCalViewDate(d);
                        }}
                        style={{ padding: 6, backgroundColor: "#F3F4F6", borderRadius: 8 }}
                      >
                        <Ionicons name="chevron-back" size={18} color="#323232" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          const d = new Date(calViewDate);
                          d.setMonth(d.getMonth() + 1);
                          setCalViewDate(d);
                        }}
                        style={{ padding: 6, backgroundColor: "#F3F4F6", borderRadius: 8 }}
                      >
                        <Ionicons name="chevron-forward" size={18} color="#323232" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {calMode === "days" && renderCalendarGrid()}
                {calMode === "months" && renderMonthSelector()}
                {calMode === "years" && renderYearSelector()}

                <TouchableOpacity
                  style={{ backgroundColor: "#155D5F", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" }}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Confirm</Text>
                </TouchableOpacity>
              </View>
        </View>
      </Modal>

      {(() => {
        const targetVal = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
        const autoSaveVal = parseFloat(autoSaveAmount.replace(/[^\d.]/g, "")) || 0;
        const manualDepositVal = parseFloat(manualDepositAmount.replace(/[^\d.]/g, "")) || 0;
        const isTargetValid = targetVal >= 1000;
        const isAutoSaveValid = !isManual && autoSaveVal >= 100 && autoSaveVal <= targetVal && autoSaveVal <= walletBalanceNaira;
        const isManualDepositValid = isManual && manualDepositVal >= 100 && manualDepositVal <= targetVal && manualDepositVal <= walletBalanceNaira;
        const isFormValid =
          goalName.trim().length > 0 &&
          category.trim().length > 0 &&
          isTargetValid &&
          (isManual ? isManualDepositValid : isAutoSaveValid);
        
        return (
          <ThemedButton
            title="Continue"
            onPress={handleContinue}
            loading={isNavigating}
            disabled={!isFormValid || isNavigating}
            style={{ opacity: !isFormValid || isNavigating ? 0.5 : 1 }}
            className="mb-10"
          />
        );
      })()}
    </View>
  );

  const renderPreview = () => {
    const formattedEndDate = endDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <View className="px-5">
        <Text className="text-[#6B7280] text-[13px] mb-8 mt-4">
          Please, recheck and confirm before creating your goal.
        </Text>

        <View
          className="bg-[#F6F6F6] p-8 rounded-t-[24px] relative self-center"
          style={{
            width: 365,
            minHeight: 310,
            borderColor: "#fefcfc40",
            borderWidth: 0.8,
            borderBottomWidth: 0,
          }}
        >
          {/* Row 1 */}
          <View className="flex-row justify-between mb-8">
            <View>
              <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
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
                {category || "General"}
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row justify-between mb-8">
            <View>
              <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                Funding Source
              </Text>
              <Text className="text-[#1A1A1A] font-bold text-[16px]">
                Main Wallet
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                End Date
              </Text>
              <Text className="text-[#1A1A1A] font-bold text-[16px]">
                {formattedEndDate}
              </Text>
            </View>
          </View>

          {/* Row 3 */}
          <View className="flex-row justify-between mb-8">
            <View>
              <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                {wealthPreference === "Interest Based" ? "Interest Rate" : "Preference"}
              </Text>
              <Text className="text-[#1A1A1A] font-bold text-[16px]">
                {wealthPreference === "Interest Based" ? "12% P.A" : "Impact Wealth"}
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

          {/* Row 4: Debit Today */}
          <View className="flex-row justify-between mb-2">
            <View>
              <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                Debit Today
              </Text>
              <Text style={{ color: "#155D5F", fontWeight: "700", fontSize: 16 }}>
                ₦{formatAmount(isManual ? manualDepositAmount : autoSaveAmount)}
              </Text>
            </View>
            {!isManual ? (
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Auto-Debit Schedule
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  ₦{formatAmount(autoSaveAmount)} / {frequency}
                </Text>
              </View>
            ) : (
              <View className="items-end">
                <Text className="text-[#6B7280] text-[11px] mb-2 font-medium">
                  Deposit Type
                </Text>
                <Text className="text-[#1A1A1A] font-bold text-[16px]">
                  Initial Deposit
                </Text>
              </View>
            )}
          </View>

          {/* Jagged Edge */}
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
          loading={isNavigating}
          disabled={isNavigating}
          className="mt-14"
        />
      </View>
    );
  };

  const renderPin = () => (
    <View className="items-center px-5 mt-10">
      <Image
        source={require("../../../assets/images/change-pin.png")}
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
          source={require("../../../assets/images/success.png")}
          style={{ width: 280, height: 280, opacity: 0.3 }}
          resizeMode="contain"
        />
        <Image
          source={require("../../../assets/images/setgoal.png")}
          style={{ width: 160, height: 160, position: "absolute" }}
          resizeMode="contain"
        />
      </View>

      <Text className="text-[#1A1A1A] font-extrabold text-[26px] text-center mb-4 leading-[32px]">
        You have set a Wealth Goal🥳🎯
      </Text>

      <Text className="text-[#6B7280] text-center text-[14px] leading-[22px] mb-8 px-2">
        Congratulations, WealthBuilder! Your WealthGoal has been created and funded successfully. Your savings journey towards your target has begun!🥳{"\n\n"}
        <Text className="font-bold text-[#1A1A1A]">
          Target Goal: ₦{formatAmount(amount)}{"\n"}
          Starting Balance: ₦{formatAmount(isManual ? manualDepositAmount : autoSaveAmount)}
        </Text>
      </Text>

      <View style={{ width: "100%", gap: 12 }}>
        <ThemedButton
          title="View Goal Details"
          onPress={() => {
            if (createdGoalId) {
              router.replace({
                pathname: "/portfolio/detail/goal/[id]",
                params: { id: createdGoalId },
              });
            } else {
              router.replace("/(tabs)/portfolios/wealth-goal" as any);
            }
          }}
          style={{ backgroundColor: "#155D5F" }}
        />
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/portfolios/wealth-goal" as any)}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#4B5563", fontWeight: "700", fontSize: 15 }}>
            Back to Goals
          </Text>
        </TouchableOpacity>
      </View>
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
