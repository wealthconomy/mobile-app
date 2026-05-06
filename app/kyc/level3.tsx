import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, MapPin, Upload, X } from "lucide-react-native";
import { useState } from "react";
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const THEME_TEAL = "#155D5F";
const TEXT_MUTED = "#64748B";

export default function KYCLevel3Screen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [proofType, setProofType] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [showProofDropdown, setShowProofDropdown] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const proofTypes = [
    "Utility Bill (Electricity, Water, etc.)",
    "Bank Statement",
    "Rent Receipt",
    "Tax Assessment",
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const isFormValid = address && city && state && proofType && proofImage;

  const handleSubmit = () => {
    dispatch(updateKycLevel(3));
    setIsSuccess(true);
  };

  if (isSuccess) {
    return <SuccessState onDone={() => router.replace("/(tabs)")} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Address Verification" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            {/* 1. Progress Step Indicator */}
            <Animated.View entering={FadeInDown.duration(600).delay(100)} className="mb-8">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-[#155D5F] rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">2</Text>
                  </View>
                  <Text
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "800",
                      fontSize: 18,
                    }}
                  >
                    Address Info
                  </Text>
                </View>
                <Text
                  style={{ color: "#64748B", fontWeight: "700", fontSize: 13 }}
                >
                  Level 3 Verification
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: "#F1F5F9",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: THEME_TEAL,
                    borderRadius: 999,
                  }}
                />
              </View>
            </Animated.View>

            {/* 2. Address Details Form */}
            <Animated.View entering={FadeInDown.duration(600).delay(250)} className="mb-8">
              <Text className="text-[#1A1A1A] font-extrabold text-[15px] mb-4">
                Residential Address
              </Text>

              <View className="mb-5">
                <View className="h-16 bg-gray-50 border border-gray-100 rounded-2xl px-5 flex-row items-center">
                  <MapPin size={20} color={THEME_TEAL} className="mr-3" />
                  <TextInput
                    placeholder="Street Address"
                    placeholderTextColor="#adb5bd"
                    value={address}
                    onChangeText={setAddress}
                    className="flex-1 text-[#1A1A1A] font-bold text-[15px]"
                  />
                </View>
              </View>

              <View className="flex-row justify-between mb-5">
                <View className="w-[48%] h-16 bg-gray-50 border border-gray-100 rounded-2xl px-5 flex-row items-center">
                  <TextInput
                    placeholder="City"
                    placeholderTextColor="#adb5bd"
                    value={city}
                    onChangeText={setCity}
                    className="flex-1 text-[#1A1A1A] font-bold text-[15px]"
                  />
                </View>
                <View className="w-[48%] h-16 bg-gray-50 border border-gray-100 rounded-2xl px-5 flex-row items-center">
                  <TextInput
                    placeholder="State"
                    placeholderTextColor="#adb5bd"
                    value={state}
                    onChangeText={setState}
                    className="flex-1 text-[#1A1A1A] font-bold text-[15px]"
                  />
                </View>
              </View>
            </Animated.View>

            {/* 3. Proof of Address Type */}
            <Animated.View entering={FadeInDown.duration(600).delay(400)} className="mb-8">
              <Text className="text-[#1A1A1A] font-extrabold text-[15px] mb-4">
                Proof of Address
              </Text>
              <TouchableOpacity
                onPress={() => setShowProofDropdown(!showProofDropdown)}
                className="h-16 bg-gray-50 border border-gray-100 rounded-2xl px-5 flex-row items-center justify-between"
              >
                <Text
                  className={`font-bold text-[15px] ${proofType ? "text-[#1A1A1A]" : "text-gray-400"}`}
                >
                  {proofType || "Select Document Type"}
                </Text>
                <Ionicons
                  name={showProofDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={THEME_TEAL}
                />
              </TouchableOpacity>

              {showProofDropdown && (
                <View className="mt-3 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  {proofTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setProofType(type);
                        setShowProofDropdown(false);
                      }}
                      className="px-5 py-4 border-b border-gray-50 flex-row items-center justify-between"
                    >
                      <Text className="text-[#1A1A1A] font-bold text-[14px]">
                        {type}
                      </Text>
                      {proofType === type && (
                        <Check size={18} color={THEME_TEAL} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* 4. Proof Upload */}
            <Animated.View entering={FadeInDown.duration(600).delay(530)} className="mb-10">
              <Text className="text-[#1A1A1A] font-extrabold text-[15px] mb-4">
                Upload Document
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                className={`w-full h-56 rounded-[30px] border-2 border-dashed items-center justify-center overflow-hidden ${
                  proofImage
                    ? "border-[#155D5F] bg-white"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {proofImage ? (
                  <View className="w-full h-full relative">
                    <Image
                      source={{ uri: proofImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute top-4 right-4 bg-red-500 w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm"
                      onPress={(e) => {
                        e.stopPropagation();
                        setProofImage(null);
                      }}
                    >
                      <X size={20} color="white" />
                    </TouchableOpacity>
                    <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-3">
                      <Text className="text-white text-center text-[12px] font-bold">
                        Change Document
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="items-center px-10">
                    <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
                      <Upload size={32} color={THEME_TEAL} />
                    </View>
                    <Text className="text-[#1A1A1A] font-extrabold text-[16px]">
                      Upload Document
                    </Text>
                    <Text className="text-[#64748B] text-[12px] mt-2 text-center">
                      Please upload a clear copy of your utility bill or bank
                      statement
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(650)} className="mt-4 mb-12">
              <ThemedButton
                title="Complete Verification"
                onPress={handleSubmit}
                disabled={!isFormValid}
                style={{
                  backgroundColor: THEME_TEAL,
                  opacity: !isFormValid ? 0.6 : 1,
                  height: 60,
                  borderRadius: 20,
                  shadowColor: THEME_TEAL,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 15,
                  elevation: 8,
                }}
              />
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SuccessState({ onDone }: { onDone: () => void }) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "bottom"]}
    >
      <View className="flex-1 px-5 items-center justify-center">
        <Animated.View entering={FadeInUp.duration(700).delay(100)} className="w-72 h-72 relative items-center justify-center mb-10">
          <Image
            source={require("../../assets/images/success.png")}
            className="w-full h-full absolute opacity-40"
            resizeMode="contain"
          />
          <View className="w-36 h-36 bg-[#F2FFFF] rounded-full items-center justify-center shadow-md">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="checkmark" size={60} color={THEME_TEAL} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#1A1A1A",
              textAlign: "center",
              marginBottom: 16,
              paddingHorizontal: 16,
            }}
          >
            All Done!
          </Text>
          <Text
            style={{
              color: "#64748B",
              textAlign: "center",
              fontSize: 15,
              lineHeight: 26,
              marginBottom: 48,
              paddingHorizontal: 32,
              fontWeight: "500",
            }}
          >
            Your address verification documents have been submitted successfully.
            We'll review them and update your status within 24 hours.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(550)} style={{ width: "100%" }}>
          <ThemedButton
            title="Return to Dashboard"
            onPress={onDone}
            style={{
              backgroundColor: THEME_TEAL,
              width: "100%",
              height: 60,
              borderRadius: 20,
              shadowColor: THEME_TEAL,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 8,
            }}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
