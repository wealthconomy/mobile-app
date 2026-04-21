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
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

const THEME_TEAL = "#155D5F";
const SOFT_TEAL = "#F2FFFF";
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
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
            {/* 1. Progress Step Indicator */}
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: THEME_TEAL,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      2
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    Address Info
                  </Text>
                </View>
                <Text
                  style={{ color: TEXT_MUTED, fontWeight: "700", fontSize: 13 }}
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
            </View>

            {/* 2. Address Details Form */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Residential Address
              </Text>

              {/* Street Address */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    height: 64,
                    backgroundColor: "#F9FAFB",
                    borderWidth: 1,
                    borderColor: "#F1F5F9",
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MapPin
                    size={20}
                    color={THEME_TEAL}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    placeholder="Street Address"
                    placeholderTextColor="#adb5bd"
                    value={address}
                    onChangeText={setAddress}
                    style={{
                      flex: 1,
                      color: "#1A1A1A",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>

              {/* City & State Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    width: "48%",
                    height: 64,
                    backgroundColor: "#F9FAFB",
                    borderWidth: 1,
                    borderColor: "#F1F5F9",
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    placeholder="City"
                    placeholderTextColor="#adb5bd"
                    value={city}
                    onChangeText={setCity}
                    style={{
                      flex: 1,
                      color: "#1A1A1A",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  />
                </View>
                <View
                  style={{
                    width: "48%",
                    height: 64,
                    backgroundColor: "#F9FAFB",
                    borderWidth: 1,
                    borderColor: "#F1F5F9",
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    placeholder="State"
                    placeholderTextColor="#adb5bd"
                    value={state}
                    onChangeText={setState}
                    style={{
                      flex: 1,
                      color: "#1A1A1A",
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* 3. Proof of Address Type Dropdown */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Proof of Address
              </Text>

              <TouchableOpacity
                onPress={() => setShowProofDropdown(!showProofDropdown)}
                style={{
                  height: 64,
                  backgroundColor: "#F9FAFB",
                  borderWidth: 1,
                  borderColor: "#F1F5F9",
                  borderRadius: 16,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 15,
                    color: proofType ? "#1A1A1A" : "#adb5bd",
                  }}
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
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "#F1F5F9",
                    borderRadius: 16,
                    overflow: "hidden",
                    elevation: 4,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                  }}
                >
                  {proofTypes.map((type, index) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setProofType(type);
                        setShowProofDropdown(false);
                      }}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottomWidth:
                          index < proofTypes.length - 1 ? 1 : 0,
                        borderBottomColor: "#F9FAFB",
                      }}
                    >
                      <Text
                        style={{
                          color: "#1A1A1A",
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        {type}
                      </Text>
                      {proofType === type && (
                        <Check size={18} color={THEME_TEAL} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 4. Upload Document - Full Width */}
            <View style={{ marginBottom: 40 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "600",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Upload Document
              </Text>

              <View style={{ width: "100%", height: 160 }}>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.8}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 24,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: proofImage ? THEME_TEAL : "#D1D5DB",
                    backgroundColor: proofImage ? SOFT_TEAL : "#F9FAFB",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {proofImage ? (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{ uri: proofImage }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                        resizeMode="cover"
                      />
                      {/* Clear button */}
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: "#EF4444",
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 3,
                          borderColor: "white",
                          zIndex: 10,
                        }}
                        onPress={(e) => {
                          e.stopPropagation();
                          setProofImage(null);
                        }}
                      >
                        <X size={18} color="white" />
                      </TouchableOpacity>
                      {/* Bottom overlay */}
                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          paddingVertical: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          Tap to Change Document
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{ alignItems: "center", paddingHorizontal: 32 }}
                    >
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          backgroundColor: "white",
                          borderRadius: 28,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                          shadowColor: "#000",
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        <Upload size={26} color={THEME_TEAL} />
                      </View>
                      <Text
                        style={{
                          color: "#1A1A1A",
                          fontWeight: "800",
                          fontSize: 15,
                          marginBottom: 6,
                        }}
                      >
                        Upload Document
                      </Text>
                      <Text
                        style={{
                          color: TEXT_MUTED,
                          fontSize: 11,
                          textAlign: "center",
                          lineHeight: 17,
                        }}
                      >
                        Upload a clear copy of your utility bill or bank
                        statement
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Submit Button */}
            <View style={{ marginTop: 8, marginBottom: 48 }}>
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
            </View>
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
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 288,
            height: 288,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <Image
            source={require("../../assets/images/success.png")}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              opacity: 0.4,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              width: 144,
              height: 144,
              backgroundColor: SOFT_TEAL,
              borderRadius: 72,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                backgroundColor: "white",
                borderRadius: 48,
                alignItems: "center",
                justifyContent: "center",
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="checkmark" size={60} color={THEME_TEAL} />
            </View>
          </View>
        </View>

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
            color: TEXT_MUTED,
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

        <ThemedButton
          title="Return to HomeScreen"
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
      </View>
    </SafeAreaView>
  );
}
