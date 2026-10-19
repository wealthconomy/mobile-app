import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Modal, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedButton } from "@/src/components/ThemedButton";
import { IdCardDisplay, IdCardData } from './IdCardDisplay';
import { DocumentUploadBox } from './DocumentUploadBox';
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { KycFormInput, KycSelectTrigger } from "@/src/components/common";
import { AlertCircle, Check, ChevronDown, Search, X } from "lucide-react-native";
import { NIGERIA_STATES } from "@/src/constants/nigeriaLocations";

export interface AddressFormData {
  streetAddress: string;
  city: string;
  state: string;
}

interface Props {
  scannedData: IdCardData;
  addressData: AddressFormData;
  setAddressData: React.Dispatch<React.SetStateAction<AddressFormData>>;
  proofOfAddress: string | null;
  proofOfAddressName?: string | null;
  passport: string | null;
  passportName?: string | null;
  setProofOfAddress: (uri: string | null, name?: string | null) => void;
  setPassport: (uri: string | null, name?: string | null) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string;
  passportStatus?: string;
  passportRejectionReason?: string | null;
  utilityStatus?: string;
  utilityRejectionReason?: string | null;
  overallRejectionReason?: string | null;
  isPassportReplaced?: boolean;
  isUtilityReplaced?: boolean;
}

const THEME_TEAL = "#155D5F";

export const Step1UploadCredentials: React.FC<Props> = ({
  scannedData,
  addressData,
  setAddressData,
  proofOfAddress,
  proofOfAddressName,
  passport,
  passportName,
  setProofOfAddress,
  setPassport,
  onConfirm,
  isLoading,
  error,
  passportStatus,
  passportRejectionReason,
  utilityStatus,
  utilityRejectionReason,
  overallRejectionReason,
  isPassportReplaced,
  isUtilityReplaced,
}) => {
  // Track touched state for real-time in-line validation
  const [touched, setTouched] = useState<{
    streetAddress?: boolean;
    state?: boolean;
    city?: boolean;
    proofOfAddress?: boolean;
    passport?: boolean;
  }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Check if documents were rejected and not yet replaced by user
  const isPassportRejected = passportStatus === "Rejected" && !isPassportReplaced;
  const isUtilityRejected = utilityStatus === "Rejected" && !isUtilityReplaced;

  // Modal states for State and City/LGA pickers
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityText, setCustomCityText] = useState("");

  // In-line field validators
  const validateStreet = (val: string): string | undefined => {
    const trimmed = val.trim();
    if (!trimmed) return "Street address is required";
    if (trimmed.length < 4) return "Street address must be at least 4 characters";
    return undefined;
  };

  const validateState = (val: string): string | undefined => {
    if (!val || !val.trim()) return "Please select your state";
    return undefined;
  };

  const validateCity = (val: string): string | undefined => {
    if (!val || !val.trim()) return "Please select your city / LGA";
    return undefined;
  };

  const validateProof = (doc: string | null): string | undefined => {
    if (!doc) return "Proof of address document is required";
    if (isUtilityRejected) {
      return `Proof of Address rejected (${utilityRejectionReason || "invalid"}). Please upload a new document.`;
    }
    return undefined;
  };

  const validatePassport = (doc: string | null): string | undefined => {
    if (!doc) return "International passport document is required";
    if (isPassportRejected) {
      return `Passport rejected (${passportRejectionReason || "blurry or illegible"}). Please upload a clear photo.`;
    }
    return undefined;
  };

  // Real-time in-line errors: active once touched or upon submit attempt
  const inlineStreetError = (touched.streetAddress || hasAttemptedSubmit)
    ? validateStreet(addressData.streetAddress)
    : undefined;

  const inlineStateError = (touched.state || hasAttemptedSubmit)
    ? validateState(addressData.state)
    : undefined;

  const inlineCityError = (touched.city || hasAttemptedSubmit)
    ? validateCity(addressData.city)
    : undefined;

  const inlineProofError = (touched.proofOfAddress || hasAttemptedSubmit)
    ? validateProof(proofOfAddress)
    : undefined;

  const inlinePassportError = (touched.passport || hasAttemptedSubmit)
    ? validatePassport(passport)
    : undefined;

  const pickProofOfAddress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setProofOfAddress(result.assets[0].uri, result.assets[0].name);
        setTouched((prev) => ({ ...prev, proofOfAddress: true }));
      }
    } catch (err) {
      console.log("Error picking proof of address:", err);
    }
  };

  const pickPassport = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setPassport(
          result.assets[0].uri,
          result.assets[0].fileName || "passport.jpg"
        );
        setTouched((prev) => ({ ...prev, passport: true }));
      }
    } catch (err) {
      console.log("Error picking passport image:", err);
    }
  };

  // Filtered Nigerian States
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return NIGERIA_STATES;
    return NIGERIA_STATES.filter((s) => s.name.toLowerCase().includes(q));
  }, [stateSearch]);

  // Current State and filtered LGAs
  const currentStateObj = useMemo(() => {
    if (!addressData.state) return null;
    return (
      NIGERIA_STATES.find(
        (s) => s.name.toLowerCase() === addressData.state.trim().toLowerCase()
      ) || null
    );
  }, [addressData.state]);

  const availableLgas = useMemo(() => {
    if (!currentStateObj) return [];
    const q = citySearch.trim().toLowerCase();
    if (!q) return currentStateObj.lgas;
    return currentStateObj.lgas.filter((lga) =>
      lga.toLowerCase().includes(q)
    );
  }, [currentStateObj, citySearch]);

  const handleSelectState = (stateName: string) => {
    setAddressData((prev) => ({
      ...prev,
      state: stateName,
      // If new state doesn't have current city, reset it
      city: "",
    }));
    setTouched((prev) => ({ ...prev, state: true }));
    setShowStateModal(false);
    setStateSearch("");
    // Automatically transition to City/LGA picker for smooth UX
    setTimeout(() => {
      setShowCityModal(true);
    }, 200);
  };

  const handleSelectCity = (cityName: string) => {
    setAddressData((prev) => ({
      ...prev,
      city: cityName,
    }));
    setTouched((prev) => ({ ...prev, city: true }));
    setShowCityModal(false);
    setCitySearch("");
    setIsCustomCity(false);
  };

  const handleSaveCustomCity = () => {
    if (customCityText.trim()) {
      setAddressData((prev) => ({
        ...prev,
        city: customCityText.trim(),
      }));
      setTouched((prev) => ({ ...prev, city: true }));
      setShowCityModal(false);
      setCitySearch("");
      setIsCustomCity(false);
      setCustomCityText("");
    }
  };

  // Helper to get array of missing requirements
  const missingItems = useMemo(() => {
    const list: string[] = [];
    if (!addressData.streetAddress.trim() || addressData.streetAddress.trim().length <= 3) {
      list.push("Street Address");
    }
    if (!addressData.state.trim() || addressData.state.trim().length <= 1) {
      list.push("State");
    }
    if (!addressData.city.trim() || addressData.city.trim().length <= 1) {
      list.push("City / LGA");
    }
    if (!proofOfAddress) {
      list.push("Proof of Address");
    } else if (isUtilityRejected) {
      list.push("New Proof of Address (rejected)");
    }
    if (!passport) {
      list.push("International Passport");
    } else if (isPassportRejected) {
      list.push("New International Passport (rejected)");
    }
    return list;
  }, [addressData, proofOfAddress, passport, isPassportRejected, isUtilityRejected]);

  const handlePressSubmit = () => {
    setHasAttemptedSubmit(true);
    setTouched({
      streetAddress: true,
      state: true,
      city: true,
      proofOfAddress: true,
      passport: true,
    });

    const isStreetValid = !validateStreet(addressData.streetAddress);
    const isStateValid = !validateState(addressData.state);
    const isCityValid = !validateCity(addressData.city);
    const isProofValid = !validateProof(proofOfAddress);
    const isPassportValid = !validatePassport(passport);

    if (!isStreetValid || !isStateValid || !isCityValid || !isProofValid || !isPassportValid) {
      return;
    }

    onConfirm();
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white">
      <View className="px-6 py-6 pb-12 mt-4">
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="items-center mb-8 mt-2">
           <Text className="text-[28px] font-bold text-[#155D5F] mb-2">KYC Level 3</Text>
           <Text className="text-[#64748B] text-[15px] text-center px-4 leading-5">
              Complete your 3rd KYC registration to unlock unlimited limits and global wealth features
           </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
           <IdCardDisplay data={scannedData} />
        </Animated.View>

        {/* Global Rejection Notice Banner */}
        {(isPassportRejected || isUtilityRejected || overallRejectionReason) && (
          <Animated.View entering={FadeInDown.duration(600).delay(250)} className="mt-4 mb-2">
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FCA5A5",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <AlertCircle size={20} color="#DC2626" />
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#991B1B" }}>
                  Action Required: Document Rejected
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 18 }}>
                {isPassportRejected && passportRejectionReason
                  ? `Your International Passport was rejected: "${passportRejectionReason}". Please upload a clearer copy.`
                  : isUtilityRejected && utilityRejectionReason
                  ? `Your Proof of Address was rejected: "${utilityRejectionReason}". Please upload a new document.`
                  : overallRejectionReason || "One or more documents were rejected. Please review and re-upload."}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Residential Address Details Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} className="mt-2 mb-6">
           <Text className="text-[#155D5F] font-bold text-[18px] mb-1">
             Residential Address
           </Text>
           <Text className="text-[#64748B] text-[13px] mb-4">
             Enter your current residential address as shown on your utility bill
           </Text>

           <View className="gap-y-3.5">
             <KycFormInput
               label="Street Address"
               value={addressData.streetAddress}
               onChangeText={(text) => {
                 setAddressData((prev) => ({ ...prev, streetAddress: text }));
                 setTouched((prev) => ({ ...prev, streetAddress: true }));
               }}
               onBlur={() => {
                 setTouched((prev) => ({ ...prev, streetAddress: true }));
               }}
               error={inlineStreetError}
               placeholder="e.g. 15 Adeleke Street, Victoria Island"
               bgVariant="gray"
             />

             <View className="flex-row gap-3">
               <View className="flex-1">
                 <KycSelectTrigger
                   label="State"
                   value={addressData.state}
                   placeholder="Select State"
                   error={inlineStateError}
                   onPress={() => {
                     setTouched((prev) => ({ ...prev, state: true }));
                     setShowStateModal(true);
                   }}
                   bgVariant="gray"
                   rightElement={<ChevronDown size={18} color="#94A3B8" />}
                 />
               </View>

               <View className="flex-1">
                 <KycSelectTrigger
                   label="City / LGA"
                   value={addressData.city}
                   placeholder={addressData.state ? "Select City" : "State first"}
                   error={inlineCityError}
                   onPress={() => {
                     setTouched((prev) => ({ ...prev, city: true }));
                     if (!addressData.state) {
                       setShowStateModal(true);
                     } else {
                       setShowCityModal(true);
                     }
                   }}
                   bgVariant="gray"
                   rightElement={<ChevronDown size={18} color="#94A3B8" />}
                 />
               </View>
             </View>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(400)} className="mt-2 mb-4">
           <Text className="text-[#155D5F] font-bold text-[18px] mb-1">
             Upload Verification Documents
           </Text>
           <Text className="text-[#64748B] text-[13px] mb-4">
             Utility bills (electricity, water, waste) must be dated within the last 3 months
           </Text>

           <DocumentUploadBox 
              label="Proof of Address (Utility Bill, Bank Statement)" 
              imageUri={proofOfAddress}
              fileName={proofOfAddressName}
              error={inlineProofError}
              status={isUtilityReplaced ? "Pending" : utilityStatus}
              rejectionReason={utilityRejectionReason}
              onPick={pickProofOfAddress} 
              onRemove={() => {
                setProofOfAddress(null, null);
                setTouched((prev) => ({ ...prev, proofOfAddress: true }));
              }} 
           />

           <DocumentUploadBox 
              label="International Passport" 
              imageUri={passport}
              fileName={passportName}
              error={inlinePassportError}
              status={isPassportReplaced ? "Pending" : passportStatus}
              rejectionReason={passportRejectionReason}
              onPick={pickPassport} 
              onRemove={() => {
                setPassport(null, null);
                setTouched((prev) => ({ ...prev, passport: true }));
              }} 
           />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)} className="mt-4">
           {error ? (
             <View
               style={{
                 backgroundColor: "#FEF2F2",
                 borderWidth: 1,
                 borderColor: "#FCA5A5",
                 borderRadius: 12,
                 paddingHorizontal: 14,
                 paddingVertical: 10,
                 marginBottom: 12,
               }}
             >
               <Text style={{ color: "#B91C1C", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                 {error}
               </Text>
             </View>
           ) : null}

           {missingItems.length > 0 && (
             <View
               style={{
                 flexDirection: "row",
                 alignItems: "center",
                 backgroundColor: "#F8FAFC",
                 borderWidth: 1,
                 borderColor: "#E2E8F0",
                 borderRadius: 12,
                 paddingHorizontal: 14,
                 paddingVertical: 10,
                 marginBottom: 14,
                 gap: 8,
               }}
             >
               <AlertCircle size={16} color="#64748B" />
               <Text style={{ flex: 1, fontSize: 12, color: "#64748B", fontWeight: "500", lineHeight: 16 }}>
                 Required before submit:{" "}
                 <Text style={{ color: "#0F172A", fontWeight: "600" }}>{missingItems.join(", ")}</Text>
               </Text>
             </View>
           )}

           <ThemedButton
             title="Confirm & Submit"
             onPress={handlePressSubmit}
             disabled={isLoading}
             loading={isLoading}
             style={{
               backgroundColor: THEME_TEAL,
               opacity: missingItems.length > 0 || isLoading ? 0.75 : 1,
               height: 56,
               borderRadius: 16,
             }}
           />
        </Animated.View>
      </View>

      {/* STATE SELECTION MODAL */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: 32,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E293B" }}>
                Select State
              </Text>
              <TouchableOpacity
                onPress={() => setShowStateModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 14,
                paddingHorizontal: 12,
                height: 46,
                marginBottom: 14,
              }}
            >
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#1E293B" }}
                placeholder="Search state..."
                placeholderTextColor="#94A3B8"
                value={stateSearch}
                onChangeText={setStateSearch}
                autoCorrect={false}
              />
              {stateSearch ? (
                <TouchableOpacity onPress={() => setStateSearch("")}>
                  <X size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* State List */}
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.name}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = addressData.state.toLowerCase() === item.name.toLowerCase();
                return (
                  <TouchableOpacity
                    onPress={() => handleSelectState(item.name)}
                    activeOpacity={0.7}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isSelected ? "#F2FFFF" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: isSelected ? "700" : "500",
                        color: isSelected ? THEME_TEAL : "#334155",
                      }}
                    >
                      {item.name}
                    </Text>
                    {isSelected ? <Check size={18} color={THEME_TEAL} strokeWidth={2.5} /> : null}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />
              )}
              style={{ maxHeight: 360 }}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>

      {/* CITY / LGA SELECTION MODAL */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCityModal(false);
          setIsCustomCity(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: 32,
              maxHeight: "80%",
            }}
          >
            {/* Modal Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E293B" }}>
                  Select City / LGA
                </Text>
                {addressData.state ? (
                  <Text style={{ fontSize: 12, fontWeight: "600", color: THEME_TEAL, marginTop: 2 }}>
                    in {addressData.state} State
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowCityModal(false);
                  setIsCustomCity(false);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isCustomCity ? (
              /* Custom City / Town Input */
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 10, fontWeight: "500" }}>
                  Can't find your LGA? Type your town or city name:
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#CBD5E1",
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 50,
                    fontSize: 15,
                    color: "#1E293B",
                    marginBottom: 14,
                  }}
                  placeholder="e.g. Victoria Island, Lekki Phase 1"
                  placeholderTextColor="#94A3B8"
                  value={customCityText}
                  onChangeText={setCustomCityText}
                  autoFocus
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setIsCustomCity(false)}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "#F1F5F9",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#475569" }}>
                      Back to list
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveCustomCity}
                    disabled={!customCityText.trim()}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: THEME_TEAL,
                      opacity: customCityText.trim() ? 1 : 0.6,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
                      Save City
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Search Input */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    height: 46,
                    marginBottom: 12,
                  }}
                >
                  <Search size={18} color="#94A3B8" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#1E293B" }}
                    placeholder="Search city or LGA..."
                    placeholderTextColor="#94A3B8"
                    value={citySearch}
                    onChangeText={setCitySearch}
                    autoCorrect={false}
                  />
                  {citySearch ? (
                    <TouchableOpacity onPress={() => setCitySearch("")}>
                      <X size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* City/LGA List */}
                <FlatList
                  data={availableLgas}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const isSelected = addressData.city.toLowerCase() === item.toLowerCase();
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelectCity(item)}
                        activeOpacity={0.7}
                        style={{
                          paddingVertical: 14,
                          paddingHorizontal: 14,
                          borderRadius: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: isSelected ? "#F2FFFF" : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected ? THEME_TEAL : "#334155",
                          }}
                        >
                          {item}
                        </Text>
                        {isSelected ? <Check size={18} color={THEME_TEAL} strokeWidth={2.5} /> : null}
                      </TouchableOpacity>
                    );
                  }}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />
                  )}
                  style={{ maxHeight: 320 }}
                  showsVerticalScrollIndicator={true}
                  ListFooterComponent={() => (
                    <TouchableOpacity
                      onPress={() => {
                        setIsCustomCity(true);
                        setCustomCityText("");
                      }}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 14,
                        marginTop: 8,
                        borderRadius: 12,
                        backgroundColor: "#F8FAFC",
                        borderWidth: 1,
                        borderStyle: "dashed",
                        borderColor: "#CBD5E1",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: THEME_TEAL }}>
                        + Type other city or town name
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
