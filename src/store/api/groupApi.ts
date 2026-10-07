import {
  ContributeGroupRequest,
  CreateGroupRequest,
  GroupJoinRequest,
  GroupMember,
  GroupMemberFilter,
  GroupMemberStats,
  GroupType,
  SetGroupPositionsRequest,
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
  groupType?: GroupType;
  isVetted?: boolean;
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
      transformResponse: (response: any) => {
        const payload = response?.data || response;
        let rawItems: any[] = [];
        if (Array.isArray(payload)) {
          rawItems = payload;
        } else if (Array.isArray(payload?.items)) {
          rawItems = payload.items;
        } else if (Array.isArray(response?.items)) {
          rawItems = response.items;
        }

        const map = new Map<string, WealthGroupModel>();
        rawItems.forEach((g: any) => {
          if (!g) return;
          const id = String(
            g.id ||
              g._id ||
              g.groupId ||
              g.group_id ||
              (g.name ? `${g.name}_${g.createdAt || ""}` : "")
          ).trim();
          if (id) {
            map.set(id, { ...g, id: String(g.id || g._id || id) });
          }
        });

        const items = Array.from(map.values());
        return {
          items,
          nextCursor: payload?.nextCursor ?? payload?.nextAfter ?? null,
          prevCursor: payload?.prevCursor ?? null,
          pageSize: payload?.pageSize ?? items.length,
          hasNext: payload?.hasNext ?? Boolean(payload?.nextAfter || payload?.nextCursor),
          hasPrev: payload?.hasPrev ?? false,
          total: payload?.total ?? items.length,
          nextAfter: payload?.nextAfter,
        } as unknown as KeysetPagination<WealthGroupModel>;
      },
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

    // Exit group (voluntary exit - refunds savings to Main Wallet minus penalty)
    exitGroup: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/groups/${id}/exit`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup", "Wallet", "Payment"],
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

    // Remove member (kick - refunds 100% savings directly to Main Wallet)
    removeGroupMember: builder.mutation<{ message: string }, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WealthGroup", "Wallet", "Payment"],
    }),

    // Terminate group (Creator only - refunds 100% of all active members' savings to their Main Wallets)
    terminateGroup: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/groups/${id}/terminate`,
        method: "POST",
      }),
      invalidatesTags: ["WealthGroup", "Wallet", "Payment"],
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

    // Get system configurations (rates & penalties configured by admin)
    getSystemConfigs: builder.query<{ items: Array<{ key: string; value: string }> }, void>({
      query: () => "/admin/system-config",
      providesTags: ["WealthGroup"],
      transformResponse: (response: any) => response?.data || response,
    }),

    // Set rotational payout positions (Admin/Owner only)
    setGroupPositions: builder.mutation<
      { message: string },
      { id: string; body: SetGroupPositionsRequest }
    >({
      query: ({ id, body }) => ({
        url: `/groups/${id}/positions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WealthGroup"],
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
  useGetGroupMembersQuery,
  useGetMemberStatsQuery,
  useWithdrawFromGroupMutation,
  useExitGroupMutation,
  useToggleGroupMuteMutation,
  useReportGroupMutation,
  useAddGroupAdminMutation,
  useRemoveGroupAdminMutation,
  useRemoveGroupMemberMutation,
  useTerminateGroupMutation,
  useAddToGroupBlacklistMutation,
  useRemoveFromGroupBlacklistMutation,
  useSendGroupRemindersMutation,
  useGetSystemConfigsQuery,
  useSetGroupPositionsMutation,
} = groupApi;
