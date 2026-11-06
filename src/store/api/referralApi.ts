import { baseApi, ApiResponse } from "./baseApi";

export interface RefereeProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface RefereeItem {
  id: string;
  code?: string;
  status: "PENDING" | "PAID" | "CANCELLED" | string;
  amountKobo?: string | number;
  isValid?: boolean;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  totalRewardsEarnedKobo?: string | number;
  referee?: RefereeProfile;
  referrerId?: string;
  refereeId?: string;
  // Optional fallbacks for backward compatibility
  firstName?: string;
  lastName?: string;
  name?: string;
  imageUrl?: string;
  cumulativeSpend?: string;
  totalRewards?: string;
}

export interface ReferralsListResponseData {
  items: RefereeItem[];
  nextCursor?: string | null;
  prevCursor?: string | null;
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
  paidAt?: string | null;
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
  useLazyGetMyReferralsQuery,
  useGetMyReferralRewardsQuery,
  useLazyGetMyReferralRewardsQuery,
  useGetMyReferralSummaryQuery,
} = referralApi;
