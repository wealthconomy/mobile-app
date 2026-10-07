import { baseApi, ApiResponse } from "./baseApi";
import {
  SupportChat,
  SupportMessage,
  SendMessagePayload,
} from "@/src/types/support";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportChat: builder.query<SupportChat | null, void>({
      query: () => ({
        url: "/support/chat",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<SupportChat | null> | SupportChat | null) => {
        console.log("[supportApi] 📦 GET /support/chat raw response:", response);
        if (response && typeof response === "object" && "data" in response) {
          return response.data ?? null;
        }
        return (response as SupportChat) ?? null;
      },
      providesTags: [{ type: "SupportChat", id: "ACTIVE" }],
      async onQueryStarted(_arg, { queryFulfilled }) {
        console.log("[supportApi] 🚀 Dispatched GET /support/chat request");
        try {
          const { data, meta } = await queryFulfilled;
          console.log("[supportApi] ✅ GET /support/chat success:", {
            status: (meta as any)?.response?.status,
            chatId: (data as any)?.id,
            stage: (data as any)?.stage,
            messagesCount: (data as any)?.messages?.length ?? 0,
            hasActiveChat: Boolean(data),
          });
        } catch (error: any) {
          const err = error?.error || error;
          console.error("[supportApi] ❌ GET /support/chat failed:", {
            status: err?.status,
            statusCode: err?.data?.statusCode,
            message: err?.data?.message || err?.message || err?.error,
            fullData: err?.data,
          });
        }
      },
    }),

    sendSupportMessage: builder.mutation<SupportMessage, SendMessagePayload>({
      query: (body) => ({
        url: "/support/chat/messages",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SupportChat", id: "ACTIVE" }],
      transformResponse: (response: ApiResponse<SupportMessage> | SupportMessage) => {
        console.log("[supportApi] 📦 POST /support/chat/messages raw response:", response);
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as SupportMessage;
      },
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        console.log("[supportApi] 🚀 POST /support/chat/messages dispatched:", {
          hasText: Boolean(payload.text),
          textSnippet: payload.text?.substring(0, 30),
          attachmentUrl: payload.attachmentUrl,
          fileType: payload.fileType,
        });
        try {
          const { data: sentMessage, meta } = await queryFulfilled;
          console.log("[supportApi] ✅ POST /support/chat/messages success:", {
            status: (meta as any)?.response?.status,
            messageId: sentMessage.id,
            time: sentMessage.time,
          });
          dispatch(
            supportApi.util.updateQueryData("getSupportChat", undefined, (draft) => {
              if (!draft) {
                return {
                  id: sentMessage.chatId || "",
                  userId: "",
                  userName: "",
                  status: "online",
                  stage: "queue",
                  isAdmin: false,
                  createdAt: sentMessage.time,
                  updatedAt: sentMessage.time,
                  messages: [sentMessage],
                  lastMessage:
                    sentMessage.text ||
                    (sentMessage.fileType === "image"
                      ? "📷 Image"
                      : sentMessage.attachmentUrl
                      ? "📎 Attachment"
                      : ""),
                  lastMessageTime: sentMessage.time,
                };
              }
              if (!draft.messages) {
                draft.messages = [];
              }
              const exists = draft.messages.some((m) => m.id === sentMessage.id);
              if (!exists) {
                draft.messages.push(sentMessage);
              }
              draft.lastMessage =
                sentMessage.text ||
                (sentMessage.fileType === "image"
                  ? "📷 Image"
                  : sentMessage.attachmentUrl
                  ? "📎 Attachment"
                  : "");
              draft.lastMessageTime = sentMessage.time;
            })
          );
        } catch (error: any) {
          const err = error?.error || error;
          console.error("[supportApi] ❌ POST /support/chat/messages failed:", {
            status: err?.status,
            statusCode: err?.data?.statusCode,
            message: err?.data?.message || err?.message || err?.error,
            fullData: err?.data,
          });
        }
      },
    }),

    markChatClientRead: builder.mutation<{ markedRead: number }, { chatId: string }>({
      query: ({ chatId }) => ({
        url: `/admin/support/chats/${chatId}/client-read`,
        method: "POST",
      }),
      transformResponse: (
        response: ApiResponse<{ markedRead: number }> | { markedRead: number }
      ) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as { markedRead: number };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSupportChatQuery,
  useSendSupportMessageMutation,
  useMarkChatClientReadMutation,
} = supportApi;
