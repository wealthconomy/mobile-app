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
const TEXT_DARK = "#1A1A1A";

const SOURCES = ["WealthFlex", "WinUp", "Debit card"];

export default function TopUpScreen() {
  const { portfolioName } = useLocalSearchParams<{ portfolioName: string }>();
  const name = portfolioName || "Wealth";

  const [step, setStep] = useState<"form" | "pin" | "success">("form");
  const [fundingSource, setFundingSource] = useState("WealthFlex");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const pinInputRef = useRef<TextInput>(null);

  // ─── FORM ─────────────────────────────────────────────────────────────────
  const renderForm = () => {
    const isFormValid = amount.length > 0;

    return (
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        <View style={{ alignItems: "center", marginTop: 40, marginBottom: 32 }}>
          <Image
            source={require("../assets/images/topup.png")}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: TEXT_DARK,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Top Up your{"\n"}
            {name}
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontSize: 13,
              textAlign: "center",
              marginTop: 12,
              lineHeight: 20,
              paddingHorizontal: 20,
            }}
          >
            You can top up your {name} amount to increase the funds already
            saved. Select a funding source to top up the saved funds.
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: TEXT_DARK,
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            Amount(₦)
          </Text>
          <TextInput
            placeholder="₦0.00"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: "#F3F4F6",
              height: 56,
              borderRadius: 12,
              paddingHorizontal: 16,
              fontSize: 14,
              color: TEXT_DARK,
            }}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              color: TEXT_DARK,
              fontWeight: "700",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            Top Up from
          </Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowSourceDropdown(!showSourceDropdown)}
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
            <Text style={{ color: TEXT_DARK, fontSize: 14 }}>
              {fundingSource}
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
                zIndex: 50,
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

        <ThemedButton
          title="Add Funds"
          onPress={() => setStep("pin")}
          disabled={!isFormValid}
          style={{
            backgroundColor: isFormValid ? TEAL : "#E0E0E0",
            opacity: isFormValid ? 1 : 0.45,
            borderRadius: 14,
            height: 56,
            marginBottom: 40,
          }}
        />
      </ScrollView>
    );
  };

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
      <View style={{ height: 40 }} />
      <Image
        source={require("../assets/images/change-pin.png")}
        style={{ width: 130, height: 130, marginBottom: 24 }}
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
        Wealth Fix
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
          marginTop: 40,
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
          source={require("../assets/images/fam4.png")}
          style={{ width: 200, height: 200 }}
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
        Top Up successful!🥰
      </Text>

      <Text
        style={{
          color: "#6B7280",
          fontSize: 13,
          textAlign: "center",
          lineHeight: 21,
          marginBottom: 40,
          paddingHorizontal: 20,
        }}
      >
        Well done!!{" "}
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          WealthBuilder
        </Text>
        ,{"\n"}
        Your <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          {name}
        </Text>{" "}
        has been Top Up.{"\n"}
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          Current Balance: ₦XX,XXX.XX
        </Text>
      </Text>

      <ThemedButton
        title="Close"
        onPress={() => router.back()}
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
            ? "Top Up"
            : step === "pin"
              ? "Insert your Pin"
              : "Top Up successful"
        }
        onBack={() => {
          if (step === "pin") setStep("form");
          else router.back();
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {step === "form" && renderForm()}
        {step === "pin" && renderPin()}
        {step === "success" && renderSuccess()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
