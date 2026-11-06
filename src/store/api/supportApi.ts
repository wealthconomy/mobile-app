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
        if (response && typeof response === "object" && "data" in response) {
          return response.data ?? null;
        }
        return (response as SupportChat) ?? null;
      },
      providesTags: [{ type: "SupportChat", id: "ACTIVE" }],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          const err = error?.error || error;
          const msg = err?.data?.message || err?.message || "Request failed";
          console.error(`[supportApi] GET /support/chat failed: ${msg}`);
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
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as SupportMessage;
      },
      async onQueryStarted(payload, { dispatch, queryFulfilled }) {
        try {
          const { data: sentMessage } = await queryFulfilled;
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
          const msg = err?.data?.message || err?.message || "Request failed";
          console.error(`[supportApi] POST /support/chat/messages failed: ${msg}`);
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
