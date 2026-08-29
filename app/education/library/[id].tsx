import { useGetLibraryMaterialsQuery, useRecordDownloadMutation, useAddLibraryCommentMutation } from "@/src/store/api/libraryApi";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryMaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [newComment, setNewComment] = useState("");

  const { data: response, isLoading } = useGetLibraryMaterialsQuery({ publishToApp: true });
  const material = response?.data?.items?.find(m => m.id === id);

  const [recordDownload] = useRecordDownloadMutation();
  const [addLibraryComment, { isLoading: isCommenting }] = useAddLibraryCommentMutation();

  const handleCommentSubmit = async () => {
    if (!id || !newComment.trim()) return;
    try {
      await addLibraryComment({ id: id as string, content: newComment }).unwrap();
      setNewComment("");
      Alert.alert("Success", "Comment added successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (material) {
      setLikesCount(material.likesCount);
    }
  }, [material]);

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    if (newIsLiked) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/like.mp3")
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
    }
  };

  const handleReadInApp = async () => {
    if (!material?.documentUrl) return;
    try {
      await WebBrowser.openBrowserAsync(material.documentUrl);
    } catch (error) {
      console.error("Error opening in-app browser", error);
    }
  };

  const handleDownload = async () => {
    if (!material?.documentUrl) return;
    try {
      const supported = await Linking.canOpenURL(material.documentUrl);
      if (supported) {
        await Linking.openURL(material.documentUrl);
        recordDownload(id as string);
      } else {
        console.error("Don't know how to open this URL: " + material.documentUrl);
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const handleWatchOnYouTube = async () => {
    if (!material?.youtubeUrl) return;
    try {
      await Linking.openURL(material.youtubeUrl);
    } catch (error) {
      console.error("Error opening YouTube", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#155D5F" />
      </SafeAreaView>
    );
  }

  if (!material) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-white justify-center items-center px-5">
        <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
        <Text className="text-gray-500 mt-4 text-center">
          Material not found or has been removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-[#155D5F] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-gray-50">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Material Details</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Top Info Section */}
          <View className="px-5 py-6">
            {/* Cover image with play overlay for videos */}
            <View className="w-full h-56 rounded-2xl bg-gray-100 mb-6">
              <Image
                source={{ uri: material.image }}
                className="w-full h-full rounded-2xl"
                resizeMode="cover"
              />
              {material.contentType === "video" && (
                <View className="absolute inset-0 items-center justify-center rounded-2xl">
                  <View className="bg-black/50 rounded-full p-5">
                    <Ionicons name="play" size={36} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {material.title}
            </Text>
            
            <View className="flex-row items-center mb-4">
              <Text className="text-gray-500 text-sm">
                By {material.author} • {material.timeAgo || material.timePosted}{material.readingDuration ? ` • ${material.readingDuration}` : ""}
              </Text>
            </View>

            <Text className="text-gray-600 text-base leading-relaxed mb-6">
              {material.description}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row mb-6">
              {material.contentType === "video" ? (
                // Video: Watch on YouTube button (full width)
                <TouchableOpacity
                  onPress={handleWatchOnYouTube}
                  className="flex-1 bg-red-500 py-3.5 rounded-xl flex-row items-center justify-center"
                >
                  <Ionicons name="logo-youtube" size={22} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2 text-base">Watch on YouTube</Text>
                </TouchableOpacity>
              ) : (
                // Document: Read in App + optional Download
                <>
                  <TouchableOpacity
                    onPress={handleReadInApp}
                    className="flex-1 bg-[#155D5F] py-3.5 rounded-xl flex-row items-center justify-center mr-3"
                  >
                    <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                    <Text className="text-white font-bold ml-2">Read in App</Text>
                  </TouchableOpacity>

                  {material.isDownloadable && (
                    <TouchableOpacity
                      onPress={handleDownload}
                      className="flex-1 bg-[#F8F8F8] border border-gray-200 py-3.5 rounded-xl flex-row items-center justify-center"
                    >
                      <Ionicons name="download-outline" size={20} color="#155D5F" />
                      <Text className="text-[#155D5F] font-bold ml-2">Download</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Social Stats & Comments — only for documents */}
            {material.contentType === "document" && (
              <>
                <View className="flex-row items-center justify-between border-y border-gray-100 py-4 mb-6">
                  <TouchableOpacity onPress={handleLike} className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full">
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#EF4444" : "#155D5F"} />
                    <Text className="text-gray-700 font-bold ml-2">{likesCount}</Text>
                  </TouchableOpacity>

                  {material.isDownloadable && (
                    <View className="flex-row items-center px-4 py-2">
                      <Ionicons name="download-outline" size={20} color="#9CA3AF" />
                      <Text className="text-gray-500 font-bold ml-2">{material.downloadsCount || 0}</Text>
                    </View>
                  )}

                  <View className="flex-row items-center px-4 py-2">
                    <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
                    <Text className="text-gray-500 font-bold ml-2">{material.commentsCount} Comments</Text>
                  </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 mb-4">Comments</Text>
                {material.comments && material.comments.length > 0 ? (
                  material.comments.map((comment) => (
                    <View key={comment.id} className="mb-5 flex-row">
                      <Image
                        source={{ uri: comment.userImage || "https://ui-avatars.com/api/?name=" + comment.userName }}
                        className="w-10 h-10 rounded-full bg-gray-200 mr-3 mt-1"
                      />
                      <View className="flex-1 bg-gray-50 rounded-2xl p-4">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-bold text-gray-900">{comment.userName}</Text>
                          <Text className="text-xs text-gray-400">{comment.timePosted}</Text>
                        </View>
                        <Text className="text-gray-600 text-sm leading-relaxed">{comment.content || comment.text}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center justify-center py-8">
                    <Ionicons name="chatbubbles-outline" size={40} color="#E5E7EB" />
                    <Text className="text-gray-400 mt-2">No comments yet. Be the first!</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Comment Input — only for documents */}
        {material.contentType === "document" && (
          <View className="px-5 py-3 border-t border-gray-100 bg-white flex-row items-center">
            <View className="flex-1 bg-gray-50 rounded-full px-4 py-2 flex-row items-center border border-gray-200">
              <TextInput
                className="flex-1 text-gray-900 py-1"
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={handleCommentSubmit}
              className={`ml-3 p-2.5 rounded-full ${newComment.trim() && !isCommenting ? "bg-[#155D5F]" : "bg-gray-200"}`}
              disabled={!newComment.trim() || isCommenting}
            >
              {isCommenting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
