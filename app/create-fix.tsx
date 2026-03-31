import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
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
  const [fundingSource, setFundingSource] = useState("");
  const [lockType] = useState(params.lockType || "WealthFix");
  const [showInterestCard, setShowInterestCard] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const [isConsent, setIsConsent] = useState(false);
  const [agreedPenalty, setAgreedPenalty] = useState(false);
  const [acknowledgedTemptation, setAcknowledgedTemptation] = useState(false);

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

  // ─── FORM STEP ───────────────────────────────────────────────────────────────
  const renderFormStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      {/* Header text */}
      <View className="mb-6 mt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#1A1A1A] font-bold text-[24px]">
            {lockType === "WealthFix" ? "Create a WealthFix" : lockType}
          </Text>
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
        </View>
        <Text className="text-[#6B7280] text-[13px] mt-1">
          {lockType === "WealthFix"
            ? "Edit and setup your WealthFix"
            : `Lock ₦${formatAmount(initialAmount)} for ${duration} days`}
        </Text>
      </View>

      {/* How Interest Works Card */}
      {showInterestCard && (
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
            <Text style={{ fontWeight: "700" }}>
              Short term (10–90 days):
            </Text>{" "}
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

      {/* Title field */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 8 }}
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
        <Text
          style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 8 }}
        >
          {lockType === "WealthFix" ? "Target Amount" : "Amount To Fix"}
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
            style={{ flex: 1, fontSize: 15, color: "#1A1A1A", fontWeight: "700" }}
          />
        </View>
      </View>

      {/* End Date */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 8 }}
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
          <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
            {duration ? `${duration} days from now` : "DD / MM / YYYY"}
          </Text>
        </View>
      </View>

      {/* Funding Source */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 8 }}
        >
          Funding Source
        </Text>
        <View
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
          <Text style={{ color: fundingSource ? "#1A1A1A" : "#9CA3AF", fontSize: 14 }}>
            {fundingSource || "Select funding source"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
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
          <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 4 }}>
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
          <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 13, marginBottom: 4 }}>
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

      <ThemedButton
        title="Preview Fix"
        onPress={() => setStep("preview")}
        style={{
          backgroundColor: TEAL,
          borderRadius: 14,
          height: 56,
          marginBottom: 40,
        }}
      />
    </ScrollView>
  );

  // ─── PREVIEW STEP ─────────────────────────────────────────────────────────────
  const renderPreviewStep = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
      <View style={{ marginBottom: 20, marginTop: 4 }}>
        <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 24, marginBottom: 4 }}>
          WealthFix Preview 🔒
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 13 }}>
          {lockType}: ₦{formatAmount(initialAmount)} for {duration} days
        </Text>
      </View>

      {/* Ticket card */}
    {/* Card - remove borderWidth completely */}
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
    // ❌ Remove these:
    // borderWidth: 1,
    // borderBottomWidth: 0,
    // borderColor: "#EEEEEE",
    marginBottom: 0,
  }}
>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
          <View>
            <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
              Amount To Fix
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              ₦{formatAmount(initialAmount)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
              Lock Duration
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {duration} days
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
          <View>
            <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
              Wealth Growth
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              ₦{formatAmount(calculateInterest())}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
              Wealth from:
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              WealthFlex
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
          <View>
            <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
              Method
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {isManual ? "Manuel" : "Automation"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
              End Date
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              31th Dec 2023
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: "#6B7280", fontSize: 11, marginBottom: 6, fontWeight: "500" }}>
            Wealth grows Into
          </Text>
          <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
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
       {/* Jagged diamonds - no border */}
{Array.from({ length: 40 }).map((_, i) => (
  <View
    key={i}
    style={{
      width: 14,
      height: 14,
      backgroundColor: "white",
      transform: [{ rotate: "45deg" }],
      marginTop: 4,
      // ❌ Remove these:
      // borderLeftWidth: 1,
      // borderTopWidth: 1,
      // borderColor: "#EEEEEE",
    }}
  />
))}
        </View>
      </View>

<View style={{ height: 1, backgroundColor: "#EEEEEE", marginTop: 20, marginBottom: 20 }} />

      {/* Agreement Checkboxes */}
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 20 }}
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
        <Text style={{ flex: 1, color: "#6B7280", fontSize: 12, lineHeight: 18 }}>
          You must agree that early withdrawal from a Wealth Fix is discouraged
          and will attract a penalty to ensure financial discipline.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 36 }}
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
        <Text style={{ flex: 1, color: "#6B7280", fontSize: 12, lineHeight: 18 }}>
          You must also acknowledge that the lock feature is designed to "block
          temptation," and breaking the lock undermines their wealth-building
          goal.
        </Text>
      </TouchableOpacity>

      <ThemedButton
        title="Lock Wealth"
        onPress={() => setStep("pin")}
        disabled={!agreedPenalty || !acknowledgedTemptation}
        style={{
          backgroundColor: TEAL,
          borderRadius: 14,
          height: 56,
          marginBottom: 40,
          opacity: !agreedPenalty || !acknowledgedTemptation ? 0.45 : 1,
        }}
      />
    </ScrollView>
  );

  // ─── PIN STEP ─────────────────────────────────────────────────────────────────
  const renderPinStep = () => (
    <View style={{ alignItems: "center", paddingHorizontal: 24, marginTop: 40 }}>
      <Image
        source={require("../assets/images/change-pin.png")}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: "#1A1A1A",
          marginTop: 24,
          marginBottom: 8,
          textAlign: "center",
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
          if (numeric.length === 4) setStep("success");
        }}
        maxLength={4}
        keyboardType="numeric"
        autoFocus
      />

      <View style={{ marginBottom: 40, paddingHorizontal: 16 }}>
        <Text style={{ color: "#6B7280", textAlign: "center", fontSize: 12, lineHeight: 18 }}>
          If you have forgotten your pin, change it from your settings page
        </Text>
      </View>

      <TouchableOpacity
        style={{ alignItems: "center", marginBottom: 40 }}
        onPress={() => setStep("success")}
      >
        <Ionicons name="finger-print" size={36} color={TEAL} />
        <Text style={{ color: TEAL, fontWeight: "700", fontSize: 14, marginTop: 8 }}>
          Use fingerprint
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── SUCCESS STEP ─────────────────────────────────────────────────────────────
  const renderSuccessStep = () => (
    <View style={{ alignItems: "center", paddingHorizontal: 24, marginTop: 40 }}>
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
          source={require("../assets/images/success.png")}
          style={{ width: 280, height: 280, position: "absolute", opacity: 0.3 }}
          resizeMode="contain"
        />
        <Image
          source={require("../assets/images/fix3.png")}
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
          .{"\n\n"}You've successfully blocked temptation and set your money on
          a path to grow by{" "}
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {renderPinStep()}
          </ScrollView>
        )}
        {step === "success" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {renderSuccessStep()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}