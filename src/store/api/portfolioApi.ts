import {
  CreatePortfolioRequest,
  Portfolio,
  PortfolioSummaryItem,
  PortfolioTransaction,
  PortfolioType,
  PortfolioConfigData,
  TerminateRequest,
  TopUpRequest,
  TransferPortfolioFundsRequest,
  UpdateAutoSaveRequest,
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
      providesTags: (result, error, arg) => [{ type: "Portfolio", id: arg.type }],
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
      invalidatesTags: (result, error, { type }) => [
        { type: "Portfolio", id: type },
      ],
      transformResponse: (response: { data: { id: string } }) => response.data,
    }),

    // Top up an existing portfolio
    topUpPortfolio: builder.mutation<
      { id: string },
      { id: string; type?: PortfolioType; body: TopUpRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/top-up`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id, type }) => {
        const ALL_PORTFOLIO_TYPES: PortfolioType[] = [
          "wealthgoal",
          "wealthfix",
          "wealthflex",
          "wealthfam",
          "wealthflow",
        ];
        const tags: any[] = [
          { type: "Portfolio", id },
          { type: "Portfolio", id: `${id}-txns` },
          { type: "Portfolio", id: "SUMMARY" },
          "Wallet",
        ];
        if (type) {
          tags.push({ type: "Portfolio" as const, id: type });
        }
        ALL_PORTFOLIO_TYPES.forEach((t) => {
          if (t !== type) {
            tags.push({ type: "Portfolio" as const, id: t });
          }
        });
        return tags;
      },
    }),

    // Withdraw from portfolio to wallet
    withdrawToWallet: builder.mutation<
      { id: string },
      { id: string; type?: PortfolioType; body: WithdrawToWalletRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/withdraw-to-wallet`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id, type }) => {
        const ALL_PORTFOLIO_TYPES: PortfolioType[] = [
          "wealthgoal",
          "wealthfix",
          "wealthflex",
          "wealthfam",
          "wealthflow",
        ];
        const tags: any[] = [
          { type: "Portfolio", id },
          { type: "Portfolio", id: `${id}-txns` },
          { type: "Portfolio", id: "SUMMARY" },
          "Wallet",
        ];
        if (type) {
          tags.push({ type: "Portfolio" as const, id: type });
        }
        ALL_PORTFOLIO_TYPES.forEach((t) => {
          if (t !== type) {
            tags.push({ type: "Portfolio" as const, id: t });
          }
        });
        return tags;
      },
    }),

    // Terminate/Break a portfolio early
    terminatePortfolio: builder.mutation<
      { id: string },
      { id: string; type?: PortfolioType; body: TerminateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/terminate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id, type }) => {
        const ALL_PORTFOLIO_TYPES: PortfolioType[] = [
          "wealthgoal",
          "wealthfix",
          "wealthflex",
          "wealthfam",
          "wealthflow",
        ];
        const tags: any[] = [
          { type: "Portfolio", id },
          { type: "Portfolio", id: `${id}-txns` },
          { type: "Portfolio", id: "SUMMARY" },
          "Wallet",
        ];
        if (type) {
          tags.push({ type: "Portfolio" as const, id: type });
        }
        ALL_PORTFOLIO_TYPES.forEach((t) => {
          if (t !== type) {
            tags.push({ type: "Portfolio" as const, id: t });
          }
        });
        return tags;
      },
    }),

    // Get portfolio transactions
    getPortfolioTransactions: builder.query<
      KeysetPagination<PortfolioTransaction>,
      { id: string; limit?: number; after?: string; before?: string; q?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/portfolios/${id}/txns`,
        params,
      }),
      providesTags: (result, error, arg) => [{ type: "Portfolio", id: `${arg.id}-txns` }],
      transformResponse: (response: { data: KeysetPagination<PortfolioTransaction> }) =>
        response.data,
    }),

    // Transfer funds from portfolio to wallet/portfolio/bank
    transferPortfolioFunds: builder.mutation<
      { id: string },
      { id: string; type?: PortfolioType; body: TransferPortfolioFundsRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}/transfer`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id, type, body }) => {
        const ALL_PORTFOLIO_TYPES: PortfolioType[] = [
          "wealthgoal",
          "wealthfix",
          "wealthflex",
          "wealthfam",
          "wealthflow",
        ];
        const tags: any[] = [
          { type: "Portfolio", id },
          { type: "Portfolio", id: `${id}-txns` },
          { type: "Portfolio", id: "SUMMARY" },
          "Wallet",
        ];
        if (type) {
          tags.push({ type: "Portfolio" as const, id: type });
        }
        ALL_PORTFOLIO_TYPES.forEach((t) => {
          if (t !== type) {
            tags.push({ type: "Portfolio" as const, id: t });
          }
        });
        if (body?.destinationType === "PORTFOLIO" && body?.destinationId) {
          tags.push({ type: "Portfolio", id: body.destinationId });
          tags.push({ type: "Portfolio", id: `${body.destinationId}-txns` });
        }
        return tags;
      },
    }),

    // Get dynamic rates & limits configuration
    getPortfolioConfig: builder.query<PortfolioConfigData, void>({
      query: () => ({
        url: "/portfolios/config",
      }),
      providesTags: [{ type: "Portfolio", id: "CONFIG" }],
      transformResponse: (response: { data: PortfolioConfigData }) =>
        response.data || response,
    }),

    // Get single portfolio by ID with all calculated metrics
    getPortfolioById: builder.query<Portfolio, string>({
      query: (id) => `/portfolios/${id}`,
      providesTags: (result, error, id) => [{ type: "Portfolio", id }],
      transformResponse: (response: { data: Portfolio }) =>
        response.data || response,
    }),

    // Update AutoSave settings (pause, resume, or change frequency/amount)
    updateAutoSave: builder.mutation<
      Portfolio,
      { id: string; body: UpdateAutoSaveRequest }
    >({
      query: ({ id, body }) => ({
        url: `/portfolios/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Portfolio", id },
      ],
      transformResponse: (response: { data: Portfolio }) =>
        response.data || response,
    }),

    // Get cross-category portfolio summary metrics
    getPortfolioSummary: builder.query<PortfolioSummaryItem[], void>({
      query: () => "/portfolios/summary",
      providesTags: [{ type: "Portfolio", id: "SUMMARY" }],
      transformResponse: (response: { data: { items: PortfolioSummaryItem[] } }) =>
        response.data?.items || [],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useTopUpPortfolioMutation,
  useWithdrawToWalletMutation,
  useTerminatePortfolioMutation,
  useGetPortfolioTransactionsQuery,
  useTransferPortfolioFundsMutation,
  useGetPortfolioConfigQuery,
  useGetPortfolioByIdQuery,
  useUpdateAutoSaveMutation,
  useGetPortfolioSummaryQuery,
} = portfolioApi;

