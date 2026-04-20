import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Category } from "../../../types/blog";

const CATEGORIES: Category[] = [
  "WealthFlex",
  "WealthFix",
  "WealthGoal",
  "WealthFlow",
  "WealthFam",
];

interface CategoryChipsProps {
  selectedCategory: Category | null;
  onSelect: (category: Category | null) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <View className="mb-6 flex-row flex-wrap">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelect(isSelected ? null : cat)}
            className={`mr-3 mb-3 px-4 py-2 rounded-xl border ${
              isSelected
                ? "bg-[#155D5F] border-[#155D5F]"
                : "bg-white border-gray-200"
            }`}
            style={{ minWidth: "28%" }}
          >
            <Text
              className={`font-semibold text-[11px] text-center ${
                isSelected ? "text-white" : "text-[#6B7280]"
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
