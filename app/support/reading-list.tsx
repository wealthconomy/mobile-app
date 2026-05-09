import { blogService } from "@/src/api/blogService";
import Header from "@/src/components/common/Header";
import { BlogListItem } from "@/src/features/wise-up/components/BlogListItem";
import { BlogSkeleton } from "@/src/features/wise-up/components/BlogSkeleton";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReadingListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: bookmarkedBlogs, isLoading } = useQuery({
    queryKey: ["bookmarked-blogs"],
    queryFn: blogService.getBookmarkedBlogs,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: (id: string) => blogService.toggleBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });

  const handleBookmark = (id: string) => {
    toggleBookmarkMutation.mutate(id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />
      <Header title="Your WiseUp List" />

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
