import {
  CreatePortfolioRequest,
  Portfolio,
  PortfolioType,
  TerminateRequest,
  TopUpRequest,
  WithdrawToWalletRequest,
} from "@/src/types/portfolio";
import { KeysetPagination } from "@/src/types/wallet";
import { baseApi } from "./baseApi";

interface GetPortfoliosArgs {
  type: PortfolioType;
  limit?: number;
  after?: string;
  before?: string;
  q?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  period?: string;
  from?: string;
  to?: string;
}

export const portfolioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Generic GET endpoint for all portfolio types
    getPortfolios: builder.query<KeysetPagination<Portfolio>, GetPortfoliosArgs>({
      query: ({ type, ...params }) => ({
        url: `/portfolios/${type}`,
        params,
      }),
      providesTags: ["Portfolio"],
      transformResponse: (response: { data: KeysetPagination<Portfolio> }) =>
        response.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // Separate cache by portfolio type and filters, ignore cursor
        const { type, limit, q, sortBy, sortDir, period, from, to } = queryArgs;
        return `${endpointName}-${JSON.stringify({
          type,
          limit,
          q,
          sortBy,
          sortDir,
          period,
          from,
          to,
        })}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.after) {
          // Appending forward
          currentCache.items.push(...newItems.items);
          currentCache.nextCursor = newItems.nextCursor;
          currentCache.hasNext = newItems.hasNext;
        } else if (arg.before) {
          // Prepending backward
          currentCache.items.unshift(...newItems.items);
          currentCache.prevCursor = newItems.prevCursor;
          currentCache.hasPrev = newItems.hasPrev;
        } else {
          // First load
          return newItems;
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.after !== previousArg?.after ||
          currentArg?.before !== previousArg?.before
        );
      },
    }),

    // Generic POST endpoint for creating a portfolio
    createPortfolio: builder.mutation<
      { id: string },
      { type: PortfolioType; body: CreatePortfolioRequest }
    >({
      query: ({ type, body }) => ({
        url: `/portfolios/${type}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Portfolio"],
      transformResponse: (response: { data: { id: string } }) => response.data,
    }),

    // Top up an existing portfolio
    topUpPortfolio: builder.mutation<{ id: string }, { id: string; body: TopUpRequest }>({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/top-up`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Portfolio", "Wallet"],
    }),

    // Withdraw from portfolio to wallet
    withdrawToWallet: builder.mutation<
      { id: string },
      { id: string; body: WithdrawToWalletRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/withdraw-to-wallet`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Portfolio", "Wallet"],
    }),

    // Terminate/Break a portfolio early
    terminatePortfolio: builder.mutation<
      { id: string },
      { id: string; body: TerminateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/terminate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Portfolio"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useTopUpPortfolioMutation,
  useWithdrawToWalletMutation,
  useTerminatePortfolioMutation,
} = portfolioApi;
