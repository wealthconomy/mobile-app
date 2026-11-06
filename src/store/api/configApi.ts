import { baseApi, ApiResponse } from "./baseApi";

export interface PublicConfigData {
  referralEnabled?: boolean;
  maintenance?: boolean;
  maintenanceMode?: boolean;
  minAppVersion?: string;
  referralRewardKobo?: number | string;
  latestAppVersion?: string | null;
  updateDeadline?: string | null;
  updateMessage?: string | null;
  [key: string]: any;
}

export const configApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicConfig: builder.query<ApiResponse<PublicConfigData>, void>({
      query: () => "/public/config",
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetPublicConfigQuery, useLazyGetPublicConfigQuery } = configApi;
