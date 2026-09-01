import {
  ContributeGroupRequest,
  CreateGroupRequest,
  GroupChatMessage,
  GroupJoinRequest,
  GroupMember,
  GroupMemberFilter,
  GroupMemberStats,
  UpdateGroupSettingsRequest,
  WealthGroupModel,
  WithdrawGroupRequest,
} from "@/src/types/group";
import { KeysetPagination } from "@/src/types/wallet";
import { baseApi } from "./baseApi";

interface ListGroupsArgs {
  q?: string;
  limit?: number;
  after?: string;
  before?: string;
  sortBy?: "createdAt" | "name" | string;
  sortDir?: "asc" | "desc";
  populate?: string[];
}

interface ListJoinRequestsArgs {
  id: string;
  q?: string;
  limit?: number;
  after?: string;
  before?: string;
  sortBy?: "createdAt" | "name" | string;
  sortDir?: "asc" | "desc";
  populate?: string[];
}

export const groupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List / Search groups
    listGroups: builder.query<KeysetPagination<WealthGroupModel>, ListGroupsArgs | void>({
      query: (params) => ({
        url: "/groups",
        params: params || {},
      }),
      providesTags: ["WealthGroup"],
      transformResponse: (response: { data: KeysetPagination<WealthGroupModel> }) =>
        response.data || response,
    }),

    // Get single group details
    getGroupDetails: builder.query<WealthGroupModel, string>({
      query: (id) => `/groups/${id}`,
      providesTags: ["WealthGroup"],
      transformResponse: (response: { data: WealthGroupModel }) =>
        response.data || response,
    }),

    // Create group
    createGroup: builder.mutation<{ id: string } | WealthGroupModel, CreateGroupRequest>({
      query: (body) => ({
        url: "/groups",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WealthGroup"],
      transformResponse: (response: { data: { id: string } }) =>
        response.data || response,
    }),

    // Update group settings
    updateGroupSettings: builder.mutation<
      WealthGroupModel,
      { id: string; body: UpdateGroupSettingsRequest }
    >({
      query: ({ id, body }) => ({
        url: `/groups/${id}/settings`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Join group
    joinGroup: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/groups/${id}/join`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // List pending join requests (Admin/Owner only)
    listJoinRequests: builder.query<
      KeysetPagination<GroupJoinRequest>,
      ListJoinRequestsArgs
    >({
      query: ({ id, ...params }) => ({
        url: `/groups/${id}/requests`,
        params,
      }),
      providesTags: ["WealthGroup"],
      transformResponse: (response: { data: KeysetPagination<GroupJoinRequest> }) =>
        response.data || response,
    }),

    // Approve join request
    approveJoinRequest: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/requests/${userId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Reject join request
    rejectJoinRequest: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/requests/${userId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Contribute to group
    contributeToGroup: builder.mutation<
      { message: string },
      { id: string; body: ContributeGroupRequest }
    >({
      query: ({ id, body }) => ({
        url: `/groups/${id}/contribute`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WealthGroup", "Wallet"],
    }),

    // Get group messages
    getGroupMessages: builder.query<
      KeysetPagination<GroupChatMessage>,
      { id: string; limit?: number; after?: string; before?: string; q?: string; populate?: string[] }
    >({
      query: ({ id, ...params }) => ({
        url: `/groups/${id}/messages`,
        params,
      }),
      providesTags: ["WealthGroup"],
      transformResponse: (response: { data: KeysetPagination<GroupChatMessage> }) =>
        response.data || response,
    }),

    // Get group members
    getGroupMembers: builder.query<
      KeysetPagination<GroupMember>,
      { id: string; filter?: GroupMemberFilter; limit?: number; after?: string; before?: string; q?: string; populate?: string[] }
    >({
      query: ({ id, ...params }) => ({
        url: `/groups/${id}/members`,
        params,
      }),
      providesTags: ["WealthGroup"],
      transformResponse: (response: { data: KeysetPagination<GroupMember> }) =>
        response.data || response,
    }),

    // Get individual member stats in a group
    getMemberStats: builder.query<
      GroupMemberStats,
      { id: string; userId: string }
    >({
      query: ({ id, userId }) => `/groups/${id}/members/${userId}/stats`,
      providesTags: ["WealthGroup"],
      transformResponse: (response: { data: GroupMemberStats }) =>
        response.data || response,
    }),

    // Clear chat
    clearGroupChat: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/groups/${id}/chat/clear`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Emergency withdrawal from group
    withdrawFromGroup: builder.mutation<
      { message: string },
      { id: string; body: WithdrawGroupRequest }
    >({
      query: ({ id, body }) => ({
        url: `/groups/${id}/withdraw`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WealthGroup", "Wallet"],
    }),

    // Exit group
    exitGroup: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/groups/${id}/exit`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Terminate group
    terminateGroup: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/groups/${id}/terminate`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Toggle mute
    toggleGroupMute: builder.mutation<{ message: string }, { id: string; isMuted: boolean }>({
      query: ({ id, isMuted }) => ({
        url: `/groups/${id}/settings/mute`,
        method: "POST",
        body: { isMuted },
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Report group
    reportGroup: builder.mutation<{ message: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/groups/${id}/report`,
        method: "POST",
        body: { reason },
      }),
    }),

    // Add admin (Creator only)
    addGroupAdmin: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/admins/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Remove admin (Creator only)
    removeGroupAdmin: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/admins/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Remove member (kick)
    removeGroupMember: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Add to blacklist
    addToGroupBlacklist: builder.mutation<{ message: string }, { id: string; userId: string; reason?: string }>({
      query: ({ id, userId, reason }) => ({
        url: `/groups/${id}/blacklist/${userId}`,
        method: "POST",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Remove from blacklist
    removeFromGroupBlacklist: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/blacklist/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WealthGroup"],
    }),

    // Send reminders (Admin/Owner only)
    sendGroupReminders: builder.mutation<{ message: string }, { id: string; userIds: string[] }>({
      query: ({ id, userIds }) => ({
        url: `/groups/${id}/members/reminders`,
        method: "POST",
        body: { userIds },
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useListGroupsQuery,
  useGetGroupDetailsQuery,
  useCreateGroupMutation,
  useUpdateGroupSettingsMutation,
  useJoinGroupMutation,
  useListJoinRequestsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
  useContributeToGroupMutation,
  useGetGroupMessagesQuery,
  useGetGroupMembersQuery,
  useGetMemberStatsQuery,
  useClearGroupChatMutation,
  useWithdrawFromGroupMutation,
  useExitGroupMutation,
  useTerminateGroupMutation,
  useToggleGroupMuteMutation,
  useReportGroupMutation,
  useAddGroupAdminMutation,
  useRemoveGroupAdminMutation,
  useRemoveGroupMemberMutation,
  useAddToGroupBlacklistMutation,
  useRemoveFromGroupBlacklistMutation,
  useSendGroupRemindersMutation,
} = groupApi;
