import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupportChat } from "@/src/features/support/hooks/useSupportChat";
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
    refetch,
    isSocketConnected,
    isAdminOnline,
    stage,
    isSending,
    sendMessage,
  } = useSupportChat();

  const [inputText, setInputText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const flatListRef = useRef<FlatList<SupportMessage>>(null);

  // Auto-scroll to latest message on messages update
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    setSendError(null);
    const textToSend = inputText;
    setInputText("");
    const success = await sendMessage(textToSend);
    if (!success) {
      // Restore input text on error
      setInputText(textToSend);
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
        <View className="bg-[#F0FDF4] border border-[#BBF7D0] mx-4 my-2 px-3.5 py-2.5 rounded-xl flex-row items-center shadow-sm">
          <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
          <Text className="text-xs text-[#166534] ml-2.5 flex-1 font-medium leading-4">
            This support session is resolved. Send a message anytime to reopen.
          </Text>
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
            <View
              className={`px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
                !isMe
                  ? `bg-[#F3F4F6] text-[#323232] rounded-2xl ${
                      !isFirstInCluster ? "rounded-tl-md" : "rounded-tl-none"
                    } ${!isLastInCluster ? "rounded-bl-md" : ""}`
                  : `bg-[#E7F5F5] text-[#155D5F] rounded-2xl ${
                      !isFirstInCluster ? "rounded-tr-md" : "rounded-tr-none"
                    } ${!isLastInCluster ? "rounded-br-md" : ""}`
              }`}
            >
              <Text
                className={`text-[14.5px] leading-5 ${
                  !isMe ? "text-[#1F2937]" : "text-[#155D5F]"
                }`}
              >
                {item.text}
              </Text>

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
                    {isPending ? (
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
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

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

        {stage ? (
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
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-base font-semibold text-gray-800 mt-3">
            Unable to load conversation
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-1 mb-4">
            Please check your network connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#155D5F] px-5 py-2.5 rounded-lg active:scale-95"
          >
            <Text className="text-white text-sm font-semibold">Retry</Text>
          </TouchableOpacity>
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

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View className="flex-row items-center px-3 py-2.5 border-t border-[#F3F4F6] bg-white">
          {/* Attachment Paperclip Button */}
          <TouchableOpacity
            onPress={() => {
              setSendError(
                "Attachment sharing will be enabled in the upcoming update."
              );
            }}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            <Ionicons name="attach" size={22} color="#6B7280" />
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

          <TouchableOpacity
            className={`w-10 h-10 items-center justify-center rounded-full ml-1 active:scale-95 ${
              inputText.trim() && !isSending
                ? "bg-[#155D5F] shadow-sm"
                : "bg-gray-100"
            }`}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
