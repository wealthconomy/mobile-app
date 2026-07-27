import { useGetBlogsQuery, useToggleBookmarkMutation } from "@/src/store/api/blogApi";
import { BlogListItem } from "@/src/features/wise-up/components/BlogListItem";
import { BlogSkeleton } from "@/src/features/wise-up/components/BlogSkeleton";
import { CategoryChips } from "@/src/features/wise-up/components/CategoryChips";
import { Category } from "@/src/types/blog";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["For you", "Popular", "Trending", "Categories"];

export default function WiseUpScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("For you");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const { data: response, isLoading } = useGetBlogsQuery({ publishToApp: true });
  
  if (response) {
    console.log("=== ALL BLOGS API RESPONSE ===");
    console.log(JSON.stringify(response, null, 2));
  }

  const allBlogs = response?.data || [];

  const [toggleBookmark] = useToggleBookmarkMutation();

  let filteredBlogs = [...allBlogs];

  if (activeTab === "Popular") {
    filteredBlogs.sort((a, b) => b.views - a.views);
  } else if (activeTab === "Trending") {
    filteredBlogs = filteredBlogs.slice().reverse();
  }

  if (activeTab === "Categories" && selectedCategory) {
    filteredBlogs = filteredBlogs.filter((b) => b.category === selectedCategory);
  }

  filteredBlogs = filteredBlogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBookmark = (id: string) => {
    toggleBookmark(id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/support/reading-list" as any)}
          >
            <Ionicons name="bookmark" size={24} color="#155D5F" />
          </TouchableOpacity>
        </View>
        
        <View className="mb-6">
          <Text className="text-[#1A1A1A] font-extrabold text-[28px]">
            Hi WiseUp!
          </Text>
          <Text className="text-[#6B7280] text-sm mt-1">
            Get smart about money and build wealth
          </Text>
        </View>

        <View className="flex-row items-center bg-[#F8F8F8] px-4 py-2 rounded-xl mb-6">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search for topics"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 h-10 text-[#1A1A1A]"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="flex-row justify-between border-b border-gray-100 mb-6">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`pb-2 border-b-2 ${
                activeTab === tab ? "border-[#155D5F]" : "border-transparent"
              }`}
            >
              <Text
                className={`text-sm ${
                  activeTab === tab
                    ? "text-[#155D5F] font-bold"
                    : "text-[#9CA3AF]"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "Categories" && (
          <CategoryChips
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading ? (
          <BlogSkeleton />
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <BlogListItem
              key={blog.id}
              blog={blog}
              onPress={() => router.push(`/blog/${blog.id}` as any)}
              onBookmark={() => handleBookmark(blog.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text className="text-[#6B7280] mt-4">No blogs found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
