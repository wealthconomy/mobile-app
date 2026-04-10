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
const PURPLE = "#560FF1";
const PURPLE_LIGHT = "#F3EEFF";

const SOURCES = ["Wealth Save", "Wealth Flex", "Bank Account"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

export default function CreateFamScreen() {
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
  const [familyCategory, setFamilyCategory] = useState(params.category || "");
  const [membersName, setMembersName] = useState("");
  const [targetAmount, setTargetAmount] = useState(params.amount || "");
  const [frequency, setFrequency] = useState(params.frequency || "");
  const [isManual, setIsManual] = useState(false);
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
      {/* What's on WealthFam? */}
      {showInfoCard && (
        <View
          style={{
            backgroundColor: PURPLE_LIGHT,
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
            <Ionicons name="close" size={18} color={PURPLE} />
          </TouchableOpacity>
          <Text
            style={{
              color: PURPLE,
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            What's on WealthFam? 🏡
          </Text>
          {[
            {
              icon: "⚡",
              bold: "Automated Contributions:",
              text: " Use the Wealth Auto feature to set daily, weekly, or monthly deposits into your family pots effortlessly.",
            },
            {
              icon: "🎯",
              bold: "Goal-Based Discipline:",
              text: " Set specific amounts and timelines for family needs, like school fees or a family home.",
            },
            {
              icon: "🤝",
              bold: "Community-Driven Growth:",
              text: " Leverage group saving options to reach family targets faster through collective discipline.",
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", marginBottom: i < 2 ? 8 : 0 }}
            >
              <Text style={{ fontSize: 12, marginRight: 6 }}>{item.icon}</Text>
              <Text
                style={{ flex: 1, color: PURPLE, fontSize: 11, lineHeight: 17 }}
              >
                <Text style={{ fontWeight: "700" }}>{item.bold}</Text>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Family Category */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Family Category
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
            placeholder="e.g., Kids, Spouse, or Parents/Siblings"
            placeholderTextColor="#9CA3AF"
            value={familyCategory}
            onChangeText={setFamilyCategory}
            style={{ fontSize: 14, color: "#1A1A1A" }}
          />
        </View>
      </View>

      {/* Family Member(s) Name */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
            fontWeight: "700",
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          Family Member(s) Name
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
            placeholder="e.g Glory Eke and Simon Eke, Olumide etc"
            placeholderTextColor="#9CA3AF"
            value={membersName}
            onChangeText={setMembersName}
            style={{ fontSize: 14, color: "#1A1A1A" }}
          />
        </View>
      </View>

      {/* Target Amount */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
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
            style={{ flex: 1, fontSize: 14, color: "#1A1A1A" }}
          />
        </View>
      </View>

      {/* Frequency Dropdown */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            color: "#1A1A1A",
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
            style={{ color: frequency ? "#1A1A1A" : "#9CA3AF", fontSize: 14 }}
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

      {/* Funding Source Dropdown */}
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
              color: fundingSource ? "#1A1A1A" : "#9CA3AF",
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

      {/* End Date */}
      <View style={{ marginBottom: 8 }}>
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
            style={{ fontSize: 14, color: "#1A1A1A" }}
          />
        </View>
      </View>

      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 11,
          marginBottom: 28,
          lineHeight: 16,
        }}
      >
        Note: To earn the full interest, you must meet your target amount and
        reach this date.
      </Text>

      {(() => {
        const isFormValid =
          familyCategory &&
          membersName &&
          targetAmount &&
          frequency &&
          fundingSource &&
          endDate;
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
      {/* Ticket Card */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#F9F9F9",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: 28,
          marginBottom: 0,
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
              Family Category
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {familyCategory || "Spouse"}
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
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              ₦{targetAmount || "3,000.00"}
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
              Family Member(s)
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {membersName || "Simon Eke"}
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
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {fundingSource || "WealthFlex"}
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
              Wealth Growth
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
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
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {endDate || "31st Dec 2025"}
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
              Wealth grows Into
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              WinUp
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
              Method
            </Text>
            <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 16 }}>
              {isManual ? "Manual" : "Automation"}
            </Text>
          </View>
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
        source={require("../assets/images/change-pin.png")}
        style={{ width: 130, height: 130, marginTop: 32, marginBottom: 24 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: "#1A1A1A",
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
        You must insert your pin to confirm to{"\n"}completely create your
        Wealth Fam
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
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A" }}>
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
          source={require("../assets/images/success.png")}
          style={{
            width: 280,
            height: 280,
            position: "absolute",
            opacity: 0.3,
          }}
          resizeMode="contain"
        />
        <Image
          source={require("../assets/images/fam1.png")}
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
          lineHeight: 34,
          marginBottom: 16,
        }}
      >
        WealthFam Set{"\n"}Successfully 🏡
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
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          Congratulations, WealthBuilder!
        </Text>{" "}
        You've successfully set up a WealthFam plan for{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          ₦{targetAmount || "3,000,000.00"}
        </Text>
        .{"\n\n"}
        Your money is now on a path to grow by{" "}
        <Text style={{ fontWeight: "700", color: "#1A1A1A" }}>
          (₦{formatAmount(calculateGrowth())})
        </Text>
        . It's a win for your family!
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/portfolios/wealth-fam" as any)}
        style={{
          backgroundColor: TEAL,
          height: 56,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          Close
        </Text>
      </TouchableOpacity>
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
              : "Create WealthFam"
            : step === "preview"
              ? "WealthFam Preview"
              : step === "pin"
                ? "Insert Pin"
                : "WealthFam"
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
