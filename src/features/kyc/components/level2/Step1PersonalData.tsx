import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Level2Badge } from "./Level2Badge";
import {
  KycSectionHeader,
  KycFormInput,
  KycSelectTrigger,
  KycButton,
} from "@/src/components/common";

export interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  bvn: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
}

interface Step1PersonalDataProps {
  formData: FormData;
  onChange: (key: keyof FormData, value: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
}

const THEME_TEAL = "#155D5F";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const Step1PersonalData: React.FC<Step1PersonalDataProps> = ({
  formData,
  onChange,
  onContinue,
  onBack,
  isLoading = false,
  error,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(12);
  const [selectedMonth, setSelectedMonth] = useState(7); // August (0-indexed)
  const [selectedYear, setSelectedYear] = useState(1995);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [errors, setErrors] = useState<{ bvn?: string }>({});

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    setSelectedDay(day);
  };

  const confirmSelectedDate = () => {
    const formattedDay = String(selectedDay).padStart(2, "0");
    const formattedMonth = String(selectedMonth + 1).padStart(2, "0");
    onChange(
      "dateOfBirth",
      `${formattedDay} / ${formattedMonth} / ${selectedYear}`,
    );
    setShowDatePicker(false);
  };

  const validateAndContinue = () => {
    const newErrors: { bvn?: string } = {};
    const cleanBvn = formData.bvn.replace(/\D/g, "");

    if (cleanBvn.length !== 11) {
      newErrors.bvn = "BVN must be exactly 11 numeric digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onContinue();
  };

  const yearsList = Array.from({ length: 57 }, (_, i) => 2006 - i);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          {/* Top Silver #2 Medal Icon */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <Level2Badge />
          </View>

          {/* Section Header exactly matching Image 2 */}
          <KycSectionHeader
            title="KYC Level 2"
            subtitle="Complete your KYC registration to\nenable withdrawal"
            containerStyle={{ marginBottom: 26 }}
          />

          {/* Form Fields sitting directly on White Background matching Image 2 */}
          <View style={{ gap: 16 }}>
            {/* First Name (Uneditable) */}
            <KycFormInput
              label="First Name"
              value={formData.firstName}
              onChangeText={() => {}}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Enter first name"
              bgVariant="gray"
              inputContainerStyle={{ backgroundColor: "#E2E8F0", opacity: 0.85 }}
            />

            {/* Last Name (Uneditable) */}
            <KycFormInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={() => {}}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Enter last name"
              bgVariant="gray"
              inputContainerStyle={{ backgroundColor: "#E2E8F0", opacity: 0.85 }}
            />

            {/* Date of Birth matching Image 2 */}
            <KycSelectTrigger
              label="Date of Birth"
              value={formData.dateOfBirth}
              onPress={() => setShowDatePicker(true)}
              placeholder="DD / MM / YYYY"
              bgVariant="gray"
            />

            {/* BVN (Bank Verification Number) matching Image 2 */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#4B5563",
                  marginBottom: 6,
                }}
              >
                BVN (Bank Verification Number)
              </Text>
              <View
                style={{
                  height: 52,
                  backgroundColor: "#F6F8FA",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  borderWidth: errors.bvn ? 1.5 : 0,
                  borderColor: errors.bvn ? "#EF4444" : "transparent",
                }}
              >
                <TextInput
                  value={formData.bvn}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "").slice(0, 11);
                    onChange("bvn", cleaned);
                    if (errors.bvn)
                      setErrors((prev) => ({ ...prev, bvn: undefined }));
                  }}
                  keyboardType="numeric"
                  placeholder="Bank Verification Number"
                  placeholderTextColor="#94A3B8"
                  maxLength={11}
                  style={{ fontSize: 15, color: "#1A1A1A", fontWeight: "500" }}
                />
              </View>
              {errors.bvn && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#EF4444",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  {errors.bvn}
                </Text>
              )}
            </View>

            {/* Next of Kin Section matching Level 2 schema */}
            <View style={{ marginTop: 12, gap: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#1E293B" }}>
                Next of Kin Details
              </Text>

              <KycFormInput
                label="Next of Kin Full Name"
                value={formData.nextOfKinName || ""}
                onChangeText={(text) => onChange("nextOfKinName", text)}
                placeholder="Enter next of kin full name"
                bgVariant="gray"
              />

              <KycFormInput
                label="Relationship"
                value={formData.nextOfKinRelationship || ""}
                onChangeText={(text) => onChange("nextOfKinRelationship", text)}
                placeholder="e.g. Spouse, Sibling, Parent"
                bgVariant="gray"
              />

              <KycFormInput
                label="Next of Kin Phone Number"
                value={formData.nextOfKinPhone || ""}
                onChangeText={(text) => onChange("nextOfKinPhone", text)}
                placeholder="Enter next of kin phone number"
                keyboardType="phone-pad"
                bgVariant="gray"
              />
            </View>

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

            {/* Continue Button matching Image 2 */}
            <KycButton
              title="Continue"
              onPress={validateAndContinue}
              loading={isLoading}
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Calendar Modal Overlay */}
      <Modal
        transparent
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
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
            {/* Header: Month & Year Selector */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
              }}
            >
              <TouchableOpacity
                onPress={handlePrevMonth}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Ionicons name="chevron-back" size={22} color={THEME_TEAL} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowYearPicker(!showYearPicker)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "#1E293B" }}
                >
                  {MONTHS[selectedMonth]} {selectedYear}
                </Text>
                <Ionicons name="chevron-down" size={18} color={THEME_TEAL} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextMonth}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Ionicons name="chevron-forward" size={22} color={THEME_TEAL} />
              </TouchableOpacity>
            </View>

            {/* Year Dropdown Picker */}
            {showYearPicker ? (
              <View style={{ height: 260 }}>
                <ScrollView showsVerticalScrollIndicator={true}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      paddingBottom: 16,
                    }}
                  >
                    {yearsList.map((year) => (
                      <TouchableOpacity
                        key={year}
                        onPress={() => {
                          setSelectedYear(year);
                          setShowYearPicker(false);
                        }}
                        style={{
                          width: "30%",
                          paddingVertical: 10,
                          backgroundColor:
                            selectedYear === year ? THEME_TEAL : "#F8FAFC",
                          borderRadius: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: selectedYear === year ? "white" : "#334155",
                          }}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <>
                {/* Day of Week Headers */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginBottom: 10,
                  }}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <Text
                      key={day}
                      style={{
                        width: 38,
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#94A3B8",
                      }}
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {Array.from({ length: firstDay }).map((_, idx) => (
                    <View
                      key={`empty-${idx}`}
                      style={{ width: "14.28%", height: 42 }}
                    />
                  ))}

                  {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                    const dayNumber = idx + 1;
                    const isSelected = selectedDay === dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayNumber}
                        onPress={() => setSelectedDay(dayNumber)}
                        style={{
                          width: "14.28%",
                          height: 42,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: isSelected
                              ? THEME_TEAL
                              : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: isSelected ? "700" : "500",
                              color: isSelected ? "white" : "#1E293B",
                            }}
                          >
                            {dayNumber}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Bottom Actions */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  flex: 1,
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

              <TouchableOpacity
                onPress={confirmSelectedDate}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: THEME_TEAL,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "white" }}
                >
                  Confirm Date
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
