import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { useCreatePortfolioMutation } from "@/src/store/api/portfolioApi";
import { useVerifyPinMutation } from "@/src/store/api/userApi";
import { CreatePortfolioRequest } from "@/src/types/portfolio";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#0B575B";
const TEAL_LIGHT = "#E0F2F1";
const TEXT_DARK = "#1A1A1A";

const SOURCES = ["Wealth Save", "Wealth Flex", "Bank Account"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

export default function CreateFlowScreen() {
  const params = useLocalSearchParams<{
    category: string;
    amount: string;
    frequency: string;
    title: string;
  }>();

  const isRecommendation = !!params.category;

  const [step, setStep] = useState<"form" | "preview" | "pin" | "success">(
    "form",
  );
  const [showInfoCard, setShowInfoCard] = useState(true);

  // Form state
  const [wealthTitle, setWealthTitle] = useState(params.title || "");
  const [targetAmount, setTargetAmount] = useState(params.amount || "");
  const [initialDeposit, setInitialDeposit] = useState("1,000");
  const [frequency, setFrequency] = useState(params.frequency || "Monthly");
  const [isManual, setIsManual] = useState(false);
  const [anytimeWithdrawal, setAnytimeWithdrawal] = useState(false);
  const [fundingSource, setFundingSource] = useState("Wealth Save");
  const [endDateText, setEndDateText] = useState("");
  const [wealthPreference, setWealthPreference] = useState<"Interest Based" | "Impact Wealth">("Interest Based");

  // Dropdown state
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  // PIN & Submission
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pinInputRef = useRef<TextInput>(null);

  // API mutations
  const [createPortfolio, { isLoading: isCreating }] = useCreatePortfolioMutation();
  const [verifyPin] = useVerifyPinMutation();

  const formatAmount = (val: string) => {
    const n = val.replace(/\D/g, "");
    if (!n) return "";
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)} / ${cleaned.slice(4)}`;
  };

  const parseDateToIso = (dStr: string) => {
    const parts = dStr.split("/").map((p) => p.trim());
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year >= 2020 && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        const d = new Date(Date.UTC(year, month, day, 23, 59, 59));
        return d.toISOString();
      }
    }
    return new Date(Date.now() + 365 * 86400000).toISOString();
  };

  const calculateGrowth = () => {
    const amt = parseFloat(targetAmount.replace(/,/g, "")) || 0;
    return ((amt * 0.12 * 365) / 365).toFixed(2);
  };

  const isFormValid = () => {
    const targetAmt = parseFloat(targetAmount.replace(/,/g, "")) || 0;
    const initialAmt = parseFloat(initialDeposit.replace(/,/g, "")) || 0;
    return (
      wealthTitle.trim().length > 0 &&
      targetAmt > 0 &&
      initialAmt >= 100 &&
      frequency.length > 0 &&
      fundingSource.length > 0 &&
      endDateText.length >= 10
    );
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (enteredPin.length !== 4) return;
    setIsSubmitting(true);

    try {
      console.log("🏎️ [WealthFlow Create] Verifying PIN...");
      await verifyPin({ pin: enteredPin }).unwrap();
      console.log("✅ [WealthFlow Create] PIN verified successfully");

      const targetAmountKobo = Math.round((parseFloat(targetAmount.replace(/,/g, "")) || 0) * 100);
      const initialDepositKobo = Math.round((parseFloat(initialDeposit.replace(/,/g, "")) || 100) * 100);
      const maturityIso = parseDateToIso(endDateText);

      const payload: CreatePortfolioRequest = {
        name: wealthTitle.trim(),
        amount: Math.max(initialDepositKobo, 10000), // Initial deposit to start pot (min ₦100)
        targetAmount: targetAmountKobo, // Total goal amount
        maturityDate: maturityIso,
        autoSaveEnabled: !isManual,
        autoSaveFrequency: (frequency ? frequency.toUpperCase() : "MONTHLY") as "DAILY" | "WEEKLY" | "MONTHLY",
        autoSaveAmount: initialDepositKobo,
        autoSaveSource: (fundingSource.toUpperCase().includes("CARD") || fundingSource.toUpperCase().includes("BANK") ? "CARD" : "WALLET") as "WALLET" | "CARD",
        nextAutoSaveDate: new Date(Date.now() + 86400000).toISOString(),
        metadata: {
          anytimeWithdrawal,
          wealthPreference,
          fundingSource,
        },
      };

      console.log("🏎️ [WealthFlow Create Request] POST /api/v1/portfolios/wealthflow with payload:\n", JSON.stringify(payload, null, 2));

      const res = await createPortfolio({
        type: "wealthflow",
        body: payload,
      }).unwrap();

      console.log("✅ [WealthFlow Create Success] Received response:\n", JSON.stringify(res, null, 2));
      setStep("success");
    } catch (err: any) {
      console.error("❌ [WealthFlow Create Error] Failed to create portfolio:\n", JSON.stringify(err, null, 2));
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to create WealthFlow portfolio. Please check your details and try again.";
      Alert.alert("Activation Failed", message);
      setPin("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── FORM ─────────────────────────────────────────────────────────────────
  const renderForm = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      {/* What's on WealthFlow? */}
      {showInfoCard && (
        <View
          style={{
            backgroundColor: TEAL_LIGHT,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            marginTop: 8,
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 12, right: 12 }}
            onPress={() => setShowInfoCard(false)}
          >
            <Ionicons name="close" size={18} color={TEAL} />
          </TouchableOpacity>
          <Text
            style={{
              color: TEAL,
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            What's on WealthFlow? 🌊
          </Text>
          {[
            {
              icon: "⚡",
              bold: "Automated Contributions:",
              text: " Use the Wealth Auto feature to set daily, weekly, or monthly deposits effortlessly.",
            },
            {
              icon: "🎯",
              bold: "Goal-Based Discipline:",
              text: " Set specific amounts and timelines for your milestones.",
            },
            {
              icon: "🛡️",
              bold: "Secured Interest:",
              text: " Lock down your funds until maturity or activate Anytime Withdrawal as needed.",
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 13, marginRight: 6 }}>{item.icon}</Text>
              <Text
                style={{
                  color: TEAL,
                  fontSize: 12,
                  lineHeight: 18,
                  flex: 1,
                }}
              >
                <Text style={{ fontWeight: "700" }}>{item.bold}</Text>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Wealth Title */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.inputLabel}>Wealth Title</Text>
        <TextInput
          placeholder="e.g. My Emergency automated fund"
          placeholderTextColor="#9CA3AF"
          value={wealthTitle}
          onChangeText={setWealthTitle}
          style={styles.textInput}
        />
      </View>

      {/* Target Amount */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.inputLabel}>Target Goal Amount (₦)</Text>
        <TextInput
          placeholder="e.g. 500,000"
          placeholderTextColor="#9CA3AF"
          value={targetAmount}
          onChangeText={(v) => setTargetAmount(formatAmount(v))}
          keyboardType="numeric"
          style={styles.textInput}
        />
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          The final target milestone you want to reach
        </Text>
      </View>

      {/* Starting / Initial Deposit */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.inputLabel}>Starting Contribution (₦)</Text>
        <TextInput
          placeholder="e.g. 1,000 (Min ₦100)"
          placeholderTextColor="#9CA3AF"
          value={initialDeposit}
          onChangeText={(v) => setInitialDeposit(formatAmount(v))}
          keyboardType="numeric"
          style={styles.textInput}
        />
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          Amount deducted from funding source to open and activate this pot
        </Text>
      </View>

      {/* Frequency Dropdown */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.inputLabel}>Contribution Frequency</Text>
        <TouchableOpacity
          onPress={() => setShowFreqDropdown(!showFreqDropdown)}
          style={styles.dropdownInput}
        >
          <Text
            style={{
              color: frequency ? "#1A1A1A" : "#9CA3AF",
              fontSize: 15,
              fontWeight: frequency ? "600" : "400",
            }}
          >
            {frequency || "Select Frequency"}
          </Text>
          <Ionicons
            name={showFreqDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {showFreqDropdown && (
          <View style={styles.dropdownMenu}>
            {FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq}
                onPress={() => {
                  setFrequency(freq);
                  setShowFreqDropdown(false);
                }}
                style={[
                  styles.dropdownOption,
                  frequency === freq && { backgroundColor: TEAL_LIGHT },
                ]}
              >
                <Text
                  style={{
                    color: frequency === freq ? TEAL : "#1A1A1A",
                    fontWeight: frequency === freq ? "700" : "500",
                  }}
                >
                  {freq}
                </Text>
                {frequency === freq && (
                  <Ionicons name="checkmark" size={18} color={TEAL} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Funding Source Dropdown */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.inputLabel}>Funding Source</Text>
        <TouchableOpacity
          onPress={() => setShowSourceDropdown(!showSourceDropdown)}
          style={styles.dropdownInput}
        >
          <Text
            style={{
              color: fundingSource ? "#1A1A1A" : "#9CA3AF",
              fontSize: 15,
              fontWeight: fundingSource ? "600" : "400",
            }}
          >
            {fundingSource || "Select Funding Source"}
          </Text>
          <Ionicons
            name={showSourceDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {showSourceDropdown && (
          <View style={styles.dropdownMenu}>
            {SOURCES.map((src) => (
              <TouchableOpacity
                key={src}
                onPress={() => {
                  setFundingSource(src);
                  setShowSourceDropdown(false);
                }}
                style={[
                  styles.dropdownOption,
                  fundingSource === src && { backgroundColor: TEAL_LIGHT },
                ]}
              >
                <Text
                  style={{
                    color: fundingSource === src ? TEAL : "#1A1A1A",
                    fontWeight: fundingSource === src ? "700" : "500",
                  }}
                >
                  {src}
                </Text>
                {fundingSource === src && (
                  <Ionicons name="checkmark" size={18} color={TEAL} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* End Date (Target Date) */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.inputLabel}>Target End Date</Text>
        <TextInput
          placeholder="DD / MM / YYYY"
          placeholderTextColor="#9CA3AF"
          value={endDateText}
          onChangeText={(v) => setEndDateText(formatDateInput(v))}
          keyboardType="numeric"
          maxLength={14}
          style={styles.textInput}
        />
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, fontStyle: "italic" }}>
          Target maturity date in DD / MM / YYYY format (e.g. 31 / 12 / 2027)
        </Text>
      </View>

      {/* Wealth Preference Selector */}
      <View style={{ marginBottom: 24 }}>
        <Text style={styles.inputLabel}>Wealth Preference</Text>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            padding: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => setWealthPreference("Interest Based")}
            style={{
              flex: 1,
              backgroundColor:
                wealthPreference === "Interest Based" ? "#FFFFFF" : "transparent",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              shadowColor: wealthPreference === "Interest Based" ? "#000" : "transparent",
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: wealthPreference === "Interest Based" ? 2 : 0,
            }}
          >
            <Text
              style={{
                color:
                  wealthPreference === "Interest Based" ? TEAL : "#6B7280",
                fontWeight:
                  wealthPreference === "Interest Based" ? "700" : "500",
                fontSize: 13,
              }}
            >
              Interest Based
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWealthPreference("Impact Wealth")}
            style={{
              flex: 1,
              backgroundColor:
                wealthPreference === "Impact Wealth" ? "#FFFFFF" : "transparent",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              shadowColor: wealthPreference === "Impact Wealth" ? "#000" : "transparent",
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: wealthPreference === "Impact Wealth" ? 2 : 0,
            }}
          >
            <Text
              style={{
                color:
                  wealthPreference === "Impact Wealth" ? TEAL : "#6B7280",
                fontWeight:
                  wealthPreference === "Impact Wealth" ? "700" : "500",
                fontSize: 13,
              }}
            >
              Impact Wealth
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Anytime Withdrawal Toggle */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 14 }}>
            Anytime Withdrawal
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
            Switch on to withdraw funds before maturity date.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setAnytimeWithdrawal(!anytimeWithdrawal)}
          style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            backgroundColor: anytimeWithdrawal ? TEAL : "#E5E7EB",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "white",
              alignSelf: anytimeWithdrawal ? "flex-end" : "flex-start",
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Automation / Manual Toggle */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 14 }}>
            Manual Mode
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
            Switch on to deposit manually whenever you choose.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsManual(!isManual)}
          style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            backgroundColor: isManual ? TEAL : "#E5E7EB",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "white",
              alignSelf: isManual ? "flex-end" : "flex-start",
            }}
          />
        </TouchableOpacity>
      </View>

      <ThemedButton
        title="Proceed to Preview"
        onPress={() => setStep("preview")}
        disabled={!isFormValid()}
        style={{
          backgroundColor: isFormValid() ? TEAL : "#CCCCCC",
          borderRadius: 14,
          height: 56,
          marginBottom: 40,
        }}
      />
    </ScrollView>
  );

  // ─── PREVIEW ──────────────────────────────────────────────────────────────
  const renderPreview = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      <View style={{ alignItems: "center", marginTop: 8, marginBottom: 20 }}>
        <Image
          source={require("../../../assets/images/auto1.png")}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "800",
            fontSize: 22,
            marginTop: 8,
          }}
        >
          {wealthTitle}
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
          Target: ₦{targetAmount || "0.00"}
        </Text>
      </View>

      {/* Review Card */}
      <View
        style={{
          backgroundColor: "#F9F9F9",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <View>
            <Text style={styles.previewLabel}>Wealth Title</Text>
            <Text style={styles.previewValue}>{wealthTitle}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.previewLabel}>Starting Deposit</Text>
            <Text style={styles.previewValue}>₦{initialDeposit}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <View>
            <Text style={styles.previewLabel}>Target Goal</Text>
            <Text style={styles.previewValue}>₦{targetAmount}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.previewLabel}>Frequency</Text>
            <Text style={styles.previewValue}>{frequency}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <View>
            <Text style={styles.previewLabel}>Target End Date</Text>
            <Text style={styles.previewValue}>{endDateText}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.previewLabel}>Funding Source</Text>
            <Text style={styles.previewValue}>{fundingSource}</Text>
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
            <Text style={styles.previewLabel}>Interest Rate</Text>
            <Text style={styles.previewValue}>12% P.A</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.previewLabel}>Estimated Returns</Text>
            <Text style={[styles.previewValue, { color: TEAL }]}>
              +₦{formatAmount(calculateGrowth())}
            </Text>
          </View>
        </View>
      </View>

      {/* Decorative receipt zig-zag */}
      <View
        style={{
          backgroundColor: "#F9F9F9",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          overflow: "hidden",
          height: 12,
          marginBottom: 32,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: -6,
          }}
        >
          {Array.from({ length: 24 }).map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 14,
                height: 14,
                backgroundColor: "white",
                transform: [{ rotate: "45deg" }],
              }}
            />
          ))}
        </View>
      </View>

      <ThemedButton
        title="Confirm & Create"
        onPress={() => setStep("pin")}
        style={{
          backgroundColor: TEAL,
          borderRadius: 14,
          height: 56,
          marginBottom: 40,
        }}
      />
    </ScrollView>
  );

  // ─── PIN ──────────────────────────────────────────────────────────────────
  const renderPin = () => (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", paddingTop: 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require("../../../assets/images/change-pin.png")}
        style={{ width: 100, height: 100, marginBottom: 20 }}
        resizeMode="contain"
      />
      <Text
        style={{
          color: "#1A1A1A",
          fontWeight: "800",
          fontSize: 22,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Enter Transaction PIN
      </Text>
      <Text
        style={{
          color: "#6B7280",
          fontSize: 13,
          textAlign: "center",
          marginBottom: 32,
          lineHeight: 20,
        }}
      >
        Enter your 4-digit PIN to securely activate your WealthFlow portfolio.
      </Text>

      {/* PIN boxes */}
      <TouchableOpacity
        activeOpacity={1}
        disabled={isSubmitting || isCreating}
        onPress={() => pinInputRef.current?.focus()}
        style={{ flexDirection: "row", gap: 16, marginBottom: 32 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: pin.length === i ? TEAL : "#E5E5E5",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A" }}>
              {pin[i] ? "•" : ""}
            </Text>
          </View>
        ))}
      </TouchableOpacity>

      <TextInput
        ref={pinInputRef}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        value={pin}
        editable={!isSubmitting && !isCreating}
        onChangeText={(val) => {
          const numeric = val.replace(/\D/g, "").slice(0, 4);
          setPin(numeric);
          if (numeric.length === 4) {
            handlePinComplete(numeric);
          }
        }}
        maxLength={4}
        keyboardType="numeric"
        autoFocus
      />

      {(isSubmitting || isCreating) && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ActivityIndicator size="small" color={TEAL} />
          <Text style={{ color: TEAL, fontSize: 13, fontWeight: "600" }}>
            Activating WealthFlow...
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={{ alignItems: "center", marginBottom: 40 }}
        disabled={isSubmitting || isCreating}
        onPress={() => pinInputRef.current?.focus()}
      >
        <Ionicons name="finger-print" size={36} color={TEAL} />
        <Text style={{ color: TEAL, fontWeight: "700", fontSize: 14, marginTop: 8 }}>
          Use biometric authentication
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── SUCCESS ──────────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <ScrollView
      contentContainerStyle={{ alignItems: "center", paddingTop: 40, paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: 140, height: 140, marginBottom: 24 }}>
        <Image
          source={require("../../../assets/images/congrats.png")}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          color: "#1A1A1A",
          fontWeight: "800",
          fontSize: 24,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        WealthFlow Created{"\n"}Successfully 🌊
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 14,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 40,
        }}
      >
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          Congratulations!
        </Text>{" "}
        You've started your automated WealthFlow pot for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          {wealthTitle}
        </Text>{" "}
        with target{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          ₦{targetAmount || "0.00"}
        </Text>{" "}
        until{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          {endDateText}
        </Text>
        .
      </Text>

      <ThemedButton
        title="View WealthFlow Portfolios"
        onPress={() => router.replace("/(tabs)/portfolios/wealth-flow")}
        style={{
          backgroundColor: TEAL,
          width: "100%",
          height: 56,
          borderRadius: 14,
        }}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={
          step === "form"
            ? "Create WealthFlow"
            : step === "preview"
              ? "WealthFlow Preview"
              : step === "pin"
                ? "Insert your Pin"
                : "WealthFlow"
        }
        onBack={() => {
          if (step === "preview") setStep("form");
          else if (step === "pin") setStep("preview");
          else if (step === "success") router.replace("/(tabs)/portfolios/wealth-flow");
          else router.back();
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {step === "form" && renderForm()}
        {step === "preview" && renderPreview()}
        {step === "pin" && renderPin()}
        {step === "success" && renderSuccess()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXT_DARK,
  },
  dropdownInput: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownMenu: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginTop: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  previewLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  previewValue: {
    color: TEXT_DARK,
    fontWeight: "700",
    fontSize: 16,
  },
});
