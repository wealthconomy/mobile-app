import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { useCreatePortfolioMutation } from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { useGetWalletSummaryQuery } from "@/src/store/api/walletApi";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#0B575B";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DURATION_PRESETS = [
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
  { label: "2 Years", days: 730 },
];

export default function CreateFixScreen() {
  const params = useLocalSearchParams<{
    amount: string;
    duration: string;
    lockType: string;
  }>();
  const [step, setStep] = useState<"form" | "preview" | "pin" | "success">(
    "form",
  );
  const [title, setTitle] = useState("");
  const [initialAmount, setInitialAmount] = useState(params.amount || "");
  const [duration, setDuration] = useState(params.duration || "");
  const [lockType] = useState(params.lockType || "WealthFix");
  const [showInterestCard, setShowInterestCard] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
  const [agreedPenalty, setAgreedPenalty] = useState(false);
  const [acknowledgedTemptation, setAcknowledgedTemptation] = useState(false);
  const [wealthPreference, setWealthPreference] = useState<"Interest Based" | "Impact Wealth">("Interest Based");
  const [isNavigating, setIsNavigating] = useState(false);

  // RTK Query
  const [createPortfolio, { isLoading: isCreating }] = useCreatePortfolioMutation();
  const [verifyPin, { isLoading: isVerifyingPin }] = useVerifyPinMutation();
  const loading = isCreating || isVerifyingPin;

  // Wallet Query & Balance
  const { data: walletData, refetch: refetchWallet } = useGetWalletSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetchWallet();
    }, [refetchWallet])
  );

  const walletBalanceNaira = (parseFloat(walletData?.currentBalance || "0") / 100);
  const enteredAmountNum = parseFloat(initialAmount.replace(/[^\d.]/g, "")) || 0;
  const isInsufficientBalance = enteredAmountNum > walletBalanceNaira && enteredAmountNum > 0;

  // Date picker state
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    if (params.duration) {
      d.setDate(d.getDate() + (parseInt(params.duration, 10) || 180));
    } else {
      d.setDate(d.getDate() + 180);
    }
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calMode, setCalMode] = useState<"days" | "months" | "years">("days");
  const [calViewDate, setCalViewDate] = useState<Date>(() => {
    const d = new Date();
    if (params.duration) {
      d.setDate(d.getDate() + (parseInt(params.duration, 10) || 180));
    } else {
      d.setDate(d.getDate() + 180);
    }
    return d;
  });

  // PIN state
  const [pin, setPin] = useState("");
  const pinInputRef = useRef<TextInput>(null);

  const formatAmount = (val: string) => {
    if (!val) return "0.00";
    const num = val.replace(/,/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateInterest = () => {
    const amt = parseFloat(initialAmount.replace(/,/g, "")) || 0;
    const dur = parseInt(duration) || 0;
    return ((amt * 0.1 * dur) / 365).toFixed(2);
  };

  const selectDurationDays = (days: number) => {
    setDuration(days.toString());
    const target = new Date();
    target.setDate(target.getDate() + days);
    setEndDate(target);
    setCalViewDate(target);
    setShowDatePicker(false);
  };

  const selectCalendarDate = (date: Date) => {
    setEndDate(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    setDuration(diffDays.toString());
    setShowDatePicker(false);
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
        duration !== "" &&
        endDate.getDate() === day &&
        endDate.getMonth() === month &&
        endDate.getFullYear() === year;

      days.push(
        <TouchableOpacity
          key={day}
          disabled={isPast}
          onPress={() => selectCalendarDate(new Date(year, month, day))}
          style={{
            width: "14.28%" as any,
            aspectRatio: 1,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
            backgroundColor: isSelected ? TEAL : "transparent",
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
                backgroundColor: isSelected ? TEAL : "#F8F8F8",
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
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

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
                backgroundColor: isSelected ? TEAL : "#F8F8F8",
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

  // ─── FORM STEP ───────────────────────────────────────────────────────────────
  const renderFormStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      {/* Header text */}
      <View className="mb-6 mt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#1A1A1A] font-bold text-[24px]">
            {lockType === "WealthFix" ? "Create a WealthFix" : lockType}
          </Text>
          {wealthPreference === "Interest Based" && (
            <View
              style={{
                backgroundColor: "#FFF9EC",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#AB7600", fontSize: 10, fontWeight: "700" }}>
                Earn ₦{formatAmount(calculateInterest())}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-[#6B7280] text-[13px] mt-1">
          {lockType === "WealthFix"
            ? "Edit and setup your WealthFix"
            : `Lock ₦${formatAmount(initialAmount)} for ${duration} days`}
        </Text>
      </View>

      {/* How Interest Works Card */}
      {showInterestCard && wealthPreference === "Interest Based" && (
        <View
          style={{
            backgroundColor: "#FFF9EC",
            borderRadius: 16,
            padding: 16,
            marginBottom: 28,
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", right: 12, top: 12, zIndex: 10 }}
            onPress={() => setShowInterestCard(false)}
          >
            <Ionicons name="close" size={18} color="#D48E00" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#D48E00",
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            How the Interest Works
          </Text>
          <Text
            style={{
              color: "#D48E00",
              fontSize: 11,
              opacity: 0.85,
              lineHeight: 17,
            }}
          >
            SafeLock is unique because the interest is paid upfront.{"\n\n"}
            <Text style={{ fontWeight: "700" }}>Calculation:</Text> The interest
            is calculated based on how long you lock the funds.{"\n"}•{" "}
            <Text style={{ fontWeight: "700" }}>Short term (10–90 days):</Text>{" "}
            Lower rates (around 6%–9% p.a.).{"\n"}•{" "}
            <Text style={{ fontWeight: "700" }}>Long term (1–3 years):</Text>{" "}
            Higher rates (currently up to 20%–22% per annum).{"\n\n"}
            <Text style={{ fontWeight: "700" }}>Payment:</Text> As soon as you
            create the Wealth Fix, the interest is immediately credited to your
            Wealthconomy wallet, while the "capital" remains locked until the
            maturity date.{"\n\n"}⚠️{" "}
            <Text style={{ fontWeight: "700" }}>The "No-Break" Rule:</Text> It
            is critical to know that Wealthconomy cannot be broken. Unlike
            "Wealth Flex or Wealth Goal" where you can pay a penalty fee to get
            your money early, a Wealth Fix is legally and technically locked
            until the end date. You should only use this for money you are 100%
            sure you won't need until the date you set.
          </Text>
        </View>
      )}

      {/* Wealth Preference Selector */}
      <View style={{ marginBottom: 18 }}>
        <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 8 }}>
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

      {/* Title field */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Title
        </Text>
        <View
          style={{
            backgroundColor: "#F3F4F6",
            height: 56,
            borderRadius: 12,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <TextInput
            placeholder='e.g., "September Rent" or "Emergency Backup"'
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            style={{ fontSize: 14, color: "#1A1A1A" }}
          />
        </View>
      </View>

      {/* Target Amount */}
      <View style={{ marginBottom: 18 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#1A1A1A",
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            {lockType === "WealthFix" ? "Target Amount" : "Amount To Fix"}
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
                backgroundColor: "#E6F4F4",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: TEAL, fontSize: 10, fontWeight: "700" }}>
                + Fund
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "#F3F4F6",
            height: 56,
            borderRadius: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: isInsufficientBalance ? 1 : 0,
            borderColor: isInsufficientBalance ? "#EF4444" : "transparent",
          }}
        >
          <Text
            style={{
              color: "#1A1A1A",
              fontWeight: "700",
              fontSize: 15,
              opacity: 0.5,
              marginRight: 4,
            }}
          >
            ₦
          </Text>
          <TextInput
            placeholder="3,500,000.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={initialAmount}
            onChangeText={(val) => {
              const n = val.replace(/\D/g, "");
              setInitialAmount(
                n ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "",
              );
            }}
            style={{
              flex: 1,
              fontSize: 15,
              color: "#1A1A1A",
              fontWeight: "700",
            }}
          />
        </View>
        {isInsufficientBalance && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 6,
              backgroundColor: "#FEF2F2",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#FEE2E2",
            }}
          >
            <Text
              style={{
                color: "#DC2626",
                fontSize: 11,
                fontWeight: "600",
                flex: 1,
                marginRight: 8,
              }}
            >
              ⚠️ Insufficient wallet balance. Fund your wallet to fix this amount.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/wallet/deposit" as any)}
              style={{
                backgroundColor: "#DC2626",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                Fund Wallet
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* End Date */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          End Date
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (duration) {
              const d = new Date();
              d.setDate(d.getDate() + (parseInt(duration, 10) || 180));
              setCalViewDate(d);
            } else {
              setCalViewDate(new Date());
            }
            setShowDatePicker(true);
          }}
          activeOpacity={0.7}
          style={{
            backgroundColor: "#F3F4F6",
            height: 56,
            borderRadius: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: duration ? "#1A1A1A" : "#9CA3AF",
              fontSize: 14,
              fontWeight: duration ? "600" : "400",
            }}
          >
            {duration
              ? `${endDate.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} (${duration} days)`
              : "Select end date or duration"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={TEAL} />
        </TouchableOpacity>
      </View>

      {/* Funding Source (Read-only) */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Funding Source
        </Text>
        <View
          style={{
            backgroundColor: "#F3F4F6",
            height: 56,
            borderRadius: 12,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#1A1A1A", fontSize: 14, fontWeight: "600" }}>
            Main Wallet
          </Text>
        </View>
      </View>

      {/* Manual Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              color: "#1A1A1A",
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Manual
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 11, lineHeight: 16 }}>
            "Top Up" whenever you have spare cash (no automation)
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsManual(!isManual)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: isManual ? TEAL : "#D1D5DB",
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "white",
              position: "absolute",
              top: 2,
              left: isManual ? 22 : 2,
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Consent Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              color: "#1A1A1A",
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Consent
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 11, lineHeight: 16 }}>
            You must check a box agreeing that you cannot break the lock once it
            is created.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsConsent(!isConsent)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: isConsent ? TEAL : "#D1D5DB",
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "white",
              position: "absolute",
              top: 2,
              left: isConsent ? 22 : 2,
            }}
          />
        </TouchableOpacity>
      </View>

      {(() => {
        const isFormValid =
          title.trim().length > 0 &&
          enteredAmountNum > 0 &&
          !isInsufficientBalance &&
          Boolean(duration) &&
          isConsent;
        return (
          <ThemedButton
            title="Preview Fix"
            onPress={() => {
              setIsNavigating(true);
              setTimeout(() => {
                setStep("preview");
                setIsNavigating(false);
              }, 150);
            }}
            loading={isNavigating}
            disabled={!isFormValid || isNavigating}
            style={{
              backgroundColor: TEAL,
              borderRadius: 14,
              height: 56,
              marginBottom: 40,
              opacity: !isFormValid || isNavigating ? 0.45 : 1,
            }}
          />
        );
      })()}
    </ScrollView>
  );

  // ─── PREVIEW STEP ─────────────────────────────────────────────────────────────
  const renderPreviewStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      <View style={{ marginBottom: 20, marginTop: 4 }}>
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "700",
            fontSize: 24,
            marginBottom: 4,
          }}
        >
          WealthFix Preview 🔒
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 13 }}>
          {lockType}: ₦{formatAmount(initialAmount)} for {duration} days
        </Text>
      </View>

      {/* Ticket card */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#F9F9F9",
          borderRadius: 24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: 28,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: "#EEEEEE",
          marginBottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <View>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 6,
                fontWeight: "500",
              }}
            >
              Amount To Fix
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              ₦{formatAmount(initialAmount)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 6,
                fontWeight: "500",
              }}
            >
              Lock Duration
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {duration} days
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <View>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 6,
                fontWeight: "500",
              }}
            >
              {wealthPreference === "Interest Based" ? "Interest Rate" : "Preference"}
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {wealthPreference === "Interest Based" ? "12% P.A" : "Impact Wealth"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 6,
                fontWeight: "500",
              }}
            >
              End Date
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <View>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 11,
                marginBottom: 6,
                fontWeight: "500",
              }}
            >
              Funding Source
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              Main Wallet
            </Text>
          </View>
          {wealthPreference === "Interest Based" && (
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "#6B7280",
                  fontSize: 11,
                  marginBottom: 6,
                  fontWeight: "500",
                }}
              >
                Estimated Return
              </Text>
              <Text style={{ color: TEAL, fontWeight: "700", fontSize: 16 }}>
                +₦{formatAmount(calculateInterest())}
              </Text>
            </View>
          )}
        </View>

        {/* Jagged Edge */}
        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            bottom: -10,
            left: 0,
            right: 0,
            overflow: "hidden",
          }}
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
                borderLeftWidth: 1,
                borderTopWidth: 1,
                borderColor: "#EEEEEE",
              }}
            />
          ))}
        </View>
      </View>

      <View
        style={{ height: 1, backgroundColor: "#EEEEEE", marginBottom: 28 }}
      />

      {/* Agreement Checkboxes */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
        activeOpacity={0.8}
        onPress={() => setAgreedPenalty(!agreedPenalty)}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1.5,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 2,
            borderColor: agreedPenalty ? TEAL : "#D1D5DB",
            backgroundColor: agreedPenalty ? TEAL : "white",
          }}
        >
          {agreedPenalty && <Check size={13} color="white" />}
        </View>
        <Text
          style={{ flex: 1, color: "#6B7280", fontSize: 12, lineHeight: 18 }}
        >
          You must agree that early withdrawal from a Wealth Fix is discouraged
          and will attract a penalty to ensure financial discipline.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 36,
        }}
        activeOpacity={0.8}
        onPress={() => setAcknowledgedTemptation(!acknowledgedTemptation)}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1.5,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 2,
            borderColor: acknowledgedTemptation ? TEAL : "#D1D5DB",
            backgroundColor: acknowledgedTemptation ? TEAL : "white",
          }}
        >
          {acknowledgedTemptation && <Check size={13} color="white" />}
        </View>
        <Text
          style={{ flex: 1, color: "#6B7280", fontSize: 12, lineHeight: 18 }}
        >
          You must also acknowledge that the lock feature is designed to "block
          temptation," and breaking the lock undermines their wealth-building
          goal.
        </Text>
      </TouchableOpacity>

      <ThemedButton
        title="Lock Wealth"
        onPress={() => {
          setIsNavigating(true);
          setTimeout(() => {
            setStep("pin");
            setIsNavigating(false);
          }, 150);
        }}
        loading={isNavigating}
        disabled={!agreedPenalty || !acknowledgedTemptation || isNavigating}
        style={{
          backgroundColor: TEAL,
          borderRadius: 14,
          height: 56,
          marginBottom: 40,
          opacity: !agreedPenalty || !acknowledgedTemptation || isNavigating ? 0.45 : 1,
        }}
      />
    </ScrollView>
  );

  const handleCreate = async () => {
    if (pin.length !== 4) return;
    try {
      await verifyPin({ pin }).unwrap();

      const amtNum = parseFloat(initialAmount.replace(/[^\d.]/g, "")) || 0;
      const amtKobo = Math.max(amtNum * 100, 100);
      const durDays = parseInt(duration, 10) || 30;
      const maturity = new Date(endDate);

      const body = {
        name: title.trim() || "WealthFix",
        amount: amtKobo,
        targetAmount: amtKobo,
        maturityDate: maturity.toISOString(),
        autoSaveEnabled: false,
        autoSaveSource: "WALLET" as const,
        pin,
        metadata: {
          durationDays: durDays,
          fundingSource: "WALLET",
          wealthPreference,
        },
      };

      await createPortfolio({ type: "wealthfix", body }).unwrap();
      setStep("success");
    } catch (err: any) {
      console.error("Failed to create fix portfolio:", err);
      const rawMsg = err?.data?.message;
      const errorMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg || err?.message || "Verification Failed";
      if (typeof errorMsg === "string" && errorMsg.toLowerCase().includes("not set")) {
        Alert.alert(
          "Transaction PIN Required",
          "You have not set up a transaction PIN yet. Would you like to set one now?",
          [
            { text: "Set PIN Now", onPress: () => router.push("/profile/security/change-pin" as any) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert("Failed", errorMsg);
      }
      setPin("");
    }
  };

  useEffect(() => {
    if (pin.length === 4 && step === "pin") {
      handleCreate();
    }
  }, [pin, step]);

  // ─── PIN STEP ─────────────────────────────────────────────────────────────────
  const renderPinStep = () => (
    <View
      style={{ alignItems: "center", paddingHorizontal: 24, marginTop: 24 }}
    >
      <Image
        source={require("../../../assets/images/change-pin.png")}
        style={{ width: 90, height: 90, marginBottom: 20 }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: "#1A1A1A",
          marginBottom: 8,
        }}
      >
        Insert your Pin
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#6B7280",
          textAlign: "center",
          marginBottom: 40,
          lineHeight: 20,
          paddingHorizontal: 16,
        }}
      >
        You must insert your pin to confirm to completely create your Wealth Fix
      </Text>

      {/* PIN boxes — tap to open phone keyboard */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => pinInputRef.current?.focus()}
        style={{ flexDirection: "row", gap: 16, marginBottom: 40 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              backgroundColor: "#F8F8F8",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#E5E5E5",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A" }}>
              {pin[i] ? "●" : ""}
            </Text>
          </View>
        ))}
      </TouchableOpacity>

      {/* Hidden native input */}
      <TextInput
        ref={pinInputRef}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        value={pin}
        onChangeText={(val) => {
          const numeric = val.replace(/\D/g, "").slice(0, 4);
          setPin(numeric);
        }}
        maxLength={4}
        keyboardType="numeric"
        autoFocus
      />

      {loading && (
        <View style={{ marginBottom: 20 }}>
          <ActivityIndicator color={TEAL} size="large" />
        </View>
      )}

      <View style={{ marginBottom: 40, paddingHorizontal: 16 }}>
        <Text
          style={{
            color: "#6B7280",
            textAlign: "center",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          If you have forgotten your pin, change it from your settings page
        </Text>
      </View>

      <TouchableOpacity
        style={{ alignItems: "center", marginBottom: 40 }}
        onPress={() => setStep("success")}
      >
        <Ionicons name="finger-print" size={36} color={TEAL} />
        <Text
          style={{ color: TEAL, fontWeight: "700", fontSize: 14, marginTop: 8 }}
        >
          Use fingerprint
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── SUCCESS STEP ─────────────────────────────────────────────────────────────
  const renderSuccessStep = () => (
    <View
      style={{ alignItems: "center", paddingHorizontal: 24, marginTop: 40 }}
    >
      {/* success.png as large faded background, fix3.png centered on top */}
      <View
        style={{
          width: 280,
          height: 280,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Image
          source={require("../../../assets/images/success.png")}
          style={{
            width: 280,
            height: 280,
            position: "absolute",
            opacity: 0.3,
          }}
          resizeMode="contain"
        />
        <Image
          source={require("../../../assets/images/fix3.png")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          fontSize: 26,
          fontWeight: "800",
          color: "#1A1A1A",
          textAlign: "center",
          marginBottom: 16,
          lineHeight: 34,
        }}
      >
        Wealth Fixed{"\n"}Successfully 🔒
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 13,
          textAlign: "center",
          lineHeight: 21,
          marginBottom: 48,
          paddingHorizontal: 8,
        }}
      >
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          Congratulations, WealthBuilder!
        </Text>{" "}
        You've successfully locked{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          ₦{formatAmount(initialAmount)}
        </Text>{" "}
        until{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          [24th Dec 2026]
        </Text>
        .{"\n\n"}You've successfully blocked temptation and set your money on a
        path to grow by{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          (₦{formatAmount(calculateInterest())})
        </Text>
        . It's a win for your future self!
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/portfolios/wealth-fix")}
        style={{
          backgroundColor: TEAL,
          height: 56,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginBottom: 40,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          Close
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="WealthFix"
        onBack={() => {
          if (step === "preview") setStep("form");
          else if (step === "pin") setStep("preview");
          else router.back();
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {step === "form" && renderFormStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "pin" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {renderPinStep()}
          </ScrollView>
        )}
        {step === "success" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {renderSuccessStep()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

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
          <View
                style={{
                  backgroundColor: "white",
                  borderTopLeftRadius: 36,
                  borderTopRightRadius: 36,
                  paddingHorizontal: 24,
                  paddingBottom: 48,
                  paddingTop: 12,
                  maxHeight: "85%",
                }}
              >
                {/* Handle bar */}
                <View
                  style={{
                    width: 80,
                    height: 6,
                    backgroundColor: "#BABABA",
                    borderRadius: 999,
                    alignSelf: "center",
                    marginBottom: 20,
                  }}
                />

                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#1A1A1A",
                    marginBottom: 16,
                  }}
                >
                  Select Lock Maturity
                </Text>

                {/* Quick Presets */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    Quick Durations
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {DURATION_PRESETS.map((p) => {
                      const isSelected = duration === p.days.toString();
                      return (
                        <TouchableOpacity
                          key={p.days}
                          onPress={() => selectDurationDays(p.days)}
                          style={{
                            backgroundColor: isSelected ? TEAL : "#F3F4F6",
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 20,
                          }}
                        >
                          <Text
                            style={{
                              color: isSelected ? "#fff" : "#1A1A1A",
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Month & Year Navigation Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setCalMode(calMode === "months" ? "days" : "months")}
                      style={{
                        backgroundColor: calMode === "months" ? "#EEF6F6" : "#F3F4F6",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: calMode === "months" ? TEAL : "#1A1A1A",
                          fontWeight: "700",
                          fontSize: 14,
                        }}
                      >
                        {MONTHS[calViewDate.getMonth()]}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCalMode(calMode === "years" ? "days" : "years")}
                      style={{
                        backgroundColor: calMode === "years" ? "#EEF6F6" : "#F3F4F6",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: calMode === "years" ? TEAL : "#1A1A1A",
                          fontWeight: "700",
                          fontSize: 14,
                        }}
                      >
                        {calViewDate.getFullYear()}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: "row", gap: 4 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const d = new Date(calViewDate);
                        if (calMode === "years") {
                          d.setFullYear(d.getFullYear() - 10);
                        } else if (calMode === "months") {
                          d.setFullYear(d.getFullYear() - 1);
                        } else {
                          d.setMonth(d.getMonth() - 1);
                        }
                        setCalViewDate(d);
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const d = new Date(calViewDate);
                        if (calMode === "years") {
                          d.setFullYear(d.getFullYear() + 10);
                        } else if (calMode === "months") {
                          d.setFullYear(d.getFullYear() + 1);
                        } else {
                          d.setMonth(d.getMonth() + 1);
                        }
                        setCalViewDate(d);
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="chevron-forward" size={18} color="#1A1A1A" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Calendar View Body */}
                {calMode === "days" && renderCalendarGrid()}
                {calMode === "months" && renderMonthSelector()}
                {calMode === "years" && renderYearSelector()}

                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={{
                    backgroundColor: "#F3F4F6",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#4B5563", fontWeight: "700", fontSize: 14 }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
