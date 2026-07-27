import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Upload, X } from 'lucide-react-native';

interface Props {
  label: string;
  imageUri: string | null;
  onPick: () => void;
  onRemove: () => void;
}

export const DocumentUploadBox: React.FC<Props> = ({ label, imageUri, onPick, onRemove }) => {
  return (
    <View className="mb-6">
      <Text className="text-[#475569] text-[14px] mb-3 ml-2">{label}</Text>
      <TouchableOpacity
        onPress={onPick}
        className={`w-full h-32 rounded-2xl border ${
          imageUri
            ? "border-[#155D5F] bg-white"
            : "border-gray-100 bg-[#F8FAFC]"
        } items-center justify-center overflow-hidden`}
      >
        {imageUri ? (
          <View className="w-full h-full relative">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm"
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center px-4">
            <Upload size={24} color="#1A1A1A" className="mb-3" />
            <Text className="text-[#64748B] text-[13px] text-center">
              Browse a file in a PDF, PNG and JPG format
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
