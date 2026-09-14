import { KeysetPagination, WalletHold, WalletSummary, WalletTransaction } from "@/src/types/wallet";
import { ApiResponse, baseApi } from "./baseApi";

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWalletSummary: builder.query<WalletSummary, void>({
      query: () => "/wallet/me",
      providesTags: ["Wallet"],
      transformResponse: (response: { data: WalletSummary }) => response.data,
    }),
    getWalletTransactions: builder.query<
      KeysetPagination<WalletTransaction>,
      { limit?: number; after?: string; before?: string; q?: string; type?: string; reason?: string; from?: string; to?: string }
    >({
      query: (params) => ({
        url: "/wallet/txns",
        params,
      }),
      providesTags: ["Wallet"],
      transformResponse: (response: { data: KeysetPagination<WalletTransaction> }) => response.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Only separate cache by filter parameters, not cursor
        const { limit, q, type, reason, from, to } = queryArgs;
        return `${endpointName}-${JSON.stringify({ limit, q, type, reason, from, to })}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.after) {
          // appending forward
          const existingIds = new Set((currentCache.items || []).map((i) => i.id));
          const fresh = (newItems.items || []).filter((i) => !existingIds.has(i.id));
          currentCache.items.push(...fresh);
          currentCache.nextCursor = newItems.nextCursor;
          currentCache.hasNext = newItems.hasNext;
        } else if (arg.before) {
          // prepending backward
          const existingIds = new Set((currentCache.items || []).map((i) => i.id));
          const fresh = (newItems.items || []).filter((i) => !existingIds.has(i.id));
          currentCache.items.unshift(...fresh);
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
    transferFunds: builder.mutation<ApiResponse<string>, { recipientId: string; amountKobo: string }>({
      query: (body) => ({
        url: "/wallet/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery,
  useGetWalletTransactionByIdQuery,
  useGetWalletHoldsQuery,
  useTransferFundsMutation,
} = walletApi;
