import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const THEME = "#155D5F";

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

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export interface AppCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  selectedDate?: Date | null;
  onSelectDate: (date: Date) => void;
  /**
   * Minimum selectable date. All dates strictly before this date will be disabled.
   * Defaults to today at 00:00:00.
   */
  minDate?: Date;
  /**
   * Maximum selectable date. All dates strictly after this date will be disabled.
   */
  maxDate?: Date;
}

export function AppCalendarModal({
  visible,
  onClose,
  title = "Select Date",
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
}: AppCalendarModalProps) {
  // Normalize min/max dates to midnight
  const normalizedMin = minDate ? new Date(minDate) : new Date();
  normalizedMin.setHours(0, 0, 0, 0);

  const normalizedMax = maxDate ? new Date(maxDate) : undefined;
  if (normalizedMax) {
    normalizedMax.setHours(23, 59, 59, 999);
  }

  const [internalDate, setInternalDate] = useState<Date>(() => {
    let initial = selectedDate ? new Date(selectedDate) : new Date();
    if (normalizedMin && initial < normalizedMin) {
      initial = new Date(normalizedMin);
    }
    return initial;
  });

  const [calViewDate, setCalViewDate] = useState<Date>(() => {
    let initial = selectedDate ? new Date(selectedDate) : new Date();
    if (normalizedMin && initial < normalizedMin) {
      initial = new Date(normalizedMin);
    }
    return initial;
  });

  const [calMode, setCalMode] = useState<"days" | "months" | "years">("days");

  useEffect(() => {
    if (visible) {
      let initial = selectedDate ? new Date(selectedDate) : new Date();
      if (normalizedMin && initial < normalizedMin) {
        initial = new Date(normalizedMin);
      }
      setInternalDate(initial);
      setCalViewDate(new Date(initial));
      setCalMode("days");
    }
  }, [visible, selectedDate]);

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    (new Date(year, month, 1).getDay() + 6) % 7;

  const isPrevMonthDisabled =
    normalizedMin &&
    (calViewDate.getFullYear() < normalizedMin.getFullYear() ||
      (calViewDate.getFullYear() === normalizedMin.getFullYear() &&
        calViewDate.getMonth() <= normalizedMin.getMonth()));

  const renderCalendarGrid = () => {
    const month = calViewDate.getMonth();
    const year = calViewDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const days: React.ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View
          key={`empty-${i}`}
          style={{ width: "14.28%" as any, aspectRatio: 1 }}
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const isBeforeMin = normalizedMin && cellDate < normalizedMin;
      const isAfterMax = normalizedMax && cellDate > normalizedMax;
      const isDisabled = isBeforeMin || isAfterMax;

      const isSelected =
        internalDate &&
        internalDate.getDate() === day &&
        internalDate.getMonth() === month &&
        internalDate.getFullYear() === year;

      days.push(
        <TouchableOpacity
          key={day}
          disabled={isDisabled}
          onPress={() => {
            const picked = new Date(year, month, day);
            setInternalDate(picked);
          }}
          style={{
            width: "14.28%" as any,
            aspectRatio: 1,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
            backgroundColor: isSelected ? THEME : "transparent",
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: isSelected ? "700" : "500",
              color: isSelected
                ? "#FFFFFF"
                : isDisabled
                ? "#D1D5DB"
                : "#1A1A1A",
            }}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          {DAY_NAMES.map((d) => (
            <Text
              key={d}
              style={{
                width: "14.28%" as any,
                textAlign: "center",
                fontSize: 13,
                fontWeight: "600",
                color: "#6B7280",
              }}
            >
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>{days}</View>
      </View>
    );
  };

  const renderMonthSelector = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        {MONTHS.map((m, idx) => {
          const isMonthDisabled =
            normalizedMin &&
            (calViewDate.getFullYear() < normalizedMin.getFullYear() ||
              (calViewDate.getFullYear() === normalizedMin.getFullYear() &&
                idx < normalizedMin.getMonth()));

          const isSelected = calViewDate.getMonth() === idx;
          return (
            <TouchableOpacity
              key={m}
              disabled={isMonthDisabled}
              onPress={() => {
                const d = new Date(calViewDate);
                d.setMonth(idx);
                setCalViewDate(d);
                setCalMode("days");
              }}
              style={{
                width: "30%",
                paddingVertical: 12,
                marginBottom: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? THEME : "#F8F8F8",
                borderRadius: 12,
                opacity: isMonthDisabled ? 0.35 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? "700" : "600",
                  color: isSelected
                    ? "#FFFFFF"
                    : isMonthDisabled
                    ? "#9CA3AF"
                    : "#1A1A1A",
                }}
              >
                {m.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderYearSelector = () => {
    const minYear = normalizedMin
      ? normalizedMin.getFullYear()
      : new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => minYear + i);

    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        {years.map((yr) => {
          const isSelected = calViewDate.getFullYear() === yr;
          return (
            <TouchableOpacity
              key={yr}
              onPress={() => {
                const d = new Date(calViewDate);
                d.setFullYear(yr);
                setCalViewDate(d);
                setCalMode("months");
              }}
              style={{
                width: "30%",
                paddingVertical: 12,
                marginBottom: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? THEME : "#F8F8F8",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? "700" : "600",
                  color: isSelected ? "#FFFFFF" : "#1A1A1A",
                }}
              >
                {yr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const isInternalDisabled =
    !internalDate ||
    (normalizedMin && internalDate < normalizedMin) ||
    (normalizedMax && internalDate > normalizedMax);

  const handleConfirm = () => {
    if (internalDate && !isInternalDisabled) {
      onSelectDate(internalDate);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <BlurView
          experimentalBlurMethod="dimezisBlurView"
          intensity={40}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 24,
            paddingBottom: 40,
            paddingTop: 12,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 50,
              height: 5,
              backgroundColor: "#E2E8F0",
              borderRadius: 999,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A" }}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 6,
                backgroundColor: "#F3F4F6",
                borderRadius: 999,
              }}
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Month & Year Navigation Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  setCalMode(calMode === "months" ? "days" : "months")
                }
                style={{
                  backgroundColor:
                    calMode === "months" ? "#EEF6F6" : "#F3F4F6",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor:
                    calMode === "months" ? THEME : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1A1A1A",
                  }}
                >
                  {MONTHS[calViewDate.getMonth()]}
                </Text>
                <Ionicons
                  name={calMode === "months" ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#6B7280"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setCalMode(calMode === "years" ? "days" : "years")
                }
                style={{
                  backgroundColor:
                    calMode === "years" ? "#EEF6F6" : "#F3F4F6",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor:
                    calMode === "years" ? THEME : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1A1A1A",
                  }}
                >
                  {calViewDate.getFullYear()}
                </Text>
                <Ionicons
                  name={calMode === "years" ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {calMode === "days" && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  disabled={isPrevMonthDisabled}
                  onPress={() => {
                    const d = new Date(calViewDate);
                    d.setMonth(d.getMonth() - 1);
                    setCalViewDate(d);
                  }}
                  style={{
                    padding: 8,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 10,
                    opacity: isPrevMonthDisabled ? 0.35 : 1,
                  }}
                >
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={isPrevMonthDisabled ? "#9CA3AF" : "#1A1A1A"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const d = new Date(calViewDate);
                    d.setMonth(d.getMonth() + 1);
                    setCalViewDate(d);
                  }}
                  style={{
                    padding: 8,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="chevron-forward" size={16} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {calMode === "days" && renderCalendarGrid()}
          {calMode === "months" && renderMonthSelector()}
          {calMode === "years" && renderYearSelector()}

          <TouchableOpacity
            disabled={isInternalDisabled}
            style={{
              backgroundColor: isInternalDisabled ? "#94A3B8" : THEME,
              borderRadius: 16,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={handleConfirm}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
              Confirm Date
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export interface AppDatePickerFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  helperText?: string;
}

export function AppDatePickerField({
  label,
  value,
  placeholder = "Select Date",
  onPress,
  helperText,
}: AppDatePickerFieldProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: "#64748B",
          fontWeight: "700",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          height: 54,
          backgroundColor: "#F3F4F6",
          borderRadius: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            color: value ? "#1A1A1A" : "#9CA3AF",
            fontSize: 15,
            fontWeight: value ? "600" : "400",
          }}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={THEME} />
      </TouchableOpacity>
      {helperText ? (
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 11,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
