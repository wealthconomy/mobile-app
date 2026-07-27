import { MONTHS } from "../utils/notificationHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface DateFilterPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  showPicker: boolean;
  onClose: () => void;
}

export const DateFilterPicker = ({
  selectedDate,
  onSelectDate,
  showPicker,
  onClose,
}: DateFilterPickerProps) => {
  const [viewDate, setViewDate] = useState(new Date());

  // Keep viewDate in sync with selectedDate when opened
  useEffect(() => {
    if (showPicker) {
      setViewDate(new Date(selectedDate || new Date()));
    }
  }, [showPicker, selectedDate]);

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month: number, year: number) =>
    (new Date(year, month, 1).getDay() + 6) % 7;

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days = [];
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  for (let i = 0; i < firstDay; i++) {
    days.push(
      <View key={`empty-${i}`} className="w-[14.28%] aspect-square" />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const isFuture = currentDate > new Date();
    const isSelected =
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year;

    days.push(
      <TouchableOpacity
        key={day}
        disabled={isFuture}
        className={`w-[14.28%] aspect-square items-center justify-center mb-1 ${
          isSelected ? "bg-[#155D5F] rounded-full" : ""
        }`}
        onPress={() => {
          onSelectDate(new Date(year, month, day));
          onClose();
        }}
      >
        <Text
          className={`text-[15px] ${
            isSelected
              ? "text-white font-bold"
              : isFuture
              ? "text-[#E5E7EB]"
              : "text-[#323232] font-medium"
          }`}
        >
          {day}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={showPicker}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-[36px] px-6 pb-10 pt-3">
              <View className="w-20 h-1.5 bg-[#bababa] rounded-full self-center mb-6" />
              <Text className="text-[22px] font-extrabold text-[#323232] mb-5 mt-2">
                Filter by date
              </Text>
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-bold text-[#323232]">
                  {MONTHS[month]} {year}
                </Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    onPress={() => {
                      const d = new Date(viewDate);
                      d.setMonth(d.getMonth() - 1);
                      setViewDate(d);
                    }}
                    className="p-1"
                  >
                    <Ionicons name="chevron-back" size={24} color="#323232" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const d = new Date(viewDate);
                      d.setMonth(d.getMonth() + 1);
                      setViewDate(d);
                    }}
                    className="p-1"
                  >
                    <Ionicons name="chevron-forward" size={24} color="#323232" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between mb-4">
                  {dayNames.map((d) => (
                    <Text
                      key={d}
                      className="w-[40px] text-center text-base font-semibold text-[#323232]"
                    >
                      {d}
                    </Text>
                  ))}
                </View>
                <View className="flex-row flex-wrap">{days}</View>
              </View>

              <TouchableOpacity
                className="bg-[#155D5F] rounded-xl h-14 items-center justify-center"
                onPress={onClose}
              >
                <Text className="text-white text-base font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
