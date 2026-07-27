import { baseApi, ApiResponse } from "./baseApi";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind?: string;
  isRead: boolean;
  data?: Record<string, any>;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListQueryParams {
  populate?: string[];
  q?: string;
  limit?: number;
  after?: string;
  before?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  kind?: string;
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  nextCursor?: string;
  prevCursor?: string;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  sortBy?: string;
  sortDir?: string;
  populate?: string[];
}

export interface MarkReadRequest {
  id: string;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listNotifications: builder.query<ApiResponse<NotificationsListResponse>, NotificationsListQueryParams | void>({
      query: (params) => ({
        url: "/notifications",
        params: params || {},
      }),
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<ApiResponse<{ ok: boolean }>, MarkReadRequest>({
      query: (body) => ({
        url: "/notifications/mark-read",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation<ApiResponse<{ ok: boolean }>, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
