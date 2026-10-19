import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSupportChat } from "@/src/features/support/hooks/useSupportChat";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { SupportMessage } from "@/src/types/support";
import { Skeleton } from "@/src/components/common/skeletons";

function getMessageTimestamp(item?: any): string {
  if (!item) return "";
  return item.time || item.createdAt || item.created_at || item.timestamp || "";
}

function formatMessageTime(timeStr?: string | number): string {
  if (!timeStr) {
    const now = new Date();
    return now
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
      .replace(" ", "");
  }
  try {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d
        .toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase()
        .replace(" ", "");
    }
  } catch {
    // Fallback to raw string if parsing fails
  }
  return String(timeStr);
}

function getDateLabel(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function isSupportMessage(item: any): boolean {
  if (!item) return false;
  return (
    item.senderRole === "ADMIN" ||
    item.senderRole === "SUPER_ADMIN" ||
    item.role === "ADMIN" ||
    item.isAdmin === true ||
    (typeof item.sender === "string" && item.sender.toLowerCase() === "admin") ||
    (typeof item.senderName === "string" &&
      (item.senderName === "Admin Support" ||
        item.senderName === "Admin" ||
        /\b(admin\s*support|support\s*team|wealthconomy\s*support)\b/i.test(
          item.senderName
        )))
  );
}

function ChatSkeletonLoading() {
  return (
    <View className="flex-1 px-4 pt-4">
      {/* Date Pill Skeleton */}
      <View className="items-center my-4">
        <Skeleton width={90} height={22} borderRadius={11} color="#F3F4F6" />
      </View>

      {/* Support Message Skeleton */}
      <View className="flex-row items-start max-w-[80%] mb-3">
        <Skeleton
          width={32}
          height={32}
          circle
          color="#E5E7EB"
          style={{ marginRight: 8, marginTop: 4 }}
        />
        <View style={{ flex: 1 }}>
          <Skeleton
            width={110}
            height={12}
            borderRadius={4}
            style={{ marginBottom: 6 }}
            color="#E5E7EB"
          />
          <Skeleton width="100%" height={56} borderRadius={16} color="#F3F4F6" />
        </View>
      </View>

      {/* Customer Message Skeleton */}
      <View style={{ alignSelf: "flex-end", maxWidth: "70%", marginBottom: 8 }}>
        <Skeleton width={180} height={46} borderRadius={16} color="#E7F5F5" />
      </View>

      {/* Customer Follow-up Skeleton */}
      <View style={{ alignSelf: "flex-end", maxWidth: "55%", marginBottom: 14 }}>
        <Skeleton width={130} height={38} borderRadius={14} color="#E7F5F5" />
      </View>

      {/* Support Message Skeleton */}
      <View className="flex-row items-start max-w-[85%] mb-3">
        <Skeleton
          width={32}
          height={32}
          circle
          color="#E5E7EB"
          style={{ marginRight: 8, marginTop: 4 }}
        />
        <View style={{ flex: 1 }}>
          <Skeleton
            width={120}
            height={12}
            borderRadius={4}
            style={{ marginBottom: 6 }}
            color="#E5E7EB"
          />
          <Skeleton width="100%" height={68} borderRadius={16} color="#F3F4F6" />
        </View>
      </View>

      {/* Customer Message Skeleton */}
      <View style={{ alignSelf: "flex-end", maxWidth: "65%", marginBottom: 8 }}>
        <Skeleton width={160} height={42} borderRadius={16} color="#E7F5F5" />
      </View>
    </View>
  );
}

const QUICK_PROMPTS = [
  {
    icon: "card-outline" as const,
    label: "Deposit Inquiry",
    text: "Hello, I have an inquiry regarding my recent deposit.",
  },
  {
    icon: "cash-outline" as const,
    label: "Withdrawal Status",
    text: "Hello, could you please check the status of my withdrawal request?",
  },
  {
    icon: "shield-checkmark-outline" as const,
    label: "KYC Verification",
    text: "Hello, I need assistance with my KYC identity verification.",
  },
  {
    icon: "lock-closed-outline" as const,
    label: "PIN / Security",
    text: "Hello, I need help updating my security PIN or password.",
  },
  {
    icon: "person-outline" as const,
    label: "Speak with Agent",
    text: "Hello, I would like to speak with a customer support specialist.",
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const {
    messages,
    isLoading,
    error,
    rawError,
    errorStatus,
    errorMessage,
    isChatNotFound,
    refetch,
    isSocketConnected,
    isAdminOnline,
    stage,
    isSending,
    sendMessage,
    retryMessage,
  } = useSupportChat();

  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showErrorDiagnostics, setShowErrorDiagnostics] = useState(false);
  const [forceNewChat, setForceNewChat] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [showSecurityNotice, setShowSecurityNotice] = useState(true);
  const [csatRating, setCsatRating] = useState<number | null>(null);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const flatListRef = useRef<FlatList<SupportMessage>>(null);

  // Staged Attachment State
  const [stagedAttachment, setStagedAttachment] = useState<{
    uri: string;
    url?: string;
    name: string;
    type: "image" | "pdf" | "document";
  } | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isSharingImage, setIsSharingImage] = useState(false);

  const { uploadImage } = useImageUpload();

  const handleCopyMessage = async (text?: string) => {
    if (!text) return;
    try {
      await Clipboard.setStringAsync(text);
      setCopiedToast("Copied to clipboard");
      setTimeout(() => {
        setCopiedToast(null);
      }, 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  const processSelectedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    // 1. Guard against oversized assets
    if (asset.fileSize && asset.fileSize > 15 * 1024 * 1024) {
      Alert.alert(
        "File Too Large",
        "Please select an image smaller than 15MB to ensure fast upload."
      );
      return;
    }

    const fileName = asset.fileName || `support_img_${Date.now()}.jpg`;

    setStagedAttachment({
      uri: asset.uri,
      name: fileName,
      type: "image",
    });
    setIsUploadingAttachment(true);
    setSendError(null);

    // 2. Client-side Image Compression via expo-image-manipulator
    let uploadUri = asset.uri;
    try {
      console.log("[SupportChat] 🖼️ Optimizing image resolution & compression...");
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      if (manipResult?.uri) {
        uploadUri = manipResult.uri;
        console.log("[SupportChat] ✅ Image optimized successfully:", {
          originalUri: asset.uri,
          optimizedUri: uploadUri,
        });
      }
    } catch (compressionErr) {
      console.warn(
        "[SupportChat] ⚠️ Image optimization skipped, using original:",
        compressionErr
      );
    }

    try {
      const uploadedCloudUrl = await uploadImage(uploadUri, {
        name: fileName,
        type: asset.mimeType || "image/jpeg",
      });

      if (uploadedCloudUrl) {
        setStagedAttachment({
          uri: uploadUri,
          url: uploadedCloudUrl,
          name: fileName,
          type: "image",
        });
      } else {
        setStagedAttachment(null);
        setSendError("Failed to upload image. Please try again.");
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setStagedAttachment(null);
      setSendError(
        "Unable to upload image. Please check your network connection."
      );
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleLaunchCamera = async () => {
    setShowAttachmentSheet(false);
    setTimeout(async () => {
      try {
        console.log("[SupportChat] 📸 Requesting camera permissions...");
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Camera Permission Required",
            "Please allow camera access in your device settings to take and send photos."
          );
          return;
        }
        console.log("[SupportChat] 📸 Launching camera...");
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });

        console.log("[SupportChat] 📸 Camera result:", {
          canceled: result.canceled,
          count: result.assets?.length,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          await processSelectedAsset(result.assets[0]);
        }
      } catch (err: any) {
        console.error("[SupportChat] ❌ Error launching camera:", err);
        setSendError("Unable to access camera: " + (err?.message || "Unknown error"));
      }
    }, 120);
  };

  const handleLaunchGallery = async () => {
    setShowAttachmentSheet(false);
    setTimeout(async () => {
      try {
        console.log("[SupportChat] 🖼️ Launching photo library...");
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });

        console.log("[SupportChat] 🖼️ Gallery result:", {
          canceled: result.canceled,
          count: result.assets?.length,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          await processSelectedAsset(result.assets[0]);
        }
      } catch (err: any) {
        console.error("[SupportChat] ❌ Error picking image:", err);
        try {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Required",
              "Please allow photo library access in your device settings to select pictures."
            );
            return;
          }
        } catch {
          // Ignore secondary permission check failure
        }
        setSendError("Unable to open photo library: " + (err?.message || "Unknown error"));
      }
    }, 120);
  };

  const handleSharePreviewImage = async () => {
    if (!previewImageUrl || isSharingImage) return;
    setIsSharingImage(true);
    try {
      if (await Sharing.isAvailableAsync()) {
        if (previewImageUrl.startsWith("http")) {
          const filename =
            previewImageUrl.split("/").pop()?.split("?")[0] ||
            "support_attachment.jpg";
          const localUri = `${FileSystem.cacheDirectory}${Date.now()}_${filename}`;
          const downloadRes = await FileSystem.downloadAsync(
            previewImageUrl,
            localUri
          );
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          await Sharing.shareAsync(previewImageUrl);
        }
      } else {
        await Linking.openURL(previewImageUrl);
      }
    } catch (err) {
      console.error("[SupportChat] Error sharing preview image:", err);
      Alert.alert("Unable to share", "Could not share or save this image.");
    } finally {
      setIsSharingImage(false);
    }
  };

  const handlePickImage = () => {
    setShowAttachmentSheet(true);
  };

  // Log render state for debugging
  useEffect(() => {
    console.log("[ChatScreen] 📱 Render State:", {
      isLoading,
      hasError: Boolean(error),
      errorStatus,
      errorMessage,
      isChatNotFound,
      messagesCount: messages.length,
      isSocketConnected,
      isAdminOnline,
      stage,
      forceNewChat,
    });
  }, [
    isLoading,
    error,
    errorStatus,
    errorMessage,
    isChatNotFound,
    messages.length,
    isSocketConnected,
    isAdminOnline,
    stage,
    forceNewChat,
  ]);

  // Auto-scroll to latest message on messages update
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);


  const handleOpenDocument = async (url?: string | null, fileName?: string | null) => {
    if (!url) return;
    console.log("[SupportChat] 📄 Attempting to open document URL:", url, { fileName });

    try {
      // 1. Try opening via Expo WebBrowser (In-App Browser Custom Tab)
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor: "#155D5F",
      });
    } catch (browserError) {
      console.warn("[SupportChat] ⚠️ WebBrowser failed, trying fallbacks:", browserError);
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          // 2. Fallback to Google Docs PDF Viewer
          const docsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
          await Linking.openURL(docsViewerUrl);
        }
      } catch (fallbackError) {
        console.error("[SupportChat] ❌ Failed to open document:", fallbackError);
        Alert.alert(
          "Unable to open document",
          "Could not open this document. Please check your internet connection or verify the link."
        );
      }
    }
  };

  const handleSend = async () => {
    const textToSend = inputText.trim();
    const attachmentToSend = stagedAttachment;

    if ((!textToSend && !attachmentToSend?.url) || isSending || isUploadingAttachment) {
      return;
    }

    setSendError(null);
    setInputText("");
    setStagedAttachment(null);

    const success = await sendMessage({
      text: textToSend,
      attachmentUrl: attachmentToSend?.url,
      fileType: attachmentToSend?.type,
      fileName: attachmentToSend?.name,
    });

    if (!success) {
      // Restore input text and staged attachment on error
      setInputText(textToSend);
      setStagedAttachment(attachmentToSend);
      setSendError(
        "Message could not be sent. Please check your connection and tap send again."
      );
    }
  };

  const handlePromptSelect = (promptText: string) => {
    setInputText(promptText);
    if (sendError) setSendError(null);
  };

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    setShowScrollBottom(distanceFromBottom > 160);
  }, []);

  const renderStageBanner = () => {
    if (stage === "resolved") {
      return (
        <View className="bg-[#F0FDF4] border border-[#BBF7D0] mx-4 my-2 p-3.5 rounded-2xl shadow-sm">
          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text className="text-xs font-bold text-[#166534] ml-2 flex-1">
              Support session resolved
            </Text>
          </View>
          <Text className="text-[11px] text-[#166534]/80 mb-2.5 leading-4">
            How was your support experience? Your rating helps our team improve.
          </Text>
          {hasSubmittedFeedback ? (
            <View className="bg-white/80 py-1.5 px-3 rounded-lg border border-[#BBF7D0] self-start flex-row items-center">
              <Text className="text-[11px] font-semibold text-[#166534]">
                Thank you! Your feedback has been recorded. ⭐
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => {
                    setCsatRating(star);
                    setHasSubmittedFeedback(true);
                  }}
                  className="p-1"
                  accessibilityLabel={`Rate ${star} star`}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={(csatRating ?? 0) >= star ? "star" : "star-outline"}
                    size={22}
                    color="#EAB308"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    // Only show queued banner if stage is queue, messages have been sent, and no support agent has responded yet
    const hasAgentReplied = messages.some((m) => isSupportMessage(m));
    if (stage === "queue" && messages.length > 0 && !hasAgentReplied) {
      return (
        <View className="bg-[#FFFBEB] border border-[#FDE68A] mx-4 my-2 px-3.5 py-2.5 rounded-xl flex-row items-center shadow-sm">
          <Ionicons name="time-outline" size={18} color="#D97706" />
          <Text className="text-xs text-[#92400E] ml-2.5 flex-1 font-medium leading-4">
            Your ticket is queued. A support agent will respond shortly.
          </Text>
        </View>
      );
    }

    // If active or empty, no queued banner
    return null;
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: SupportMessage;
    index: number;
  }) => {
    const isPending = item.id.startsWith("client_temp_");
    const isSupport = isSupportMessage(item);
    const isMe = isPending || !isSupport;

    // 1. Date Divider using robust timestamp extraction
    const currentTimestamp = getMessageTimestamp(item);
    const currentDate = currentTimestamp
      ? new Date(currentTimestamp).toDateString()
      : "";

    const prevTimestamp =
      index > 0 ? getMessageTimestamp(messages[index - 1]) : "";
    const prevDate = prevTimestamp
      ? new Date(prevTimestamp).toDateString()
      : "";

    const showDateDivider =
      !prevDate || (currentDate !== "" && currentDate !== prevDate);
    const dateLabel =
      showDateDivider && currentTimestamp
        ? getDateLabel(currentTimestamp)
        : "";

    // 2. Message Clustering & Type Transitions
    const prevItem = index > 0 ? messages[index - 1] : null;
    const nextItem = index < messages.length - 1 ? messages[index + 1] : null;

    const prevIsMe = prevItem
      ? prevItem.id.startsWith("client_temp_") || !isSupportMessage(prevItem)
      : null;
    const nextIsMe = nextItem
      ? nextItem.id.startsWith("client_temp_") || !isSupportMessage(nextItem)
      : null;

    const isFirstInCluster = prevIsMe !== isMe || showDateDivider;
    const isLastInCluster = nextIsMe !== isMe;

    const senderName = isMe ? "You" : item.senderName || "Wealthconomy Support";

    // Spacing between different types/clusters of messages
    const isTypeTransition = isFirstInCluster && index > 0 && !showDateDivider;

    return (
      <View
        key={`${item.id}-${index}`}
        style={isTypeTransition ? { marginTop: 14 } : undefined}
      >
        {/* Date Divider Pill */}
        {showDateDivider && dateLabel ? (
          <View className="items-center my-4">
            <View className="bg-[#F3F4F6] px-4 py-1.5 rounded-full border border-gray-200/60 shadow-sm">
              <Text className="text-[11px] font-semibold text-[#6B7280]">
                {dateLabel}
              </Text>
            </View>
          </View>
        ) : null}

        <View
          className={`flex-row max-w-[85%] ${
            isLastInCluster ? "mb-2" : "mb-1"
          } ${!isMe ? "self-start" : "self-end flex-row-reverse"}`}
        >
          {/* Avatar for Support Agent */}
          {!isMe ? (
            isFirstInCluster ? (
              <Image
                source={require("../../assets/images/logo1.png")}
                className="w-8 h-8 rounded-full mr-2 mt-1 shadow-sm"
                resizeMode="contain"
              />
            ) : (
              <View className="w-8 mr-2" />
            )
          ) : null}

          <View className="flex-1">
            {/* Sender Label (Agent only on first in cluster) */}
            {!isMe && isFirstInCluster && (
              <Text className="text-[11px] font-bold text-[#155D5F] ml-1 mb-1.5">
                {senderName}
              </Text>
            )}

            {/* Bubble */}
            <TouchableOpacity
              activeOpacity={0.9}
              delayLongPress={300}
              onLongPress={() => item.text && handleCopyMessage(item.text)}
              className={`px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
                item.isFailed
                  ? "bg-red-50 border border-red-300 rounded-2xl"
                  : !isMe
                  ? `bg-[#F3F4F6] text-[#323232] rounded-2xl ${
                      !isFirstInCluster ? "rounded-tl-md" : "rounded-tl-none"
                    } ${!isLastInCluster ? "rounded-bl-md" : ""}`
                  : `bg-[#E7F5F5] text-[#155D5F] rounded-2xl ${
                      !isFirstInCluster ? "rounded-tr-md" : "rounded-tr-none"
                    } ${!isLastInCluster ? "rounded-br-md" : ""}`
              }`}
            >
              {/* Attachment Display */}
              {item.attachmentUrl && (
                <View className="mb-2">
                  {item.fileType === "image" ||
                  /\.(jpg|jpeg|png|webp|gif)$/i.test(item.attachmentUrl) ? (
                    <TouchableOpacity
                      onPress={() => setPreviewImageUrl(item.attachmentUrl || null)}
                      activeOpacity={0.9}
                      className="rounded-xl overflow-hidden bg-black/5 border border-black/5"
                    >
                      <Image
                        source={{ uri: item.attachmentUrl }}
                        className="w-56 h-48 rounded-xl"
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded-full flex-row items-center">
                        <Ionicons name="expand-outline" size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleOpenDocument(item.attachmentUrl, item.fileName)}
                      activeOpacity={0.8}
                      className="p-3 rounded-2xl bg-white border border-gray-200/90 shadow-xs max-w-[260px]"
                    >
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-xl bg-[#155D5F]/10 items-center justify-center mr-3">
                          <Ionicons name="document-text" size={22} color="#155D5F" />
                        </View>
                        <View className="flex-1 min-w-0 pr-1">
                          <Text className="text-xs font-bold text-gray-800" numberOfLines={1}>
                            {item.fileName || "Document attachment"}
                          </Text>
                          <View className="flex-row items-center mt-0.5">
                            <View className="bg-red-50 px-1.5 py-0.5 rounded mr-1.5 border border-red-100">
                              <Text className="text-[9px] font-bold text-red-600">PDF</Text>
                            </View>
                            <Text className="text-[10px] text-[#155D5F] font-semibold">
                              Tap to open / view
                            </Text>
                          </View>
                        </View>
                        <View className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 items-center justify-center">
                          <Ionicons name="arrow-down-outline" size={14} color="#155D5F" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Text Caption / Body */}
              {item.text ? (
                <Text
                  className={`text-[14.5px] leading-5 ${
                    !isMe ? "text-[#1F2937]" : "text-[#155D5F]"
                  }`}
                >
                  {item.text}
                </Text>
              ) : null}

              {/* Timestamp & Status Indicator */}
              <View className="flex-row items-center justify-end mt-1.5 space-x-1">
                <Text
                  className={`text-[10px] font-medium ${
                    !isMe ? "text-[#9CA3AF]" : "text-[#408688]"
                  }`}
                >
                  {formatMessageTime(getMessageTimestamp(item))}
                </Text>

                {isMe && (
                  <View className="ml-1.5 flex-row items-center">
                    {item.isFailed ? (
                      <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    ) : isPending ? (
                      <ActivityIndicator size={10} color="#408688" />
                    ) : item.isRead ? (
                      <Ionicons
                        name="checkmark-done"
                        size={13}
                        color="#155D5F"
                      />
                    ) : (
                      <Ionicons name="checkmark" size={13} color="#408688" />
                    )}
                  </View>
                )}
              </View>

              {/* Retry button if message delivery failed */}
              {item.isFailed && (
                <TouchableOpacity
                  onPress={() => retryMessage(item)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-end mt-2 pt-1.5 border-t border-red-200/80"
                >
                  <Ionicons name="refresh-circle" size={15} color="#DC2626" />
                  <Text className="text-[11px] font-bold text-red-600 ml-1">
                    Failed to send • Tap to retry
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Floating Copied Toast */}
      {copiedToast && (
        <View
          style={{ top: Math.max(insets.top, 20) + 48 }}
          className="absolute self-center z-50 bg-[#1F2937]/90 px-4 py-2 rounded-full shadow-lg flex-row items-center border border-white/20"
        >
          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
          <Text className="text-white text-xs font-semibold ml-1.5">{copiedToast}</Text>
        </View>
      )}

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 h-14 border-b border-[#F3F4F6] bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-1 rounded-full active:bg-gray-100"
        >
          <Ionicons name="chevron-back" size={26} color="#1F2937" />
        </TouchableOpacity>

        <View className="items-center flex-1 mx-2">
          <Text className="text-base font-bold text-[#1F2937]">
            Customer Support
          </Text>
          <View className="flex-row items-center mt-0.5">
            <View
              className={`w-2 h-2 rounded-full mr-1.5 ${
                isSocketConnected
                  ? isAdminOnline
                    ? "bg-[#10B981]"
                    : "bg-[#3B82F6]"
                  : "bg-[#F59E0B]"
              }`}
            />
            <Text className="text-[11px] font-medium text-[#6B7280]">
              {isSocketConnected
                ? isAdminOnline
                  ? "Support Online (Live)"
                  : "Connected"
                : "Connecting Live Socket..."}
            </Text>
          </View>
        </View>

        {stage && messages.length > 0 ? (
          <View
            className={`px-2.5 py-1 rounded-full ${
              stage === "active"
                ? "bg-[#DCFCE7]"
                : stage === "queue"
                ? "bg-[#FEF3C7]"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-wider ${
                stage === "active"
                  ? "text-[#15803D]"
                  : stage === "queue"
                  ? "text-[#B45309]"
                  : "text-gray-600"
              }`}
            >
              {stage}
            </Text>
          </View>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {renderStageBanner()}

      {/* Financial Security Advisory Banner */}
      {showSecurityNotice && (
        <View className="mx-4 my-1.5 px-3.5 py-2 bg-blue-50/70 border border-blue-100 rounded-xl flex-row items-center justify-between shadow-xs">
          <View className="flex-row items-center flex-1 mr-2">
            <Ionicons name="shield-checkmark" size={16} color="#155D5F" />
            <Text className="text-[11px] text-gray-600 ml-2 font-medium leading-4">
              <Text className="font-bold text-[#155D5F]">Security Advisory: </Text>
              Never share your account PIN, password, or full card digits.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSecurityNotice(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss security advisory"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={15} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Error banner if send failed */}
      {sendError && (
        <View className="bg-red-50 border border-red-200 mx-4 my-2 px-3 py-2 rounded-lg flex-row items-center">
          <Ionicons name="alert-circle" size={16} color="#DC2626" />
          <Text className="text-xs text-red-700 ml-2 flex-1">{sendError}</Text>
          <TouchableOpacity onPress={() => setSendError(null)}>
            <Ionicons name="close" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content / Messages */}
      {isLoading ? (
        <ChatSkeletonLoading />
      ) : error && !forceNewChat ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-2">
            <Ionicons name="alert-circle-outline" size={38} color="#EF4444" />
          </View>
          <Text className="text-base font-bold text-gray-800 text-center">
            Unable to load conversation
          </Text>

          {/* Status badge if available */}
          {errorStatus && (
            <View className="mt-2 mb-1 px-3 py-1 bg-red-100 rounded-full border border-red-200">
              <Text className="text-[11px] font-bold text-red-700">
                Status: {errorStatus}{" "}
                {errorStatus === 401
                  ? "• Session Expired"
                  : errorStatus === 404
                  ? "• Not Found"
                  : errorStatus === 500
                  ? "• Server Error"
                  : ""}
              </Text>
            </View>
          )}

          <Text className="text-sm text-gray-500 text-center mt-1 mb-4 max-w-[280px]">
            {errorMessage || "Please check your network connection and try again."}
          </Text>

          {/* Action buttons */}
          <View className="flex-row items-center space-x-3 mb-4">
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-[#155D5F] px-5 py-2.5 rounded-lg active:scale-95"
            >
              <Text className="text-white text-sm font-semibold">Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setForceNewChat(true)}
              className="bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-lg active:scale-95"
            >
              <Text className="text-gray-700 text-sm font-medium">
                Start New Chat
              </Text>
            </TouchableOpacity>
          </View>

          {/* Technical Diagnostics disclosure */}
          <TouchableOpacity
            onPress={() => setShowErrorDiagnostics((prev) => !prev)}
            className="flex-row items-center py-1 px-2"
          >
            <Ionicons
              name={showErrorDiagnostics ? "chevron-up" : "chevron-down"}
              size={14}
              color="#6B7280"
            />
            <Text className="text-xs text-gray-500 font-medium ml-1">
              {showErrorDiagnostics ? "Hide Technical Details" : "View Technical Details"}
            </Text>
          </TouchableOpacity>

          {showErrorDiagnostics && (
            <View className="mt-3 w-full max-w-[320px] bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Text className="text-[11px] font-bold text-gray-700 mb-1">
                Endpoint: GET /api/v1/support/chat
              </Text>
              <Text className="text-[10px] text-gray-600 font-mono" numberOfLines={6}>
                {JSON.stringify(rawError || error, null, 2)}
              </Text>
            </View>
          )}
        </View>
      ) : messages.length === 0 ? (
        <View className="flex-1 px-6 justify-center items-center">
          <Image
            source={require("../../assets/images/logo1.png")}
            className="w-16 h-16 rounded-2xl mb-4 opacity-90"
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-gray-800 text-center">
            Wealthconomy Support
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2 mb-6 leading-5 max-w-[280px]">
            Hello! How can our support team assist you today? Pick a topic or type a message below.
          </Text>

          {/* Topics Section with Distinct Gaps */}
          <View className="w-full mb-3 flex-row items-center justify-between px-1">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Suggested Topics
            </Text>
            <View className="h-[1px] flex-1 bg-gray-200/60 ml-3 rounded-full" />
          </View>

          {/* Quick suggestions chips with distinct gap separation */}
          <View className="w-full">
            {QUICK_PROMPTS.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handlePromptSelect(p.text)}
                activeOpacity={0.7}
                className="flex-row items-center bg-white border border-gray-200/80 p-3.5 rounded-2xl shadow-sm active:bg-gray-50"
                style={{ marginBottom: 12 }}
              >
                <View className="w-9 h-9 rounded-xl bg-[#155D5F]/10 items-center justify-center mr-3">
                  <Ionicons name={p.icon} size={19} color="#155D5F" />
                </View>
                <View className="flex-1 pr-1">
                  <Text className="text-[13px] font-bold text-gray-800">
                    {p.label}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5" numberOfLines={1}>
                    {p.text}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View className="flex-1 relative">
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.id || "msg"}-${index}`}
            renderItem={renderMessage}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={Platform.OS === "android"}
            onScroll={handleScroll}
            scrollEventThrottle={60}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (!showScrollBottom) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />

          {/* Floating Scroll-to-Bottom Button */}
          {showScrollBottom && (
            <TouchableOpacity
              onPress={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              className="absolute bottom-4 right-4 bg-white/95 border border-gray-200 shadow-md rounded-full w-10 h-10 items-center justify-center active:scale-95 z-20"
            >
              <Ionicons name="chevron-down" size={20} color="#155D5F" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Input Bar & Attachment Preview */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Staged Attachment Preview Strip */}
        {stagedAttachment && (
          <View className="flex-row items-center px-4 py-2 bg-[#F9FAFB] border-t border-[#E5E7EB]">
            <View className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 mr-3">
              {stagedAttachment.type === "image" ? (
                <Image
                  source={{ uri: stagedAttachment.uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-gray-100">
                  <Ionicons name="document-text" size={24} color="#155D5F" />
                </View>
              )}
              {isUploadingAttachment && (
                <View className="absolute inset-0 bg-black/40 items-center justify-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>

            <View className="flex-1 min-w-0 pr-2">
              <Text
                className="text-xs font-bold text-gray-800"
                numberOfLines={1}
              >
                {stagedAttachment.name}
              </Text>
              <Text className="text-[11px] text-gray-500 mt-0.5 font-medium">
                {isUploadingAttachment
                  ? "Uploading image..."
                  : "Ready to send"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setStagedAttachment(null);
                setIsUploadingAttachment(false);
              }}
              disabled={isSending}
              className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center active:bg-gray-300"
            >
              <Ionicons name="close" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center px-3 py-2.5 border-t border-[#F3F4F6] bg-white">
          {/* Attachment Paperclip Button */}
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={isSending || isUploadingAttachment}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            {isUploadingAttachment ? (
              <ActivityIndicator size={18} color="#155D5F" />
            ) : (
              <Ionicons name="attach" size={22} color="#6B7280" />
            )}
          </TouchableOpacity>

          <View className="flex-1 bg-[#F9FAFB] rounded-xl mx-1 px-4 max-h-[120px] border border-[#E5E7EB] flex-row items-center">
            <TextInput
              className="flex-1 text-[15px] py-2.5 text-[#1F2937]"
              placeholder="Write a message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                if (sendError) setSendError(null);
              }}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 150);
              }}
              multiline
              editable={!isSending}
            />
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={() => setInputText("")}
                className="p-1 -mr-1"
              >
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {(() => {
            const canSend =
              (inputText.trim().length > 0 || Boolean(stagedAttachment?.url)) &&
              !isSending &&
              !isUploadingAttachment;

            return (
              <TouchableOpacity
                className={`w-10 h-10 items-center justify-center rounded-full ml-1 active:scale-95 ${
                  canSend ? "bg-[#155D5F] shadow-sm" : "bg-gray-100"
                }`}
                onPress={handleSend}
                disabled={!canSend}
              >
                {isSending || isUploadingAttachment ? (
                  <ActivityIndicator size="small" color={canSend ? "#FFFFFF" : "#408688"} />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={canSend ? "#FFFFFF" : "#9CA3AF"}
                  />
                )}
              </TouchableOpacity>
            );
          })()}
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Options Action Sheet (In-page overlay to avoid native modal dismissal collision with ImagePicker) */}
      {showAttachmentSheet && (
        <View
          style={{
            position: "absolute",
            top: -insets.top,
            bottom: -insets.bottom,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 999,
          }}
        >
          <Pressable
            className="flex-1 bg-black/50 justify-end"
            onPress={() => setShowAttachmentSheet(false)}
          >
            <Pressable
              style={{ paddingBottom: Math.max(insets.bottom, 16) + 14 }}
              className="bg-white rounded-t-3xl pt-5 px-5 shadow-2xl"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Sheet Handle */}
              <View className="items-center mb-3">
                <View className="w-10 h-1.5 rounded-full bg-gray-300" />
              </View>

              <Text className="text-base font-bold text-gray-900 mb-1">
                Add Attachment
              </Text>
              <Text className="text-xs text-gray-500 mb-4">
                Take a photo or choose an image to attach to your support message.
              </Text>

              <View className="mb-2">
                <TouchableOpacity
                  onPress={handleLaunchCamera}
                  activeOpacity={0.7}
                  className="flex-row items-center p-3.5 rounded-2xl bg-gray-50 active:bg-gray-100 border border-gray-100 mb-2.5"
                >
                  <View className="w-10 h-10 rounded-xl bg-[#155D5F]/10 items-center justify-center mr-3.5">
                    <Ionicons name="camera" size={20} color="#155D5F" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-900">
                      Take Photo
                    </Text>
                    <Text className="text-[11px] text-gray-400">
                      Use camera to capture receipts or documents
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLaunchGallery}
                  activeOpacity={0.7}
                  className="flex-row items-center p-3.5 rounded-2xl bg-gray-50 active:bg-gray-100 border border-gray-100"
                >
                  <View className="w-10 h-10 rounded-xl bg-[#155D5F]/10 items-center justify-center mr-3.5">
                    <Ionicons name="images" size={20} color="#155D5F" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-900">
                      Photo Library
                    </Text>
                    <Text className="text-[11px] text-gray-400">
                      Choose photos or screenshots from device
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setShowAttachmentSheet(false)}
                className="mt-3 py-3 items-center rounded-xl bg-gray-100 active:bg-gray-200"
              >
                <Text className="text-sm font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </View>
      )}

      {/* Fullscreen Image Preview Lightbox */}
      <Modal
        visible={Boolean(previewImageUrl)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View className="flex-1 bg-black/95">
          <StatusBar barStyle="light-content" />

          {/* Top Bar with safe area padding - positioned comfortably below the status bar / notch / punch hole */}
          <View
            style={{
              paddingTop: Math.max(insets.top, 24) + 12,
              paddingHorizontal: 16,
            }}
            className="flex-row items-center justify-between z-50"
          >
            {/* Image title indicator */}
            <View className="bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              <Text className="text-xs font-semibold text-white/90">
                Attachment Preview
              </Text>
            </View>

            {/* Actions: Share & Close */}
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleSharePreviewImage}
                disabled={isSharingImage}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="w-10 h-10 rounded-full bg-white/15 items-center justify-center active:bg-white/30 border border-white/20 mr-3"
              >
                {isSharingImage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="share-outline" size={19} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreviewImageUrl(null)}
                activeOpacity={0.7}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                className="w-10 h-10 rounded-full bg-white/25 items-center justify-center active:bg-white/40 border border-white/30"
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Central Interactive Image with Backdrop Tap to Dismiss */}
          <Pressable
            className="flex-1 justify-center items-center px-3"
            onPress={() => setPreviewImageUrl(null)}
          >
            {previewImageUrl && (
              <Image
                source={{ uri: previewImageUrl }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </Pressable>

          {/* Bottom Bar with safe area padding */}
          <View
            style={{
              paddingBottom: Math.max(insets.bottom, 16) + 14,
            }}
            className="items-center z-50"
          >
            <TouchableOpacity
              onPress={() => setPreviewImageUrl(null)}
              activeOpacity={0.8}
              className="bg-white/15 px-5 py-2.5 rounded-full border border-white/20 active:bg-white/25 flex-row items-center shadow-lg"
            >
              <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold ml-2">
                Tap anywhere to close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
