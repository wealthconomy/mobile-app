import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Blog, Category } from "../../../types/blog";

const getPlanStyles = (category: Category) => {
  switch (category) {
    case "WealthFlex":
      return { bg: "#FFF0EF", text: "#F44336" };
    case "WealthGoal":
      return { bg: "#F8E5EE", text: "#F3007A" };
    case "WealthFix":
      return { bg: "#FFF9E6", text: "#FFCF65" };
    case "WealthFam":
      return { bg: "#F0F0FF", text: "#6366F1" };
    case "WealthFlow":
      return { bg: "#E6F7FF", text: "#0EA5E9" };
    default:
      return { bg: "#F3F4F6", text: "#4B5563" };
  }
};

interface BlogListItemProps {
  blog: Blog;
  onPress: () => void;
  onBookmark: () => void;
  showSeparator?: boolean;
}

export const BlogListItem: React.FC<BlogListItemProps> = ({
  blog,
  onPress,
  onBookmark,
  showSeparator = false,
}) => {
  const styles = getPlanStyles(blog.category);

  return (
    <View style={{ width: 372 }}>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center"
        style={{ height: 81 }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: blog.image }}
          className="rounded-[6px] bg-gray-100"
          style={{ width: 104, height: 66 }}
          resizeMode="cover"
        />

        <View className="flex-1 ml-4 h-[66px] justify-center">
          <View className="mb-1.5">
            <View
              className="px-2 items-center justify-center rounded-[4px] self-start mb-1"
              style={{ width: 57, height: 15, backgroundColor: styles.bg }}
            >
              <Text
                className="text-[8px] font-bold"
                style={{ color: styles.text }}
              >
                {blog.category}
              </Text>
            </View>
            <View className="flex-row">
              <Text
                className="text-[#1A1A1A] font-bold text-[13px] leading-tight flex-1 mr-2"
                numberOfLines={2}
              >
                {blog.title}
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={onBookmark}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={blog.isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={blog.isBookmarked ? "#155D5F" : "#6B7280"}
                  />
                </TouchableOpacity>
                <Text className="text-[#6B7280] text-[10px] font-bold ml-1">
                  {blog.bookmarkCount}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center">
            <Image
              source={{ uri: blog.author.image }}
              className="w-4 h-4 rounded-full bg-gray-200 mr-2"
            />
            <View>
              <Text className="text-[#6B7280] text-[9px] font-bold leading-tight">
                {blog.author.name}
              </Text>
              <Text className="text-[#9CA3AF] text-[8px] font-medium leading-tight">
                {blog.timePosted} • {blog.readingDuration}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {showSeparator && <View className="h-[1px] bg-gray-100 w-full" />}
    </View>
  );
};
