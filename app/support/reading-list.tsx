import { useGetBookmarkedBlogsQuery, useToggleBookmarkMutation } from "@/src/store/api/blogApi";
import { BlogListItem } from "@/src/features/wise-up/components/BlogListItem";
import { BlogSkeleton } from "@/src/features/wise-up/components/BlogSkeleton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReadingListScreen() {
  const router = useRouter();

  const { data: response, isLoading } = useGetBookmarkedBlogsQuery();
  const bookmarkedBlogs = response?.data?.items || [];

  const [toggleBookmark] = useToggleBookmarkMutation();

  const handleBookmark = (id: string) => {
    toggleBookmark(id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      
      <View className="px-5 pt-2 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="mb-6"
        >
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        
        <Text className="text-[#1A1A1A] font-extrabold text-[28px]">
          Your Reading List
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading ? (
          <BlogSkeleton />
        ) : bookmarkedBlogs && bookmarkedBlogs.length > 0 ? (
          bookmarkedBlogs.map((blog, index) => (
            <BlogListItem
              key={blog.id}
              blog={blog}
              onPress={() => router.push(`/blog/${blog.id}` as any)}
              onBookmark={() => handleBookmark(blog.id)}
              showSeparator={index !== bookmarkedBlogs.length - 1}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="bookmark-outline" size={48} color="#D1D5DB" />
            <Text className="text-[#6B7280] mt-4 font-medium">
              Your reading list is empty
            </Text>
            <Text className="text-[#9CA3AF] text-xs text-center px-10 mt-2">
              Save blogs you love and read them later here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
