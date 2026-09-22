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
    error,
    refetch,
  } = useGetSupportChatQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
    pollingInterval: 5000,
  });

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
            (draft: SupportChat) => {
              if (!draft.messages) draft.messages = [];
              // Check if matching temp message exists or if already added
              const existingIdx = draft.messages.findIndex(
                (m) =>
                  m.id === incoming.id ||
                  (m.id.startsWith("client_temp_") && m.text === incoming.text)
              );
              if (existingIdx !== -1) {
                draft.messages[existingIdx] = incoming;
              } else {
                draft.messages.push(incoming);
              }
              draft.lastMessage = incoming.text;
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
              (draft: SupportChat) => {
                draft.stage = "active";
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
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return false;

      setIsSending(true);

      const tempId = `client_temp_${Date.now()}`;
      const nowIso = new Date().toISOString();
      const optimisticMsg: SupportMessage = {
        id: tempId,
        chatId: chat?.id || "",
        senderName: currentUser?.name || currentUser?.firstName || "You",
        text: trimmed,
        time: nowIso,
        createdAt: nowIso,
        isMe: true,
        isRead: false,
      };

      console.log(`[SupportChat] 📤 Sending message: "${trimmed}" (tempId: ${tempId})`);

      // Optimistically push into local cache
      dispatch(
        supportApi.util.updateQueryData(
          "getSupportChat",
          undefined,
          (draft: SupportChat) => {
            if (!draft.messages) draft.messages = [];
            draft.messages.push(optimisticMsg);
            draft.lastMessage = trimmed;
            draft.lastMessageTime = optimisticMsg.time;
          }
        )
      );

      try {
        let success = false;

        // Try Socket.IO if connected and we have a valid chatId
        if (socketService.isConnected() && chat?.id) {
          console.log("[SupportChat] ⚡ Trying Socket.IO message delivery...");
          const res = await socketService.sendMessage({
            chatId: chat.id,
            text: trimmed,
          });

          if (res.ok) {
            console.log("[SupportChat] ✅ Message successfully delivered via Socket.IO! Message ID:", res.messageId);
            success = true;
            // Update temp message ID if backend provided messageId
            if (res.messageId) {
              dispatch(
                supportApi.util.updateQueryData(
                  "getSupportChat",
                  undefined,
                  (draft: SupportChat) => {
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
          console.log("[SupportChat] 🌐 Delivering message via REST API (POST /api/v1/support/chat/messages)...");
          const res = await sendSupportMessageApi({ text: trimmed }).unwrap();
          if (res) {
            console.log("[SupportChat] ✅ Message successfully saved via REST API! Server Message ID:", res.id);
            dispatch(
              supportApi.util.updateQueryData(
                "getSupportChat",
                undefined,
                (draft: SupportChat) => {
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
        // Rollback optimistic message on failure
        dispatch(
          supportApi.util.updateQueryData(
            "getSupportChat",
            undefined,
            (draft: SupportChat) => {
              draft.messages = draft.messages.filter((m) => m.id !== tempId);
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
    refetch,
    isSocketConnected,
    isAdminOnline: isAdminOnline ?? (chat?.status === "online"),
    stage: computedStage,
    isSending,
    sendMessage,
  };
}
