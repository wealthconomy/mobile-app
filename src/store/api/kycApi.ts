import { updateKycLevel } from "../slices/authSlice";
import { baseApi, ApiResponse } from "./baseApi";

export interface KycStatusResponse {
  currentLevel: number;
  status: "VERIFIED" | "PENDING" | "UNVERIFIED" | "REJECTED" | string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  nextRequirements?: string[];
}

export interface SubmitLevel2InfoRequest {
  bvn: string;
  dateOfBirth: string;
  firstName?: string;
  lastName?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
}

export interface ScanIdRequest {
  idType: string;
  idNumber: string;
  idImageUrl: string;
}

export interface FaceVerifyRequest {
  biometricSessionId: string;
  imageBase64: string;
}

export interface UploadLevel3DocsRequest {
  addressDocUrl: string;
  passportUrl: string;
}

export interface KycDocumentsResponse {
  id?: string;
  userId?: string;
  bvn?: number | string;
  idType?: string;
  idNumber?: string;
  idImageUrl?: string;
  faceVerified?: boolean;
  addressDocUrl?: string;
  passportUrl?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const kycApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKycStatus: builder.query<ApiResponse<KycStatusResponse>, void>({
      query: () => "/kyc/status",
      providesTags: ["Kyc"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.currentLevel !== undefined) {
            dispatch(updateKycLevel(data.data.currentLevel));
          }
        } catch {
          // fetch failed
        }
      },
    }),
    submitLevel2Info: builder.mutation<ApiResponse<KycStatusResponse>, SubmitLevel2InfoRequest>({
      query: (body) => ({
        url: "/kyc/level-2/submit-info",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Kyc", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.currentLevel !== undefined) {
            dispatch(updateKycLevel(data.data.currentLevel));
          }
        } catch {
          // submit failed
        }
      },
    }),
    scanId: builder.mutation<ApiResponse<KycStatusResponse>, ScanIdRequest>({
      query: (body) => ({
        url: "/kyc/level-2/scan-id",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Kyc", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.currentLevel !== undefined) {
            dispatch(updateKycLevel(data.data.currentLevel));
          }
        } catch {
          // scan failed
        }
      },
    }),
    faceVerify: builder.mutation<ApiResponse<KycStatusResponse>, FaceVerifyRequest>({
      query: (body) => ({
        url: "/kyc/level-2/face-verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Kyc", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.currentLevel !== undefined) {
            dispatch(updateKycLevel(data.data.currentLevel));
          }
        } catch {
          // verify failed
        }
      },
    }),
    uploadLevel3Docs: builder.mutation<ApiResponse<KycStatusResponse>, UploadLevel3DocsRequest>({
      query: (body) => ({
        url: "/kyc/level-3/upload-docs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Kyc", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.currentLevel !== undefined) {
            dispatch(updateKycLevel(data.data.currentLevel));
          }
        } catch {
          // upload failed
        }
      },
    }),
    getKycDocuments: builder.query<ApiResponse<KycDocumentsResponse>, void>({
      query: () => "/kyc/documents",
      providesTags: ["Kyc"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetKycStatusQuery,
  useSubmitLevel2InfoMutation,
  useScanIdMutation,
  useFaceVerifyMutation,
  useUploadLevel3DocsMutation,
  useGetKycDocumentsQuery,
} = kycApi;
