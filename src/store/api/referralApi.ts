import { baseApi, ApiResponse } from "./baseApi";

export interface RefereeItem {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
  cumulativeSpend?: string;
  totalRewards?: string;
}

export interface ReferralsListResponseData {
  items: RefereeItem[];
  nextCursor?: string;
  prevCursor?: string;
  pageSize?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ReferralRewardItem {
  id: string;
  amountKobo?: string;
  amount?: string | number;
  status: "PENDING" | "PAID" | "CANCELLED" | string;
  createdAt?: string;
  refereeName?: string;
  description?: string;
}

export interface ReferralRewardsListResponseData {
  items: ReferralRewardItem[];
  nextCursor?: string;
  prevCursor?: string;
  pageSize?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface ReferralSummaryData {
  totalReferrals: number;
  totalEarnedKobo: string;
}

export interface ReferralsQueryParams {
  populate?: string[];
  q?: string;
  limit?: number;
  after?: string;
  before?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  referrerId?: string;
  status?: string;
}

export const referralApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyReferrals: builder.query<
      ApiResponse<ReferralsListResponseData | RefereeItem[]>,
      ReferralsQueryParams | void
    >({
      query: (params) => ({
        url: "/referrals/me",
        params: params || {},
      }),
      providesTags: ["Referral"],
    }),

    getMyReferralRewards: builder.query<
      ApiResponse<ReferralRewardsListResponseData | ReferralRewardItem[]>,
      ReferralsQueryParams | void
    >({
      query: (params) => ({
        url: "/referrals/me/rewards",
        params: params || {},
      }),
      providesTags: ["Referral"],
    }),

    getMyReferralSummary: builder.query<ApiResponse<ReferralSummaryData>, void>({
      query: () => "/referrals/me/summary",
      providesTags: ["Referral"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMyReferralsQuery,
  useGetMyReferralRewardsQuery,
  useGetMyReferralSummaryQuery,
} = referralApi;
