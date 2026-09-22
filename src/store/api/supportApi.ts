import { baseApi, ApiResponse } from "./baseApi";
import {
  SupportChat,
  SupportMessage,
  SendMessagePayload,
} from "@/src/types/support";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportChat: builder.query<SupportChat, void>({
      query: () => ({
        url: "/support/chat",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<SupportChat> | SupportChat) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as SupportChat;
      },
      providesTags: [{ type: "SupportChat", id: "ACTIVE" }],
    }),

    sendSupportMessage: builder.mutation<SupportMessage, SendMessagePayload>({
      query: (body) => ({
        url: "/support/chat/messages",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<SupportMessage> | SupportMessage) => {
        if ("data" in response && response.data) {
          return response.data;
        }
        return response as SupportMessage;
      },
      async onQueryStarted(_payload, { dispatch, queryFulfilled }) {
        try {
          const { data: sentMessage } = await queryFulfilled;
          dispatch(
            supportApi.util.updateQueryData("getSupportChat", undefined, (draft) => {
              if (!draft.messages) {
                draft.messages = [];
              }
              const exists = draft.messages.some((m) => m.id === sentMessage.id);
              if (!exists) {
                draft.messages.push(sentMessage);
              }
              draft.lastMessage = sentMessage.text;
              draft.lastMessageTime = sentMessage.time;
            })
          );
        } catch {
          // Mutation failed; handled by caller
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
