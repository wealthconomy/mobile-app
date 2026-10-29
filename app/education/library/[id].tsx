import {
  useAddLibraryCommentMutation,
  useAddLibraryLikeMutation,
  useGetLibraryItemQuery,
  useRecordDownloadMutation,
  useRemoveLibraryLikeMutation,
} from "@/src/store/api/libraryApi";
import {
  isPdf,
  downloadAndShareDocument,
  openDocumentInApp,
  openDownloadedDocument,
} from "@/src/utils/documentFile";
import { useDownloadedMaterials } from "@/src/hooks/useDownloadedMaterials";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
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

/** Formats any date string into "Sep 4, 2026" */
function formatDate(raw?: string): string {
  if (!raw) return "";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LibraryMaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: response,
    isLoading,
    refetch,
  } = useGetLibraryItemQuery(id as string, { skip: !id });
  const material = response?.data;

  const [recordDownload] = useRecordDownloadMutation();
  const [addLibraryComment, { isLoading: isCommenting }] =
    useAddLibraryCommentMutation();
  const [addLibraryLike] = useAddLibraryLikeMutation();
  const [removeLibraryLike] = useRemoveLibraryLikeMutation();

  useEffect(() => {
    if (material) {
      setLikesCount(material.likesCount ?? 0);
      setIsLiked(material.isLiked ?? false);
    }
  }, [material?.likesCount, material?.isLiked]);

  const handleLike = async () => {
    const wasLiked = isLiked;
    const newIsLiked = !wasLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      if (newIsLiked) {
        await addLibraryLike(id as string).unwrap();
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
        } catch (_) {}
      } else {
        await removeLibraryLike(id as string).unwrap();
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      Alert.alert("Error", "Failed to update like. Please try again.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!id || !newComment.trim()) return;
    try {
      await addLibraryComment({
        id: id as string,
        content: newComment.trim(),
      }).unwrap();
      setNewComment("");
      refetch();
    } catch (error: any) {
      const status = error?.status;
      if (status === 404 || status === 405) {
        Alert.alert(
          "Not Available",
          "Comments are not yet supported. Please check back later.",
        );
      } else {
        Alert.alert(
          "Error",
          error?.data?.message || "Failed to add comment. Please try again.",
        );
      }
    }
  };

  const { isDownloaded, getDownload, markDownloaded, removeDownload, refresh } =
    useDownloadedMaterials();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const downloaded = material
    ? isDownloaded(material.id, material.documentUrl)
    : false;

  const handleReadInApp = async () => {
    if (!material) return;
    await openDocumentInApp(material);
  };

  const handleDownload = async () => {
    if (!material?.documentUrl || !material.isDownloadable) return;

    const existing = getDownload(material.id, material.documentUrl);
    if (existing) {
      const opened = await openDownloadedDocument(existing, material.title);
      if (opened) {
        return;
      }
      // If opening failed because file is missing, remove entry and re-download
      await removeDownload(material.id);
    }

    const result = await downloadAndShareDocument(material, {
      onRecordDownload: (idToRecord) => recordDownload(idToRecord),
      setIsDownloading,
    });

    if (result) {
      await markDownloaded(material.id, {
        ...result,
        documentUrl: material.documentUrl,
      });
    }
  };

  const handleWatchOnYouTube = async () => {
    if (!material?.youtubeUrl) return;
    try {
      await Linking.openURL(material.youtubeUrl);
    } catch {
      console.error("Error opening YouTube");
    }
  };

  const dateDisplay = material
    ? formatDate(material.createdAt || material.timePosted || material.timeAgo)
    : "";

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full bg-gray-50"
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Material Details
        </Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#155D5F" />
        </View>
      ) : !material ? (
        <View className="flex-1 justify-center items-center px-5">
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
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 py-6">
            {/* Cover image */}
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
              <Text className="text-[#4B5563] text-[13px] leading-[18px] font-kumbh-semibold">
                By {material.author}
                {dateDisplay ? ` • ${dateDisplay}` : ""}
                {material.readingDuration
                  ? ` • ${material.readingDuration}`
                  : ""}
              </Text>
            </View>

            <Text className="text-[#374151] text-[15px] leading-[22px] font-kumbh mb-6">
              {material.description}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row mb-6">
              {material.contentType === "video" ? (
                <TouchableOpacity
                  onPress={handleWatchOnYouTube}
                  className="flex-1 bg-red-500 py-3.5 rounded-xl flex-row items-center justify-center"
                >
                  <Ionicons name="logo-youtube" size={22} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2 text-base">
                    Watch on YouTube
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  {isPdf(material) && (
                    <TouchableOpacity
                      onPress={handleReadInApp}
                      className={`flex-1 bg-[#155D5F] py-3.5 rounded-xl flex-row items-center justify-center ${material.isDownloadable ? "mr-3" : ""}`}
                    >
                      <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                      <Text className="text-white font-bold ml-2">
                        Read in App
                      </Text>
                    </TouchableOpacity>
                  )}

                  {material.isDownloadable ? (
                    <TouchableOpacity
                      onPress={handleDownload}
                      disabled={isDownloading}
                      className="flex-1 bg-[#F8F8F8] border border-gray-200 py-3.5 rounded-xl flex-row items-center justify-center"
                      style={{ opacity: isDownloading ? 0.6 : 1 }}
                    >
                      {isDownloading ? (
                        <ActivityIndicator size="small" color="#155D5F" />
                      ) : (
                        <Ionicons
                          name={
                            downloaded
                              ? "checkmark-circle-outline"
                              : "download-outline"
                          }
                          size={20}
                          color="#155D5F"
                        />
                      )}
                      <Text className="text-[#155D5F] font-bold ml-2">
                        {isDownloading
                          ? "Downloading..."
                          : downloaded
                            ? "Downloaded"
                            : "Download"}
                      </Text>
                    </TouchableOpacity>
                  ) : !isPdf(material) ? (
                    <View className="flex-1 py-3.5 items-center justify-center">
                      <Text className="text-[#4B5563] text-[13px] leading-[18px] font-kumbh-semibold text-center">
                        This material is not available to read in the app.
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            {/* Social Stats & Comments — documents only */}
            {material.contentType === "document" && (
              <>
                <View className="flex-row items-center justify-between border-y border-gray-100 py-4 mb-6">
                  <TouchableOpacity
                    onPress={handleLike}
                    className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full"
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={20}
                      color={isLiked ? "#EF4444" : "#155D5F"}
                    />
                    <Text className="text-gray-700 font-bold ml-2">
                      {likesCount}
                    </Text>
                  </TouchableOpacity>

                  {material.isDownloadable && (
                    <View className="flex-row items-center px-4 py-2">
                      <Ionicons
                        name="download-outline"
                        size={20}
                        color="#6B7280"
                      />
                      <Text className="text-[#4B5563] font-kumbh-semibold text-[13px] ml-2">
                        {material.downloadsCount || 0}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center px-4 py-2">
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text className="text-[#4B5563] font-kumbh-semibold text-[13px] ml-2">
                      {material.commentsCount} Comments
                    </Text>
                  </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Comments
                </Text>
                {material.comments && material.comments.length > 0 ? (
                  material.comments.map((comment) => (
                    <View key={comment.id} className="mb-5 flex-row">
                      <Image
                        source={{
                          uri:
                            comment.userImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=155D5F&color=fff`,
                        }}
                        className="w-10 h-10 rounded-full bg-gray-200 mr-3 mt-1"
                      />
                      <View className="flex-1 bg-gray-50 rounded-2xl p-4">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-bold text-gray-900">
                            {comment.userName}
                          </Text>
                          <Text className="text-[12px] text-[#4B5563] font-kumbh-semibold">
                            {formatDate(
                              comment.createdAt ||
                                comment.timePosted ||
                                comment.timeAgo,
                            )}
                          </Text>
                        </View>
                        <Text className="text-[#374151] text-[14px] leading-[20px] font-kumbh">
                          {comment.content || comment.text}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center justify-center py-8">
                    <Ionicons
                      name="chatbubbles-outline"
                      size={40}
                      color="#E5E7EB"
                    />
                    <Text className="text-[#4B5563] text-[13px] leading-[18px] font-kumbh-semibold mt-2">
                      No comments yet. Be the first!
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Comment Input — documents only */}
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
      )}
    </SafeAreaView>
  );
}
