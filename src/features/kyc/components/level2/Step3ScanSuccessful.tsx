import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  KycSectionHeader,
  FloatingCardPreview,
  KycFormInput,
  KycSelectTrigger,
  KycButton,
} from "@/src/components/common";

const ACTUAL_ID_FALLBACK_URI =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80";

const ID_TYPES = [
  "National Identification",
  "NIN Slip",
  "Driver's License",
  "International Passport",
];

export interface ScannedData {
  firstName: string;
  dateOfBirth: string;
  idType: string;
  nin: string;
  expires: string;
}

interface Step3ScanSuccessfulProps {
  initialData?: ScannedData;
  photoUri?: string;
  onConfirm: (data: ScannedData) => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
}

const THEME_TEAL = "#155D5F";

export const Step3ScanSuccessful: React.FC<Step3ScanSuccessfulProps> = ({
  initialData = {
    firstName: "",
    dateOfBirth: "",
    idType: "",
    nin: "",
    expires: "",
  },
  photoUri,
  onConfirm,
  isLoading = false,
  error,
}) => {
  const [data, setData] = useState<ScannedData>(initialData);
  const [showIdTypeModal, setShowIdTypeModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (key: keyof ScannedData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          {/* Header Title & Subtitle exactly matching Image 2 */}
          <KycSectionHeader
            title="Scanning successful"
            subtitle="Please check your data before\nsubmitting it"
          />

          {/* Overhanging Floating ID Card Thumbnail Area */}
          <FloatingCardPreview
            imageUri={photoUri || ACTUAL_ID_FALLBACK_URI}
            fallbackUri={ACTUAL_ID_FALLBACK_URI}
          />

          {/* Scanning data Section Title */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: THEME_TEAL,
              marginBottom: 14,
              paddingHorizontal: 4,
            }}
          >
            Scanning data
          </Text>

          {/* Large Outer Gray Form Wrapper Card (#F6F8FA) matching Image 2 100% */}
          <View
            style={{
              backgroundColor: "#F6F8FA",
              borderRadius: 26,
              paddingTop: 20,
              paddingBottom: 22,
              paddingHorizontal: 18,
              gap: 16,
            }}
          >
            {/* First Name */}
            <KycFormInput
              label="First Name"
              value={data.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
              bgVariant="white"
            />

            {/* Date of Birth */}
            <KycFormInput
              label="Date of Birth"
              value={data.dateOfBirth}
              onChangeText={(text) => handleChange("dateOfBirth", text)}
              bgVariant="white"
            />

            {/* ID Type */}
            <KycSelectTrigger
              label="ID Type"
              value={data.idType}
              onPress={() => setShowIdTypeModal(true)}
              bgVariant="white"
            />

            {/* National Identification Number (NIN) */}
            <KycFormInput
              label="National Identification Number (NIN)"
              value={data.nin}
              onChangeText={(text) => handleChange("nin", text)}
              bgVariant="white"
            />

            {/* Expires */}
            <KycFormInput
              label="Expires"
              value={data.expires}
              onChangeText={(text) => handleChange("expires", text)}
              bgVariant="white"
            />

            {/* API Error Display */}
            {error ? (
              <Text
                style={{
                  fontSize: 13,
                  color: "#EF4444",
                  marginTop: 8,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            ) : null}

            {/* Confirm Button exactly matching Image 2 inside outer container */}
            <KycButton
              title="Confirm"
              onPress={() => onConfirm(data)}
              loading={isLoading}
              style={{ marginTop: 10 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ID Type Dropdown Modal */}
      <Modal
        transparent
        visible={showIdTypeModal}
        animationType="fade"
        onRequestClose={() => setShowIdTypeModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 24,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1E293B",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Select ID Document Type
            </Text>

            <View style={{ gap: 12 }}>
              {ID_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    handleChange("idType", type);
                    setShowIdTypeModal(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor:
                      data.idType === type ? THEME_TEAL : "#F8FAFC",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: data.idType === type ? "white" : "#334155",
                    }}
                  >
                    {type}
                  </Text>
                  {data.idType === type && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowIdTypeModal(false)}
              style={{
                marginTop: 20,
                height: 48,
                borderRadius: 14,
                backgroundColor: "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#475569" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
