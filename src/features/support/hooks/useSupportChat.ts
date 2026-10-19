import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/src/store";
import {
  supportApi,
  useGetSupportChatQuery,
  useSendSupportMessageMutation,
  useMarkChatClientReadMutation,
} from "@/src/store/api/supportApi";
import { socketService } from "@/src/services/socketService";
import {
  SupportMessage,
  SupportChat,
  ChatStage,
  SocketNewMessageEvent,
  SocketUserStatusChangeEvent,
} from "@/src/types/support";

export function useSupportChat() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState<boolean | null>(null);
  const [isSending, setIsSending] = useState(false);

  // 1. Fetch active support chat thread from REST with active background sync
  const {
    data: chat,
    isLoading,
    isFetching,
    error: rawError,
    refetch,
  } = useGetSupportChatQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
    pollingInterval: isSocketConnected ? 0 : 5000,
  });

  // Check if user doesn't have an active chat session yet:
  // 1. Backend 200 OK with data: null (Scenario B)
  // 2. Legacy/fallback 404 response
  const isChatNotFound =
    (!rawError && chat === null) ||
    (Boolean(rawError) &&
      ((rawError as any)?.status === 404 ||
        (rawError as any)?.data?.statusCode === 404 ||
        (typeof (rawError as any)?.data?.message === "string" &&
          /(not found|no active|no chat)/i.test((rawError as any).data.message))));

  // If chat not found (empty state), it's not a fatal error; it's a new empty chat state
  const error = isChatNotFound ? null : rawError;

  const errorStatus: number | string | null = rawError
    ? (rawError as any)?.status ?? (rawError as any)?.data?.statusCode ?? null
    : null;

  const errorMessage: string | null = rawError
    ? (rawError as any)?.data?.message ||
      (rawError as any)?.error ||
      (rawError as any)?.message ||
      "Unable to connect to support server."
    : null;

  // Log authentication & token state
  useEffect(() => {
    console.log("[SupportChat] 🔑 Auth Status:", {
      hasToken: Boolean(token),
      tokenLength: token?.length,
      tokenSnippet: token ? `${token.substring(0, 15)}...` : null,
      userId: currentUser?.id,
      userName: currentUser?.name || currentUser?.firstName,
      email: (currentUser as any)?.email,
    });
  }, [token, currentUser]);

  // Log query loading & error states
  useEffect(() => {
    if (isLoading) {
      console.log("[SupportChat] ⏳ Fetching conversation from /support/chat...");
    }
  }, [isLoading]);

  useEffect(() => {
    if (rawError) {
      if (isChatNotFound) {
        console.log(
          `[SupportChat] ℹ️ User has no existing support chat session (HTTP 404: "${errorMessage}"). Initializing empty conversation mode.`
        );
      } else {
        console.error("[SupportChat] ❌ GET /support/chat returned error:", {
          status: errorStatus,
          message: errorMessage,
          rawError,
        });
      }
    } else if (chat === null && !isLoading) {
      console.log(
        "[SupportChat] ℹ️ GET /support/chat returned 200 OK with data: null (No active chat). Initializing empty conversation mode."
      );
    }
  }, [rawError, isChatNotFound, errorStatus, errorMessage, chat, isLoading]);

  const [sendSupportMessageApi] = useSendSupportMessageMutation();
  const [markChatClientReadApi] = useMarkChatClientReadMutation();

  const chatIdRef = useRef<string | undefined>(chat?.id);
  useEffect(() => {
    chatIdRef.current = chat?.id;
  }, [chat?.id]);

  // Log active chat data on arrival
  useEffect(() => {
    if (chat) {
      console.log("[SupportChat] 📥 Active chat session loaded:", {
        chatId: chat.id,
        stage: chat.stage,
        status: chat.status,
        messagesCount: chat.messages?.length ?? 0,
      });
    }
  }, [chat]);

  // Sync admin status from initial chat response
  useEffect(() => {
    if (chat?.status) {
      setIsAdminOnline(chat.status === "online");
    }
  }, [chat?.status]);

  // 2. Setup Socket.IO connection & listeners
  useEffect(() => {
    if (!token) {
      console.log("[SupportChat] ⚠️ No auth token found; skipping socket connection.");
      return;
    }

    console.log("[SupportChat] 🚀 Initializing Support Socket with auth token...");
    socketService.connect(token);

    const unsubConnection = socketService.onConnectionChange((connected) => {
      setIsSocketConnected(connected);
      console.log(`[SupportChat] 🔌 Socket connection status updated: ${connected ? "CONNECTED 🟢" : "DISCONNECTED 🔴"}`);
    });

    // Listen for new messages incoming via socket
    const unsubNewMessage = socketService.onNewMessage(
      (data: SocketNewMessageEvent) => {
        if (!data?.message) return;

        const incoming = data.message;
        console.log("[SupportChat] 📨 Adding incoming message to state:", incoming);

        dispatch(
          supportApi.util.updateQueryData(
            "getSupportChat",
            undefined,
            (draft: SupportChat | null) => {
              if (!draft) {
                return {
                  id: incoming.chatId || "",
                  userId: "",
                  userName: "",
                  status: "online",
                  stage: "queue",
                  isAdmin: false,
                  createdAt: incoming.time,
                  updatedAt: incoming.time,
                  messages: [incoming],
                  lastMessage:
                    incoming.text ||
                    (incoming.fileType === "image"
                      ? "📷 Image"
                      : incoming.attachmentUrl
                      ? "📎 Attachment"
                      : ""),
                  lastMessageTime: incoming.time,
                };
              }
              if (!draft.messages) draft.messages = [];
              // Check if matching temp message exists or if already added
              const existingIdx = draft.messages.findIndex(
                (m) =>
                  m.id === incoming.id ||
                  (m.id.startsWith("client_temp_") &&
                    ((m.text && m.text === incoming.text) ||
                      (m.attachmentUrl && m.attachmentUrl === incoming.attachmentUrl)))
              );
              if (existingIdx !== -1) {
                draft.messages[existingIdx] = incoming;
              } else {
                draft.messages.push(incoming);
              }
              draft.lastMessage =
                incoming.text ||
                (incoming.fileType === "image"
                  ? "📷 Image"
                  : incoming.attachmentUrl
                  ? "📎 Attachment"
                  : "");
              draft.lastMessageTime = incoming.time;
            }
          )
        );

        // If incoming message is from support agent, mark as read
        const isFromAgent =
          incoming.senderRole === "ADMIN" ||
          incoming.senderRole === "SUPER_ADMIN" ||
          incoming.sender === "admin" ||
          incoming.senderName === "Admin Support" ||
          incoming.senderName === "Admin" ||
          /\b(admin\s*support|support\s*team|wealthconomy\s*support)\b/i.test(
            incoming.senderName || ""
          );

        if (isFromAgent) {
          dispatch(
            supportApi.util.updateQueryData(
              "getSupportChat",
              undefined,
              (draft: SupportChat | null) => {
                if (draft) {
                  draft.stage = "active";
                }
              }
            )
          );
          if (chatIdRef.current) {
            console.log("[SupportChat] 📥 Auto-marking incoming agent message as read");
            socketService.markAsRead(chatIdRef.current, "client");
          }
        }
      }
    );

    // Listen for admin online status change
    const unsubStatus = socketService.onUserStatusChange(
      (data: SocketUserStatusChangeEvent) => {
        if (data?.status) {
          console.log("[SupportChat] 👤 Support admin online status:", data.status);
          setIsAdminOnline(data.status === "online");
        }
      }
    );

    // Listen for real-time ticket stage / session updates
    const activeSocket = socketService.getSocket();
    const handleStageUpdate = (data: any) => {
      console.log("[SupportChat] 🔄 Real-time stage update received:", data);
      refetch();
    };

    if (activeSocket) {
      activeSocket.on("ticket:stage_change", handleStageUpdate);
      activeSocket.on("chat:stage_change", handleStageUpdate);
      activeSocket.on("support:stage_change", handleStageUpdate);
      activeSocket.on("support:ticket_update", handleStageUpdate);
      activeSocket.on("chat:update", handleStageUpdate);
    }

    return () => {
      unsubConnection();
      unsubNewMessage();
      unsubStatus();
      if (activeSocket) {
        activeSocket.off("ticket:stage_change", handleStageUpdate);
        activeSocket.off("chat:stage_change", handleStageUpdate);
        activeSocket.off("support:stage_change", handleStageUpdate);
        activeSocket.off("support:ticket_update", handleStageUpdate);
        activeSocket.off("chat:update", handleStageUpdate);
      }
    };
  }, [token, dispatch, refetch]);

  // 3. Mark messages as read when chat is loaded
  useEffect(() => {
    if (chat?.id) {
      console.log("[SupportChat] 👀 Marking active chat messages as read on mount...");
      socketService.markAsRead(chat.id, "client");
      if ((chat.clientUnreadCount ?? 0) > 0) {
        markChatClientReadApi({ chatId: chat.id }).catch(() => {});
      }
    }
  }, [chat?.id, chat?.clientUnreadCount, markChatClientReadApi]);

  // 4. Send Message function (tries socket first, falls back to REST)
  const sendMessage = useCallback(
    async (
      payloadOrText:
        | string
        | {
            text?: string;
            attachmentUrl?: string;
            fileType?: "image" | "pdf" | "document" | string;
            fileName?: string;
          }
    ): Promise<boolean> => {
      const payload =
        typeof payloadOrText === "string"
          ? { text: payloadOrText }
          : payloadOrText;

      const trimmedText = payload.text ? payload.text.trim() : "";
      const hasAttachment = Boolean(payload.attachmentUrl);

      // Must have either non-empty text or an attachment
      if ((!trimmedText && !hasAttachment) || isSending) return false;

      setIsSending(true);

      const tempId = `client_temp_${Date.now()}`;
      const nowIso = new Date().toISOString();
      const optimisticMsg: SupportMessage = {
        id: tempId,
        chatId: chat?.id || "",
        senderName: currentUser?.name || currentUser?.firstName || "You",
        text: trimmedText,
        attachmentUrl: payload.attachmentUrl || null,
        fileType: payload.fileType || null,
        fileName: payload.fileName || null,
        time: nowIso,
        createdAt: nowIso,
        isMe: true,
        isRead: false,
      };

      const displayPreview =
        trimmedText ||
        (payload.fileType === "image"
          ? "📷 Image"
          : payload.attachmentUrl
          ? "📎 Attachment"
          : "");

      console.log(
        `[SupportChat] 📤 Sending message: "${trimmedText}" (hasAttachment: ${hasAttachment}, tempId: ${tempId})`
      );

      // Optimistically push into local cache
      dispatch(
        supportApi.util.updateQueryData(
          "getSupportChat",
          undefined,
          (draft: SupportChat | null) => {
            if (!draft) {
              return {
                id: "",
                userId: currentUser?.id || "",
                userName: currentUser?.name || currentUser?.firstName || "You",
                status: "online",
                stage: "queue",
                isAdmin: false,
                createdAt: nowIso,
                updatedAt: nowIso,
                messages: [optimisticMsg],
                lastMessage: displayPreview,
                lastMessageTime: optimisticMsg.time,
              };
            }
            if (!draft.messages) draft.messages = [];
            draft.messages.push(optimisticMsg);
            draft.lastMessage = displayPreview;
            draft.lastMessageTime = optimisticMsg.time;
          }
        )
      );

      try {
        let success = false;

        const requestBody = {
          chatId: chat?.id || "",
          text: trimmedText,
          ...(payload.attachmentUrl && { attachmentUrl: payload.attachmentUrl }),
          ...(payload.fileType && { fileType: payload.fileType }),
          ...(payload.fileName && { fileName: payload.fileName }),
        };

        // Try Socket.IO if connected and we have a valid chatId
        if (socketService.isConnected() && chat?.id) {
          console.log("[SupportChat] ⚡ Trying Socket.IO message delivery...", requestBody);
          const res = await socketService.sendMessage(requestBody);

          if (res.ok) {
            console.log(
              "[SupportChat] ✅ Message successfully delivered via Socket.IO! Message ID:",
              res.messageId
            );
            success = true;
            // Update temp message ID if backend provided messageId
            if (res.messageId) {
              dispatch(
                supportApi.util.updateQueryData(
                  "getSupportChat",
                  undefined,
                  (draft: SupportChat | null) => {
                    if (!draft?.messages) return;
                    const alreadyExists = draft.messages.some(
                      (m) => m.id === res.messageId
                    );
                    if (alreadyExists) {
                      // Already added by socket event, clean up temp
                      draft.messages = draft.messages.filter((m) => m.id !== tempId);
                    } else {
                      const msg = draft.messages.find((m) => m.id === tempId);
                      if (msg) {
                        msg.id = res.messageId!;
                      }
                    }
                  }
                )
              );
            }
          } else {
            console.warn("[SupportChat] ⚠️ Socket.IO send returned not ok:", res.error);
          }
        }

        // If socket wasn't used or failed, send via REST API
        if (!success) {
          console.log(
            "[SupportChat] 🌐 Delivering message via REST API (POST /api/v1/support/chat/messages)..."
          );
          const res = await sendSupportMessageApi({
            text: trimmedText,
            ...(payload.attachmentUrl && { attachmentUrl: payload.attachmentUrl }),
            ...(payload.fileType && { fileType: payload.fileType }),
            ...(payload.fileName && { fileName: payload.fileName }),
          }).unwrap();

          if (res) {
            console.log(
              "[SupportChat] ✅ Message successfully saved via REST API! Server Message ID:",
              res.id
            );
            dispatch(
              supportApi.util.updateQueryData(
                "getSupportChat",
                undefined,
                (draft: SupportChat | null) => {
                  if (!draft?.messages) return;
                  const alreadyExists = draft.messages.some((m) => m.id === res.id);
                  if (alreadyExists) {
                    draft.messages = draft.messages.filter((m) => m.id !== tempId);
                  } else {
                    const idx = draft.messages.findIndex((m) => m.id === tempId);
                    if (idx !== -1) {
                      draft.messages[idx] = res;
                    } else {
                      draft.messages.push(res);
                    }
                  }
                }
              )
            );
            success = true;
          }
        }

        return success;
      } catch (err) {
        console.error("[SupportChat] ❌ Failed to deliver message:", err);
        // Keep optimistic message in cache but mark as failed for retry
        dispatch(
          supportApi.util.updateQueryData(
            "getSupportChat",
            undefined,
            (draft: SupportChat | null) => {
              if (!draft?.messages) return;
              const msg = draft.messages.find((m) => m.id === tempId);
              if (msg) {
                msg.isFailed = true;
              }
            }
          )
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [
      chat?.id,
      currentUser?.firstName,
      currentUser?.name,
      dispatch,
      isSending,
      sendSupportMessageApi,
    ]
  );

  const retryMessage = useCallback(
    async (failedMsg: SupportMessage) => {
      // Remove failed message from cache
      dispatch(
        supportApi.util.updateQueryData(
          "getSupportChat",
          undefined,
          (draft: SupportChat | null) => {
            if (!draft?.messages) return;
            draft.messages = draft.messages.filter((m) => m.id !== failedMsg.id);
          }
        )
      );

      // Re-dispatch send
      return await sendMessage({
        text: failedMsg.text,
        attachmentUrl: failedMsg.attachmentUrl || undefined,
        fileType: failedMsg.fileType || undefined,
        fileName: failedMsg.fileName || undefined,
      });
    },
    [dispatch, sendMessage]
  );

  const rawMessages = chat?.messages ?? [];
  const seenIds = new Set<string>();
  const uniqueMessages: SupportMessage[] = rawMessages.filter((m) => {
    if (!m?.id) return true;
    if (seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });

  const rawStage = (
    chat?.stage ||
    (chat as any)?.ticketStage ||
    (chat as any)?.status ||
    ""
  ).toLowerCase();

  const isResolved = rawStage === "resolved" || rawStage === "closed";
  const hasAgentMessage = uniqueMessages.some(
    (m) =>
      m.senderRole === "ADMIN" ||
      m.senderRole === "SUPER_ADMIN" ||
      m.role === "ADMIN" ||
      m.isAdmin === true ||
      m.sender === "admin" ||
      (typeof m.senderName === "string" &&
        /\b(admin\s*support|support\s*team|wealthconomy\s*support)\b/i.test(
          m.senderName
        ))
  );

  const computedStage: ChatStage = isResolved
    ? "resolved"
    : rawStage === "active" || hasAgentMessage
    ? "active"
    : "queue";

  return {
    chat,
    messages: uniqueMessages,
    isLoading,
    isFetching,
    error,
    rawError,
    errorStatus,
    errorMessage,
    isChatNotFound,
    refetch,
    isSocketConnected,
    isAdminOnline: isAdminOnline ?? (chat?.status === "online"),
    stage: computedStage,
    isSending,
    sendMessage,
    retryMessage,
  };
}
