import { KeysetPagination, WalletHold, WalletSummary, WalletTransaction } from "@/src/types/wallet";
import { baseApi } from "./baseApi";

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWalletSummary: builder.query<WalletSummary, void>({
      query: () => "/wallet/me",
      providesTags: ["Wallet"],
      transformResponse: (response: { data: WalletSummary }) => response.data,
    }),
    getWalletTransactions: builder.query<
      KeysetPagination<WalletTransaction>,
      { limit?: number; after?: string; before?: string; q?: string; type?: string; reason?: string }
    >({
      query: (params) => ({
        url: "/wallet/txns",
        params,
      }),
      providesTags: ["Wallet"],
      transformResponse: (response: { data: KeysetPagination<WalletTransaction> }) => response.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Only separate cache by filter parameters, not cursor
        const { limit, q, type, reason } = queryArgs;
        return `${endpointName}-${JSON.stringify({ limit, q, type, reason })}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.after) {
          // appending forward
          currentCache.items.push(...newItems.items);
          currentCache.nextCursor = newItems.nextCursor;
          currentCache.hasNext = newItems.hasNext;
        } else if (arg.before) {
          // prepending backward
          currentCache.items.unshift(...newItems.items);
          currentCache.prevCursor = newItems.prevCursor;
          currentCache.hasPrev = newItems.hasPrev;
        } else {
          // first load
          return newItems;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.after !== previousArg?.after || currentArg?.before !== previousArg?.before;
      },
    }),
    getWalletTransactionById: builder.query<WalletTransaction, string>({
      query: (id) => `/wallet/txns/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Wallet", id }],
      transformResponse: (response: { data: WalletTransaction }) => response.data,
    }),
    getWalletHolds: builder.query<
      KeysetPagination<WalletHold>,
      { limit?: number; after?: string; before?: string; status?: string; reason?: string }
    >({
      query: (params) => ({
        url: "/wallet/holds",
        params,
      }),
      providesTags: ["Wallet"],
      transformResponse: (response: { data: KeysetPagination<WalletHold> }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery,
  useGetWalletTransactionByIdQuery,
  useGetWalletHoldsQuery,
} = walletApi;
