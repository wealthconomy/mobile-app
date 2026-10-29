import { updateKycLevel, updateKycStatus, updateKycInfo } from "../slices/authSlice";
import { baseApi, ApiResponse } from "./baseApi";
import {
  isLevel2Verified,
  isLevel2Rejected,
  idDocStatus,
  faceDocStatus,
  idRejectionText,
  faceRejectionText,
} from "../../features/kyc/utils/kycState";

export interface KycStatusResponse {
  currentLevel: number;
  status: "VERIFIED" | "PENDING" | "UNVERIFIED" | "REJECTED" | string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  nextRequirements?: string[];
  kycRejectionReason?: string;
}

export interface SubmitLevel2InfoRequest {
  bvn: string;
  dateOfBirth: string;
}

export interface ScanIdRequest {
  idType: string;
  idNumber: string;
  idImageUrl: string;
}

export interface FaceVerifyRequest {
  biometricSessionId: string;
  imageBase64: string;
  faceImageUrl?: string;
  imageUrl?: string;
}

export interface UploadLevel3DocsRequest {
  addressDocUrl: string;
  proofOfAddressUrl?: string;
  utilityBillUrl?: string;
  passportUrl?: string;
}

export interface KycDocumentsResponse {
  id?: string;
  userId?: string;
  bvn?: number | string;
  bvnProviderVerified?: boolean;
  bvnExtracted?: { firstName?: string; [key: string]: any };
  idType?: string;
  idNumber?: string;
  idImageUrl?: string;
  idStatus?: "Pending" | "Approved" | "Rejected" | string;
  idRejectionReason?: string;
  ninProviderVerified?: boolean;
  ninExtracted?: { extractedName?: string; [key: string]: any };
  faceVerified?: boolean;
  faceProviderVerified?: boolean;
  faceConfidenceScore?: number;
  faceStatus?: "Pending" | "Approved" | "Rejected" | string;
  faceRejectionReason?: string;
  faceImageUrl?: string;
  addressDocUrl?: string;
  utilityStatus?: "Pending" | "Approved" | "Rejected" | string;
  utilityRejectionReason?: string;
  passportUrl?: string;
  passportStatus?: "Pending" | "Approved" | "Rejected" | string;
  passportRejectionReason?: string;
  ninStatus?: "Pending" | "Approved" | "Rejected" | string;
  ninRejectionReason?: string;
  dateOfBirth?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  kycStatus?: "PENDING" | "VERIFIED" | "REJECTED" | string;
  kycLevel?: number;
  kycRejectionReason?: string;
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
          console.log("\n================ [APP: GET /kyc/status RESPONSE] ================");
          console.log(JSON.stringify(data, null, 2));
          console.log("=================================================================\n");
          const kycData = (data as any)?.data || data;
          if (kycData) {
            dispatch(
              updateKycInfo({
                level: kycData.currentLevel !== undefined ? kycData.currentLevel : kycData.kycLevel,
                status: kycData.status || kycData.kycStatus,
                rejectionReason: kycData.kycRejectionReason || kycData.rejectionReason,
              })
            );
          }
        } catch (err: any) {
          console.log("❌ [APP: GET /kyc/status FAILED]:", err?.error || err);
        }
      },
    }),
    submitLevel2Info: builder.mutation<ApiResponse<KycStatusResponse>, SubmitLevel2InfoRequest>({
      query: (body) => ({
        url: "/kyc/level-2/submit-info",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("\n================ [APP: POST /kyc/level-2/submit-info RESPONSE] ================");
          console.log(JSON.stringify(data, null, 2));
          console.log("===============================================================================\n");
          const kycData = (data as any)?.data || data;
          if (kycData) {
            dispatch(
              updateKycInfo({
                level: kycData.currentLevel !== undefined ? kycData.currentLevel : kycData.kycLevel,
                status: kycData.status || kycData.kycStatus,
              })
            );
          }
        } catch (err: any) {
          console.log("❌ [APP: POST /kyc/level-2/submit-info FAILED]:", err?.error || err);
        }
      },
    }),
    scanId: builder.mutation<ApiResponse<KycStatusResponse>, ScanIdRequest>({
      query: (body) => ({
        url: "/kyc/level-2/scan-id",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("\n================ [APP: POST /kyc/level-2/scan-id RESPONSE] ================");
          console.log(JSON.stringify(data, null, 2));
          console.log("===========================================================================\n");
          const kycData = (data as any)?.data || data;
          if (kycData) {
            dispatch(
              updateKycInfo({
                level: kycData.currentLevel !== undefined ? kycData.currentLevel : kycData.kycLevel,
                status: kycData.status || kycData.kycStatus,
              })
            );
          }
        } catch (err: any) {
          console.log("❌ [APP: POST /kyc/level-2/scan-id FAILED]:", err?.error || err);
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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("\n================ [APP: POST /kyc/level-2/face-verify RESPONSE] ================");
          console.log(JSON.stringify(data, null, 2));
          console.log("==============================================================================\n");
          const kycData = (data as any)?.data || data;
          if (kycData) {
            dispatch(
              updateKycInfo({
                level: kycData.currentLevel !== undefined ? kycData.currentLevel : kycData.kycLevel,
                status: kycData.status || kycData.kycStatus,
              })
            );
          }
        } catch (err: any) {
          console.log("❌ [APP: POST /kyc/level-2/face-verify FAILED]:", err?.error || err);
        }
      },
    }),
    uploadLevel3Docs: builder.mutation<ApiResponse<KycStatusResponse>, UploadLevel3DocsRequest>({
      query: (body) => ({
        url: "/kyc/level-3/upload-docs",
        method: "POST",
        body: {
          ...body,
          proofOfAddressUrl: body.addressDocUrl,
          utilityBillUrl: body.addressDocUrl,
        },
      }),
      invalidatesTags: ["Kyc", "User"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("\n================ [APP: POST /kyc/level-3/upload-docs RESPONSE] ================");
          console.log(JSON.stringify(data, null, 2));
          console.log("==============================================================================\n");
          const kycData = (data as any)?.data || data;
          if (kycData) {
            dispatch(
              updateKycInfo({
                level: kycData.currentLevel !== undefined ? kycData.currentLevel : kycData.kycLevel,
                status: kycData.status || kycData.kycStatus,
              })
            );
          }
        } catch (err: any) {
          console.log("❌ [APP: POST /kyc/level-3/upload-docs FAILED]:", err?.error || err);
        }
      },
    }),
    getKycDocuments: builder.query<ApiResponse<KycDocumentsResponse>, void>({
      query: () => "/kyc/documents",
      providesTags: ["Kyc"],
      async onQueryStarted(_, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("\n================ [APP: GET /kyc/documents RESPONSE] ================");
          console.log(JSON.stringify(data, null, 2));
          console.log("===================================================================\n");
          const kycPayload: any = (data as any)?.data || data;
          if (kycPayload) {
            const state = getState() as any;
            const currentUser = state?.auth?.user;
            const prevLevel = currentUser?.kycLevel;
            const prevStatus = currentUser?.kycStatus;
            const prevReason = currentUser?.kycRejectionReason ?? currentUser?.rejectionReason ?? null;

            let newStatus = kycPayload.kycStatus || prevStatus;
            let newLevel = kycPayload.kycLevel !== undefined ? kycPayload.kycLevel : prevLevel;
            let newReason = kycPayload.kycRejectionReason ?? null;

            if (isLevel2Rejected(kycPayload, currentUser)) {
              newStatus = "REJECTED";
              const idReason = idDocStatus(kycPayload) === "REJECTED" ? idRejectionText(kycPayload) : null;
              const faceReason = faceDocStatus(kycPayload) === "REJECTED" ? faceRejectionText(kycPayload) : null;
              newReason = (idReason && faceReason && idReason !== faceReason)
                ? `ID: ${idReason} | Face: ${faceReason}`
                : idReason || faceReason || kycPayload.kycRejectionReason || kycPayload.rejectionReason || prevReason;
            } else if (isLevel2Verified(kycPayload, currentUser)) {
              newStatus = "VERIFIED";
              newLevel = Math.max(newLevel ?? 0, 2);
              newReason = null;
            }

            const hasLevelChanged = newLevel !== undefined && newLevel !== prevLevel;
            const hasStatusChanged = newStatus !== undefined && newStatus !== prevStatus;
            const hasReasonChanged = (newReason || null) !== (prevReason || null);

            if (hasLevelChanged || hasStatusChanged || hasReasonChanged) {
              dispatch(
                updateKycInfo({
                  level: newLevel,
                  status: newStatus,
                  rejectionReason: newReason,
                })
              );

              if (hasStatusChanged && (newStatus === "VERIFIED" || newStatus === "REJECTED")) {
                dispatch(baseApi.util.invalidateTags(["User", "Notification"]));
              }
            }
          }
        } catch (err: any) {
          console.log("❌ [APP: GET /kyc/documents FAILED]:", err?.error || err);
        }
      },
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
