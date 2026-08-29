import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  MandateLinkRequest,
  MandateLinkResponse,
  Mandate,
  ChargeMandateRequest,
  VirtualAccountRequest,
} from "../../types/payment";
import { KeysetPagination } from "../../types/wallet";
import { ApiResponse, baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createWalletTopupIntent: builder.mutation<ApiResponse<PaymentIntentResponse>, PaymentIntentRequest>({
      query: (body) => ({
        url: "/payments/intents/wallet-topup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "Wallet"],
    }),
    verifyPayment: builder.query<ApiResponse<{ status: "PENDING" | "SUCCESSFUL" | "FAILED" | string }>, string>({
      query: (reference) => `/payments/verify/${reference}`,
      providesTags: ["Payment", "Wallet"],
    }),
    linkMandate: builder.mutation<ApiResponse<MandateLinkResponse>, MandateLinkRequest>({
      query: (body) => ({
        url: "/payments/mandates/link",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),
    listMyMandates: builder.query<ApiResponse<KeysetPagination<Mandate>>, { limit?: number; after?: string; before?: string } | void>({
      query: (params) => ({
        url: "/payments/mandates/me",
        params: params || {},
      }),
      providesTags: ["Payment"],
    }),
    setDefaultMandate: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/payments/mandates/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["Payment"],
    }),
    deleteMandate: builder.mutation<ApiResponse<{ id: string }>, string>({
      query: (id) => ({
        url: `/payments/mandates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment"],
    }),
    chargeMandate: builder.mutation<ApiResponse<string>, ChargeMandateRequest>({
      query: (body) => ({
        url: "/payments/intents/charge-mandate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "Wallet"],
    }),
    createVirtualAccount: builder.mutation<ApiResponse<string>, VirtualAccountRequest>({
      query: (body) => ({
        url: "/payments/virtual-accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateWalletTopupIntentMutation,
  useLazyVerifyPaymentQuery,
  useVerifyPaymentQuery,
  useLinkMandateMutation,
  useListMyMandatesQuery,
  useSetDefaultMandateMutation,
  useDeleteMandateMutation,
  useChargeMandateMutation,
  useCreateVirtualAccountMutation,
} = paymentApi;
