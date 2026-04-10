import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#0B575B";
const THEME_BLUE = "#D5EDFF";
const TEXT_DARK = "#1A1A1A";

const SOURCES = ["Wealth Save", "Wealth Flex", "Bank Account"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

export default function CreateAutoScreen() {
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
  const [frequency, setFrequency] = useState(params.frequency || "");
  const [isManual, setIsManual] = useState(false);
  const [anytimeWithdrawal, setAnytimeWithdrawal] = useState(false);
  const [fundingSource, setFundingSource] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dropdown state
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showFreqDropdown, setShowFreqDropdown] = useState(false);

  // PIN
  const [pin, setPin] = useState("");
  const pinInputRef = useRef<TextInput>(null);

  const formatAmount = (val: string) => {
    const n = val.replace(/\D/g, "");
    if (!n) return "";
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateGrowth = () => {
    const amt = parseFloat(targetAmount.replace(/,/g, "")) || 0;
    return ((amt * 0.12 * 365) / 365).toFixed(2);
  };

  // ─── FORM ─────────────────────────────────────────────────────────────────
  const renderForm = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      {/* What's on WealthAuto? */}
      {showInfoCard && (
        <View
          style={{
            backgroundColor: THEME_BLUE,
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
            <Ionicons name="close" size={18} color="#005F61" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#005F61",
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            What is WealthAuto? 🏎️
          </Text>
          <Text
            style={{
              color: "#005F61",
              fontSize: 11,
              lineHeight: 17,
              marginBottom: 10,
            }}
          >
            It is a Smart Automation Tool that allows you to schedule recurring
            deposits into your various wealth portfolios. It is built for the
            "Wealth Builder" who wants to grow their money consistently without
            having to log in every time to make a transfer.
          </Text>
        </View>
      )}

      {/* Wealth Title */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: TEXT_DARK,
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Wealth Title
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
            placeholder='e.g., "Investment" or "Future Backup"'
            placeholderTextColor="#9CA3AF"
            value={wealthTitle}
            onChangeText={setWealthTitle}
            style={{ fontSize: 14, color: TEXT_DARK }}
          />
        </View>
      </View>

      {/* Target Amount */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: TEXT_DARK,
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Target Amount
        </Text>
        <View
          style={{
            backgroundColor: "#F3F4F6",
            height: 56,
            borderRadius: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#9CA3AF", marginRight: 4 }}>₦</Text>
          <TextInput
            placeholder="3,000.00 min"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={(v) => setTargetAmount(formatAmount(v))}
            style={{ flex: 1, fontSize: 14, color: TEXT_DARK }}
          />
        </View>
      </View>

      {/* End Date */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: TEXT_DARK,
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          End Date
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
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#9CA3AF"
            value={endDate}
            onChangeText={setEndDate}
            style={{ fontSize: 14, color: TEXT_DARK }}
          />
        </View>
      </View>

      {/* Frequency Dropdown */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: TEXT_DARK,
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Frequency
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowFreqDropdown(!showFreqDropdown);
            setShowSourceDropdown(false);
          }}
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
            style={{ color: frequency ? TEXT_DARK : "#9CA3AF", fontSize: 14 }}
          >
            {frequency || "Daily, Weekly, or Monthly"}
          </Text>
          <Ionicons
            name={showFreqDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {showFreqDropdown && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              marginTop: 4,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E5E5E5",
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

      {/* Manual Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              color: TEXT_DARK,
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

      {/* Anytime Withdrawal Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              color: TEXT_DARK,
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Anytime Withdrawal
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 11, lineHeight: 16 }}>
            Enable if you wish to withdraw anytime you like in the future.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setAnytimeWithdrawal(!anytimeWithdrawal)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: anytimeWithdrawal ? TEAL : "#D1D5DB",
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
              left: anytimeWithdrawal ? 22 : 2,
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Funding Source Dropdown */}
      <View style={{ marginBottom: 40 }}>
        <Text
          style={{
            color: TEXT_DARK,
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Funding Source
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowSourceDropdown(!showSourceDropdown);
            setShowFreqDropdown(false);
          }}
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
              color: fundingSource ? TEXT_DARK : "#9CA3AF",
              fontSize: 14,
            }}
          >
            {fundingSource || "Select funding source"}
          </Text>
          <Ionicons
            name={showSourceDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {showSourceDropdown && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              marginTop: 4,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E5E5E5",
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
            }}
          >
            {SOURCES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => {
                  setFundingSource(s);
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

      {(() => {
        const isFormValid =
          wealthTitle && targetAmount && endDate && frequency && fundingSource;
        return (
          <ThemedButton
            title="Continue"
            onPress={() => setStep("preview")}
            disabled={!isFormValid}
            style={{
              backgroundColor: TEAL,
              borderRadius: 14,
              height: 56,
              marginBottom: 40,
              opacity: !isFormValid ? 0.45 : 1,
            }}
          />
        );
      })()}
    </ScrollView>
  );

  // ─── PREVIEW ──────────────────────────────────────────────────────────────
  const renderPreview = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      <View
        style={{
          width: "100%",
          backgroundColor: "#F9F9F9",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 28,
          marginTop: 8,
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
              Title
            </Text>
            <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
              {wealthTitle || "Investment"}
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
              Target Amount
            </Text>
            <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
              ₦{targetAmount || "3,343,000.00"}
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
              Frequency
            </Text>
            <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
              {frequency || "Daily(₦5,000)"}
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
              Wealth from
            </Text>
            <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
              {fundingSource || "WealthFlex"}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
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
              Wealth Interest
            </Text>
            <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
              ₦{formatAmount(calculateGrowth())}
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
            <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
              {endDate || "31st Dec 2023"}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: "#6B7280",
              fontSize: 11,
              marginBottom: 6,
              fontWeight: "500",
            }}
          >
            Wealth grow Into
          </Text>
          <Text style={{ color: TEXT_DARK, fontWeight: "700", fontSize: 16 }}>
            WinUp
          </Text>
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
              }}
            />
          ))}
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#EEEEEE",
          marginTop: 20,
          marginBottom: 28,
        }}
      />

      <ThemedButton
        title="Confirm"
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
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <Image
        source={require("../../../assets/images/change-pin.png")}
        style={{ width: 130, height: 130, marginTop: 32, marginBottom: 24 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: TEXT_DARK,
          textAlign: "center",
          marginBottom: 10,
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
        }}
      >
        Your must insert your pin to confirm to{"\n"}completely create your
        Wealth Auto
      </Text>

      {/* PIN boxes */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => pinInputRef.current?.focus()}
        style={{ flexDirection: "row", gap: 16, marginBottom: 32 }}
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
            <Text style={{ fontSize: 20, fontWeight: "700", color: TEXT_DARK }}>
              {pin[i] ? "●" : ""}
            </Text>
          </View>
        ))}
      </TouchableOpacity>

      <TextInput
        ref={pinInputRef}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        value={pin}
        onChangeText={(val) => {
          const numeric = val.replace(/\D/g, "").slice(0, 4);
          setPin(numeric);
          if (numeric.length === 4) setStep("success");
        }}
        maxLength={4}
        keyboardType="numeric"
        autoFocus
      />

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
    </ScrollView>
  );

  // ─── SUCCESS ──────────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 40,
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 280,
          height: 280,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 24,
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
          source={require("../../../assets/images/auto1.png")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          fontSize: 26,
          fontWeight: "800",
          color: TEXT_DARK,
          textAlign: "center",
          lineHeight: 34,
          marginBottom: 16,
        }}
      >
        WealthAuto Activated{"\n"}Successfully 🏎️
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 13,
          textAlign: "center",
          lineHeight: 21,
          marginBottom: 40,
          paddingHorizontal: 8,
        }}
      >
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          Congratulations, WealthBuilder!
        </Text>{" "}
        You've successfully locked{" "}
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          ₦[{targetAmount || "3,000,000.00"}]
        </Text>{" "}
        until{" "}
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          [{endDate || "24th Dec 2026"}]
        </Text>
        .{"\n\n"}
        You've successfully blocked temptation and set your money on a path to
        grow by{" "}
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          [₦{formatAmount(calculateGrowth())}]
        </Text>
        . It's a win for your future self!
      </Text>

      <ThemedButton
        title="Close"
        onPress={() => router.replace("/(tabs)/portfolios/wealth-auto")}
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
            ? isRecommendation
              ? params.title!
              : "Create WealthAuto"
            : step === "preview"
              ? "WealthAuto Preview"
              : step === "pin"
                ? "Insert your Pin"
                : "WealthAuto"
        }
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
        {step === "form" && renderForm()}
        {step === "preview" && renderPreview()}
        {step === "pin" && renderPin()}
        {step === "success" && renderSuccess()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
