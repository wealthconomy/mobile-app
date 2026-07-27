import { Withdrawal } from "@/src/types/wallet";
import { baseApi } from "./baseApi";

export const withdrawalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiateWithdrawal: builder.mutation<{ id: string }, { payoutAccountId: string; amount: number; portfolioId?: string }>({
      query: (body) => ({
        url: "/withdrawals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Withdrawal", "Wallet", "Portfolio"],
      transformResponse: (response: { data: { id: string } }) => response.data,
    }),
    getUserWithdrawals: builder.query<{ items: Withdrawal[] }, void>({
      query: () => "/withdrawals",
      providesTags: ["Withdrawal"],
      transformResponse: (response: { data: { items: Withdrawal[] } }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useInitiateWithdrawalMutation,
  useGetUserWithdrawalsQuery,
} = withdrawalApi;
