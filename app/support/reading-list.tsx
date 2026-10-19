import { useGetBookmarkedBlogsQuery } from "@/src/store/api/blogApi";
import { useBookmarks } from "@/src/hooks/useBookmarks";
import { BlogListItem } from "@/src/features/wise-up/components/BlogListItem";
import { BlogSkeleton } from "@/src/features/wise-up/components/BlogSkeleton";
import { Blog } from "@/src/types/blog";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReadingListScreen() {
  const router = useRouter();

  const {
    bookmarkedBlogs: localBookmarkedBlogs,
    removeBookmark,
    syncServerBookmarks,
    isHydrated,
  } = useBookmarks();

  const {
    data: response,
    isLoading: isServerLoading,
    isFetching,
    refetch,
  } = useGetBookmarkedBlogsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Sync any valid blogs returned from server into local store
  useEffect(() => {
    if (!response) return;
    const payload = (response as any)?.data !== undefined ? (response as any).data : response;
    let list: any[] = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else if (Array.isArray(payload?.items)) {
      list = payload.items;
    } else if (Array.isArray(payload?.blogs)) {
      list = payload.blogs;
    } else if (Array.isArray(payload?.data)) {
      list = payload.data;
    }

    const validServerBlogs: Blog[] = [];
    list.forEach((item: any) => {
      const blogObj = item?.blog && typeof item.blog === "object" ? item.blog : item;
      const blogId = blogObj.id || blogObj._id || item.blogId || item.id || item._id;
      if (blogId && (blogObj.title || blogObj.name)) {
        validServerBlogs.push({
          ...blogObj,
          id: blogId,
          title: blogObj.title || blogObj.name,
          image: blogObj.image || blogObj.coverImage || blogObj.imageUrl || "",
          isBookmarked: true,
        });
      }
    });

    if (validServerBlogs.length > 0) {
      syncServerBookmarks(validServerBlogs);
    }
  }, [response, syncServerBookmarks]);

  // Combined list prioritizing local bookmarks with server bookmarks
  const displayBlogs: Blog[] = useMemo(() => {
    const blogMap = new Map<string, Blog>();

    // Add local bookmarks first
    localBookmarkedBlogs.forEach((blog) => {
      if (blog && blog.id) {
        blogMap.set(blog.id, { ...blog, isBookmarked: true });
      }
    });

    // Merge server blogs if present
    if (response) {
      const payload = (response as any)?.data !== undefined ? (response as any).data : response;
      let list: any[] = [];
      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.items)) {
        list = payload.items;
      } else if (Array.isArray(payload?.blogs)) {
        list = payload.blogs;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      }

      list.forEach((item: any) => {
        const blogObj = item?.blog && typeof item.blog === "object" ? item.blog : item;
        const blogId = blogObj.id || blogObj._id || item.blogId || item.id || item._id;
        if (blogId && !blogMap.has(blogId) && (blogObj.title || blogObj.name)) {
          blogMap.set(blogId, {
            ...blogObj,
            id: blogId,
            title: blogObj.title || blogObj.name,
            image: blogObj.image || blogObj.coverImage || blogObj.imageUrl || "",
            isBookmarked: true,
          });
        }
      });
    }

    return Array.from(blogMap.values());
  }, [localBookmarkedBlogs, response]);

  const handleRemoveBookmark = (id: string) => {
    removeBookmark(id);
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
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} colors={["#155D5F"]} />
        }
      >
        {!isHydrated && isServerLoading ? (
          <BlogSkeleton />
        ) : displayBlogs && displayBlogs.length > 0 ? (
          displayBlogs.map((blog, index) => (
            <BlogListItem
              key={blog.id || index}
              blog={blog}
              onPress={() => router.push(`/blog/${blog.id}` as any)}
              onBookmark={() => handleRemoveBookmark(blog.id)}
              showSeparator={index !== displayBlogs.length - 1}
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
