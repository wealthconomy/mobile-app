import { PayoutAccount, PayoutBank } from "@/src/types/wallet";
import { baseApi } from "./baseApi";

export const payoutAccountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportedBanks: builder.query<{ items: PayoutBank[] }, void>({
      query: () => "/payout-accounts/banks",
      providesTags: ["PayoutAccount"],
      transformResponse: (response: { data: { items: PayoutBank[] } }) => response.data,
    }),
    resolveBankAccount: builder.mutation<{ accountName: string; accountNumber: string }, { bankCode: string; accountNumber: string }>({
      query: (body) => ({
        url: "/payout-accounts/resolve",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: { accountName: string; accountNumber: string } }) => response.data,
    }),
    addPayoutAccount: builder.mutation<{ id: string }, { bankCode: string; accountNumber: string; bankName: string }>({
      query: (body) => ({
        url: "/payout-accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayoutAccount"],
      transformResponse: (response: { data: { id: string } }) => response.data,
    }),
    getUserPayoutAccounts: builder.query<{ items: PayoutAccount[] }, void>({
      query: () => "/payout-accounts",
      providesTags: ["PayoutAccount"],
      transformResponse: (response: { data: { items: PayoutAccount[] } }) => response.data,
    }),
    deletePayoutAccount: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/payout-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PayoutAccount"],
      transformResponse: (response: { data: { id: string } }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupportedBanksQuery,
  useResolveBankAccountMutation,
  useAddPayoutAccountMutation,
  useGetUserPayoutAccountsQuery,
  useDeletePayoutAccountMutation,
} = payoutAccountApi;
