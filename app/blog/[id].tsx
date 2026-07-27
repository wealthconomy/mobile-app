import { useGetBlogByIdQuery, useToggleBookmarkMutation, useToggleLikeMutation, useAddCommentMutation } from "@/src/store/api/blogApi";
import { Ionicons } from "@expo/vector-icons";
import { LikeIcon } from "@/src/components/icons/LikeIcon";
import { BookmarkIcon } from "@/src/components/icons/BookmarkIcon";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: response, isLoading } = useGetBlogByIdQuery(id as string, {
    skip: !id,
  });
  const blog = response?.data;

  const [commentText, setCommentText] = useState("");
  
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(false);
  const [localBookmarks, setLocalBookmarks] = useState(0);

  useEffect(() => {
    if (blog) {
      setLocalIsLiked(blog.isLiked || false);
      setLocalLikesCount(blog.likesCount || 0);
      setLocalIsBookmarked(blog.isBookmarked || false);
      setLocalBookmarks(blog.bookmarks || 0);
    }
  }, [blog]);

  const [toggleBookmark] = useToggleBookmarkMutation();
  const [toggleLike] = useToggleLikeMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();

  const handleShare = async () => {
    if (!blog) return;
    try {
      await Share.share({
        message: `Check out this blog: ${blog.title}\n\n${blog.description}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBookmark = () => {
    if (!id) return;
    const newIsBookmarked = !localIsBookmarked;
    setLocalIsBookmarked(newIsBookmarked);
    setLocalBookmarks(prev => newIsBookmarked ? prev + 1 : Math.max(0, prev - 1));
    toggleBookmark(id as string);
  };
  const handleLike = async () => {
    if (!id) return;
    const newIsLiked = !localIsLiked;
    setLocalIsLiked(newIsLiked);
    setLocalLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/like.mp3"),
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
    toggleLike(id as string);
  };
  const handleCommentSubmit = async () => {
    if (!id || !commentText.trim()) return;
    try {
      await addComment({ id: id as string, content: commentText }).unwrap();
      setCommentText("");
      Alert.alert("Success", "Comment added successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#155D5F" size="large" />
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-10">
        <Text className="text-[#1A1A1A] font-bold text-lg">Blog not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-[#155D5F] px-6 py-2 rounded-xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        <View className="relative h-80">
          <Image
            source={{ uri: blog.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-12 left-0 right-0">
            <View className="flex-row justify-between items-center px-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
              >
                <Ionicons name="share-social" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-5 pt-6">
          <View
            className="px-2 py-0.5 rounded self-start mb-2"
            style={{
              backgroundColor:
                blog.category === "WealthFlex"
                  ? "#FFF0EF"
                  : blog.category === "WealthGoal"
                    ? "#F8E5EE"
                    : blog.category === "WealthFix"
                      ? "#FFF9E6"
                      : blog.category === "WealthFam"
                        ? "#F0F0FF"
                        : blog.category === "WealthFlow"
                          ? "#E6F7FF"
                          : "#F3F4F6",
            }}
          >
            <Text
              className="text-[10px] font-bold"
              style={{
                color:
                  blog.category === "WealthFlex"
                    ? "#F44336"
                    : blog.category === "WealthGoal"
                      ? "#F3007A"
                      : blog.category === "WealthFix"
                        ? "#FFCF65"
                        : blog.category === "WealthFam"
                          ? "#6366F1"
                          : blog.category === "WealthFlow"
                            ? "#0EA5E9"
                            : "#4B5563",
              }}
            >
              {blog.category}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-[#1A1A1A] font-bold text-[20px] leading-tight mb-2">
              {blog.title}
            </Text>
          </View>

          <View className="flex-row items-center mb-5">
            <Image
              source={{ uri: blog.authorAvatar }}
              className="w-8 h-8 rounded-full bg-gray-200 mr-2.5"
            />
            <View className="flex-1">
              <Text className="text-[#1A1A1A] font-bold text-xs">
                {blog.author}
              </Text>
              <Text className="text-[#6B7280] text-[10px]">
                {blog.timeAgo}{blog.readingDuration ? ` • ${blog.readingDuration}` : ""}
              </Text>
            </View>
          </View>

          {/* Interaction Bar */}
          <View className="flex-row items-center justify-between mb-1 px-1">
            <TouchableOpacity
              onPress={handleLike}
              className="flex-row items-center"
            >
              <LikeIcon
                size={20}
                color={localIsLiked ? "#155D5F" : "#6B7280"}
              />
              <Text className="text-[#6B7280] text-xs ml-2 font-bold">
                {localLikesCount}
              </Text>
            </TouchableOpacity>

            <View
              className="flex-row items-center"
            >
              <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
              <Text className="text-[#6B7280] text-xs ml-2 font-bold">
                {blog.comments?.length || 0}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              className="flex-row items-center"
            >
              <Ionicons name="share-social-outline" size={20} color="#6B7280" />
              <Text className="text-[#6B7280] text-xs ml-2 font-bold">
                {blog.sharesCount || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBookmark}
              className="flex-row items-center"
            >
              <BookmarkIcon
                size={20}
                color={localIsBookmarked ? "#155D5F" : "#6B7280"}
              />
              <Text className="text-[#6B7280] text-xs ml-2 font-bold">
                {localBookmarks}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="h-[1px] bg-gray-100 w-full mb-5 mt-4" />

          <Text className="text-[#4B5563] text-sm leading-relaxed mb-6">
            {blog.content}
          </Text>

          <Text className="text-[#1A1A1A] font-bold text-sm mb-6">
            Thanks for reading!
          </Text>

          {/* Comments Section */}
          <View className="mb-10">
            <Text className="text-[#1A1A1A] font-bold text-base mb-4">
              Comments ({blog.comments?.length || 0})
            </Text>
            <View className="h-[1px] bg-gray-100 w-full mb-6" />
            
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((comment) => (
                <View
                  key={comment.id}
                  className="mb-6"
                >
                  <View className="flex-row items-center mb-2">
                    <Image
                      source={{ uri: comment.userImage || "https://ui-avatars.com/api/?name=" + (comment.userName || "User") + "&background=random" }}
                      className="w-8 h-8 rounded-full bg-gray-200 mr-3"
                    />
                    <View>
                      <Text className="text-[#1A1A1A] font-bold text-sm">
                        {comment.userName || "Anonymous"}
                      </Text>
                      <Text className="text-[#9CA3AF] text-[10px]">
                        {comment.timeAgo || comment.timePosted}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[#4B5563] text-sm leading-relaxed">
                    {comment.content || comment.text}
                  </Text>
                </View>
              ))
            ) : (
              <View className="py-10 items-center justify-center bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                <Ionicons
                  name="chatbubbles-outline"
                  size={32}
                  color="#94A3B8"
                />
                <Text className="text-[12px] text-[#94A3B8] font-bold mt-2">
                  No comments yet. Be the first to join the conversation!
                </Text>
              </View>
            )}
          </View>
        </View>
        </ScrollView>
        <View className="px-5 py-3 border-t border-gray-100 bg-white flex-row items-center">
          <View className="flex-1 bg-gray-50 rounded-full px-4 py-2 flex-row items-center border border-gray-200">
            <TextInput
              className="flex-1 text-gray-900 py-1"
              placeholder="Write a message..."
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleCommentSubmit}
            className={`ml-3 p-2.5 rounded-full ${commentText.trim() && !isCommenting ? "bg-[#155D5F]" : "bg-gray-200"}`}
            disabled={!commentText.trim() || isCommenting}
          >
            {isCommenting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
