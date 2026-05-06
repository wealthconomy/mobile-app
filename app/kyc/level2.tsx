import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, FileText, IdCard, Upload, X } from "lucide-react-native";
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
const SOFT_TEAL = "#F2FFFF";

export default function KYCLevel2Screen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [docType, setDocType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);

  const docOptions = [
    {
      id: "nin",
      label: "National ID (NIN)",
      icon: <IdCard size={24} color={THEME_TEAL} />,
    },
    {
      id: "passport",
      label: "International Passport",
      icon: <FileText size={24} color={THEME_TEAL} />,
    },
    {
      id: "license",
      label: "Driver's License",
      icon: <IdCard size={24} color={THEME_TEAL} />,
    },
    {
      id: "voter",
      label: "Voter's Card",
      icon: <FileText size={24} color={THEME_TEAL} />,
    },
  ];

  const pickImage = async (setter: (uri: string | null) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setSelfieImage(result.assets[0].uri);
    }
  };

  const isFormValid =
    docType && idNumber && frontImage && backImage && selfieImage;

  const handleSubmit = () => {
    dispatch(updateKycLevel(2));
    setIsSuccess(true);
  };

  if (isSuccess) {
    return <SuccessState onDone={() => router.replace("/(tabs)")} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Header title="Identity Verification" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
            {/* 1. Progress Step Indicator */}
            <Animated.View entering={FadeInDown.duration(600).delay(100)} style={{ marginBottom: 32 }}>
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
                      1
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#1A1A1A",
                      fontWeight: "800",
                      fontSize: 18,
                    }}
                  >
                    Identity Info
                  </Text>
                </View>
                <Text
                  style={{ color: "#64748B", fontWeight: "700", fontSize: 13 }}
                >
                  Level 2 Verification
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

            {/* 2. Document Selection */}
            <Animated.View entering={FadeInDown.duration(600).delay(250)} style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Select Document Type
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {docOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setDocType(opt.label)}
                    style={{
                      width: "48%",
                      padding: 20,
                      borderRadius: 16,
                      marginBottom: 16,
                      borderWidth: 2,
                      alignItems: "center",
                      justifyContent: "center",
                      height: 110,
                      borderColor:
                        docType === opt.label ? THEME_TEAL : "#F1F5F9",
                      backgroundColor:
                        docType === opt.label ? SOFT_TEAL : "#F9FAFB",
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "white",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      {opt.icon}
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        textAlign: "center",
                        color: docType === opt.label ? THEME_TEAL : "#64748B",
                      }}
                    >
                      {opt.label}
                    </Text>
                    {docType === opt.label && (
                      <View style={{ position: "absolute", top: 8, right: 8 }}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={THEME_TEAL}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* 3. ID Number Input */}
            <Animated.View entering={FadeInDown.duration(600).delay(400)} style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Document Number
              </Text>
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
                <TextInput
                  placeholder="Enter Government ID Number"
                  placeholderTextColor="#adb5bd"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  style={{
                    flex: 1,
                    color: "#1A1A1A",
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                />
              </View>
            </Animated.View>

            {/* 4. Upload Section */}
            <Animated.View entering={FadeInDown.duration(600).delay(500)} style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Upload ID Photos
              </Text>

              {/* Front View - Full Width */}
              <FullWidthUploadBox
                label="Front View"
                image={frontImage}
                onPress={() => pickImage(setFrontImage)}
                onClear={() => setFrontImage(null)}
              />

              {/* Back View - Full Width */}
              <FullWidthUploadBox
                label="Back View"
                image={backImage}
                onPress={() => pickImage(setBackImage)}
                onClear={() => setBackImage(null)}
              />
            </Animated.View>

            {/* 5. Selfie / Personal Verification */}
            <Animated.View entering={FadeInDown.duration(600).delay(580)} style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontWeight: "800",
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                Personal Verification
              </Text>

              <TouchableOpacity
                onPress={takeSelfie}
                activeOpacity={0.8}
                style={{
                  width: "100%",
                  height: 220,
                  backgroundColor: "#F9FAFB",
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: selfieImage ? THEME_TEAL : "#D1D5DB",
                  borderRadius: 24,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selfieImage ? (
                  <View style={{ width: "100%", height: "100%" }}>
                    <Image
                      source={{ uri: selfieImage }}
                      style={{ width: "100%", height: "100%" }}
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
                        setSelfieImage(null);
                      }}
                    >
                      <X size={18} color="white" />
                    </TouchableOpacity>
                    {/* Retake overlay */}
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
                        Tap to Retake Selfie
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingHorizontal: 32 }}>
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        backgroundColor: "white",
                        borderRadius: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                        shadowColor: "#000",
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Camera size={32} color={THEME_TEAL} />
                    </View>

                    <Text
                      style={{
                        color: "#1A1A1A",
                        fontWeight: "800",
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      Snap a Selfie
                    </Text>
                    <Text
                      style={{
                        color: "#64748B",
                        fontSize: 12,
                        textAlign: "center",
                        lineHeight: 18,
                      }}
                    >
                      Ensure your face is within the frame and clearly lit
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* 6. Submit Button */}
            <Animated.View entering={FadeInDown.duration(600).delay(650)} style={{ marginTop: 8, marginBottom: 48 }}>
              <ThemedButton
                title="Submit for Verification"
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
              <Text
                style={{
                  color: "#64748B",
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 20,
                  lineHeight: 18,
                  paddingHorizontal: 24,
                }}
              >
                Your data is encrypted and secure. By proceeding, you agree to
                our verification terms.
              </Text>
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
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          entering={FadeInUp.duration(700).delay(100)}
          style={{
            width: 288,
            height: 288,
            position: "relative",
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
              backgroundColor: "#F2FFFF",
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
              }}
            >
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
          Level 2 Complete!
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
          Your identity verification has been submitted. You can now return to
          the dashboard while we process your request.
        </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(550)} style={{ width: "100%" }}>
        <ThemedButton
          title="Return to HomeScreen"
          onPress={onDone}
          style={{
            backgroundColor: THEME_TEAL,
            width: "100%",
            height: 60,
            borderRadius: 20,
            elevation: 8,
          }}
        />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ✅ Full width upload box used for both Front and Back
function FullWidthUploadBox({
  label,
  image,
  onPress,
  onClear,
}: {
  label: string;
  image: string | null;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: "100%",
        height: 160,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: image ? THEME_TEAL : "#D1D5DB",
        backgroundColor: image ? "#F2FFFF" : "#F9FAFB",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16, // 👈 gap between front and back
      }}
    >
      {image ? (
        <View style={{ width: "100%", height: "100%" }}>
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {/* Clear button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "#EF4444",
              width: 30,
              height: 30,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "white",
              zIndex: 10,
            }}
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <X size={14} color="white" />
          </TouchableOpacity>
          {/* Label overlay */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              paddingVertical: 8,
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
              {label}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: "white",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Upload size={22} color={THEME_TEAL} />
          </View>
          <Text style={{ color: "#1A1A1A", fontWeight: "700", fontSize: 14 }}>
            {label}
          </Text>
          <Text style={{ color: "#64748B", fontSize: 11, marginTop: 4 }}>
            Tap to upload
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
