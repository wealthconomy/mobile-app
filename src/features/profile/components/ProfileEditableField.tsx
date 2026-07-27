import React from "react";
import { Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

interface ProfileEditableFieldProps {
  control: any;
  name: string;
  label: string;
  isEditing: boolean;
  keyboardType?: any;
  placeholder?: string;
  editable?: boolean;
  prefix?: string;
}

export const ProfileEditableField = React.memo(
  ({
    control,
    name,
    label,
    isEditing,
    keyboardType = "default",
    placeholder = "",
    editable = true,
    prefix,
  }: ProfileEditableFieldProps) => (
    <View className="gap-y-2">
      <Text className="text-[15px] font-normal text-[#4B5563]">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            className={`h-14 rounded-xl px-4 justify-center border ${
              isEditing && editable
                ? "bg-white border-[#155D5F]"
                : "bg-[#F8F8F8] border-[#F0F0F0]"
            }`}
          >
            {isEditing && editable ? (
              <View className="flex-row items-center h-full">
                {prefix && (
                  <View className="mr-2.5 pr-2.5 border-r border-gray-200 justify-center h-full">
                    <Text className="text-[15px] font-semibold text-[#155D5F]">
                      {prefix}
                    </Text>
                  </View>
                )}
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ""}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={keyboardType}
                  className="flex-1 text-[15px] font-semibold text-[#323232] h-full"
                />
              </View>
            ) : (
              <Text className="text-[15px] font-semibold text-[#323232]">
                {value && String(value).trim() !== ""
                  ? prefix
                    ? `${prefix} ${String(value).replace(/^\+?234|^0/, "").trim()}`
                    : value
                  : ""}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  ),
);

ProfileEditableField.displayName = "ProfileEditableField";
