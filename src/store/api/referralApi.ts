import { baseApi, ApiResponse } from "./baseApi";

export interface RefereeProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
}

export interface RefereeItem {
  id: string;
  referrerId?: string;
  refereeId?: string;
  code?: string;
  status?: string;
  amountKobo?: string | number;
  isValid?: boolean;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  totalRewardsEarnedKobo?: string | number;
  referee?: RefereeProfile;
  // Optional fallbacks for backward compatibility
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
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
