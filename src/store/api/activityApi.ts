import { UserActivity } from "../../types/activity";
import { ApiResponse, baseApi, PaginatedResponse } from "./baseApi";

export interface CursorPaginatedResponse<T> {
  items: T;
  nextCursor: string | null;
  prevCursor: string | null;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyActivities: builder.query<
      ApiResponse<CursorPaginatedResponse<UserActivity[]>>,
      { limit?: number; type?: string; period?: string; after?: string; _append?: boolean } | void
    >({
      query: (params) => {
        const { _append, ...rest } = params || {};
        return {
          url: "/activities/me",
          params: rest,
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { _append, after, ...rest } = queryArgs || {};
        return { endpointName, ...rest };
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg?._append) {
          currentCache.data.items.push(...newItems.data.items);
          currentCache.data.nextCursor = newItems.data.nextCursor;
          currentCache.data.hasNext = newItems.data.hasNext;
        } else {
          return newItems;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.after !== previousArg?.after;
      },
      providesTags: ["Activity"],
    }),
    getActivityDetail: builder.query<ApiResponse<UserActivity>, string>({
      query: (id) => `/activities/${id}`,
      providesTags: (result, error, id) => [{ type: "Activity", id }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetMyActivitiesQuery, useGetActivityDetailQuery } = activityApi;
