import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { LibraryMaterial } from "../../../types/library";



interface LibraryItemProps {
  material: LibraryMaterial;
  onPress: () => void; // Navigates to details
  onDownload: () => void;
  onReadInApp: () => void;
  onWatchOnYouTube: () => void;
  viewMode?: "list" | "grid";
  showSeparator?: boolean;
}

export const LibraryItem: React.FC<LibraryItemProps> = ({
  material,
  onPress,
  onDownload,
  onReadInApp,
  onWatchOnYouTube,
  viewMode = "list",
  showSeparator = false,
}) => {


  if (viewMode === "grid") {
    return (
      <View style={{ width: "48%" }} className="mb-4">
        <TouchableOpacity
          onPress={onPress}
          className="bg-white rounded-lg border border-gray-100 p-2"
          activeOpacity={0.7}
        >
          {/* Image with optional play overlay for videos */}
          <View className="relative w-full h-32 rounded-md bg-gray-100 mb-2">
            <Image
              source={{ uri: material.image }}
              className="w-full h-full rounded-md"
              resizeMode="cover"
            />
            {material.contentType === "video" && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black/50 rounded-full p-2.5">
                  <Ionicons name="play" size={22} color="#FFFFFF" />
                </View>
              </View>
            )}
          </View>
          <Text
            className="text-gray-900 font-bold text-sm mb-0.5"
            numberOfLines={1}
          >
            {material.title}
          </Text>
          <Text className="text-gray-500 text-[10px] mb-2" numberOfLines={2}>
            {material.description}
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-gray-400 text-xs font-medium">
                {material.timeAgo || material.timePosted}{material.readingDuration ? ` • ${material.readingDuration}` : ""}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="flex-row items-center">
                  <Ionicons name="heart-outline" size={12} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">{material.likesCount}</Text>
                </View>
                <View className="flex-row items-center ml-3">
                  <Ionicons name="chatbubble-outline" size={12} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">{material.commentsCount}</Text>
                </View>
              </View>
            </View>
            {/* Action button: play for videos, read/download for docs */}
            {material.contentType === "video" ? (
              <TouchableOpacity onPress={onWatchOnYouTube} className="bg-red-50 p-1.5 rounded-full">
                <Ionicons name="play-circle-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <TouchableOpacity onPress={onReadInApp} className="bg-gray-50 p-1.5 rounded-full mr-1">
                  <Ionicons name="book-outline" size={16} color="#155D5F" />
                </TouchableOpacity>
                {material.isDownloadable && (
                  <TouchableOpacity onPress={onDownload} className="bg-gray-50 p-1.5 rounded-full">
                    <Ionicons name="download-outline" size={16} color="#155D5F" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // List View (Default)
  return (
    <View className="w-full mb-4">
      <TouchableOpacity
        onPress={onPress}
        className="flex-row py-2"
        activeOpacity={0.7}
      >
        {/* Image thumbnail with optional play overlay for videos */}
        <View className="w-24 h-16 rounded-md bg-gray-100">
          <Image
            source={{ uri: material.image }}
            className="w-24 h-16 rounded-md"
            resizeMode="cover"
          />
          {material.contentType === "video" && (
            <View className="absolute inset-0 items-center justify-center rounded-md">
              <View className="bg-black/50 rounded-full p-1.5">
                <Ionicons name="play" size={14} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>

        <View className="flex-1 ml-4 justify-center">
          <View className="mb-1 flex-row justify-between">
            <View className="flex-1">
              <Text
                className="text-gray-900 font-bold text-sm mr-2"
                numberOfLines={1}
              >
                {material.title}
              </Text>
              <Text className="text-gray-500 text-[10px] mt-0.5 mr-2" numberOfLines={2}>
                {material.description}
              </Text>
            </View>
            {/* Action button: play for videos, read/download for docs */}
            {material.contentType === "video" ? (
              <TouchableOpacity
                onPress={onWatchOnYouTube}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="mt-1"
              >
                <Ionicons name="play-circle-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={onReadInApp}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="mt-1 mr-2"
                >
                  <Ionicons name="book-outline" size={20} color="#155D5F" />
                </TouchableOpacity>
                {material.isDownloadable && (
                  <TouchableOpacity
                    onPress={onDownload}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="mt-1"
                  >
                    <Ionicons name="download-outline" size={20} color="#155D5F" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View>
                <Text className="text-gray-400 text-xs font-medium">
                  {material.timeAgo || material.timePosted}{material.readingDuration ? ` • ${material.readingDuration}` : ""}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row items-center mr-3">
                    <Ionicons name="heart-outline" size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{material.likesCount}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="chatbubble-outline" size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{material.commentsCount}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {showSeparator && <View className="h-px bg-gray-100 w-full mt-4" />}
    </View>
  );
};
