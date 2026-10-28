import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { RootState } from "@/src/store";
import {
  useSubmitLevel2InfoMutation,
  useScanIdMutation,
  useFaceVerifyMutation,
  useGetKycDocumentsQuery,
  useGetKycStatusQuery,
} from "@/src/store/api/kycApi";
import { useUpdateMyProfileMutation, useGetMyProfileQuery } from "@/src/store/api/userApi";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import {
  Step1PersonalData,
  FormData,
  Step2ScanId,
  Step3ScanSuccessful,
  ScannedData,
  Step4FaceIntro,
  Step5FaceLive,
  Step6FaceCompleted,
  Step7Congratulation,
} from "@/src/features/kyc/components/level2";

export default function KYCLevel2Screen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: userProfileResponse } = useGetMyProfileQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: kycDocsResponse } = useGetKycDocumentsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: kycStatusResponse } = useGetKycStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  const [submitLevel2Info, { isLoading: isSubmittingInfo, error: submitInfoError }] =
    useSubmitLevel2InfoMutation();
  const [scanId, { isLoading: isScanningId, error: scanIdError }] =
    useScanIdMutation();
  const [faceVerify, { isLoading: isVerifyingFace, error: faceVerifyError }] =
    useFaceVerifyMutation();
  const { uploadImage, isLoading: isUploadingImage } = useImageUpload();
  const [updateMyProfile] = useUpdateMyProfileMutation();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [capturedSelfie, setCapturedSelfie] = useState<string | undefined>(undefined);
  const [capturedSelfieBase64, setCapturedSelfieBase64] = useState<string | undefined>(undefined);
  const [capturedIdPhoto, setCapturedIdPhoto] = useState<string | undefined>(undefined);
  const [localError, setLocalError] = useState<string | null>(null);

  const kycPayload: any = kycDocsResponse?.data;
  const kycData = kycPayload?.data || kycPayload;

  const ninStatusUpper = (kycData?.ninStatus || "").toUpperCase();
  const faceStatusUpper = (kycData?.faceStatus || "").toUpperCase();
  const kycStatusUpper = (kycStatusResponse?.data?.status || user?.kycStatus || "").toUpperCase();

  const isNinRejected = ninStatusUpper === "REJECTED";
  const isFaceRejected = faceStatusUpper === "REJECTED";
  const isLevel2Rejected = isNinRejected || isFaceRejected || kycStatusUpper === "REJECTED";

  const idReason = isNinRejected ? (kycData?.ninRejectionReason || kycData?.rejectionReason) : null;
  const faceReason = isFaceRejected ? (kycData?.faceRejectionReason || kycData?.rejectionReason) : null;
  const generalReason =
    kycData?.rejectionReason ||
    kycData?.ninRejectionReason ||
    kycData?.faceRejectionReason ||
    kycStatusResponse?.data?.kycRejectionReason ||
    (kycStatusResponse?.data as any)?.reason ||
    user?.kycRejectionReason;

  const specificRejectionReason =
    isNinRejected && isFaceRejected && idReason && faceReason && idReason !== faceReason
      ? `ID: ${idReason} | Face: ${faceReason}`
      : idReason || faceReason || generalReason;

  // Form data for Step 1
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: "",
    bvn: "",
    nextOfKinName: user?.nextOfKinName || "",
    nextOfKinRelationship: user?.nextOfKinRelationship || "",
    nextOfKinPhone: user?.nextOfKinPhone || "",
  });

  // Helper to format ISO date to DD / MM / YYYY for display
  const formatFromISO = (dateStr?: string): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day} / ${month} / ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Pre-populate user profile data and existing KYC documents data if available
  useEffect(() => {
    const profilePayload: any = userProfileResponse?.data;
    const profileUser = profilePayload?.data || profilePayload || user;

    if (user || kycData || profileUser) {
      setFormData((prev) => {
        const newFirstName =
          profileUser?.firstName || user?.firstName || prev.firstName;
        const newLastName =
          profileUser?.lastName || user?.lastName || prev.lastName;
        const newBvn = kycData?.bvn ? String(kycData.bvn) : prev.bvn;
        const newDob = kycData?.dateOfBirth
          ? formatFromISO(kycData.dateOfBirth)
          : profileUser?.dob
          ? formatFromISO(profileUser.dob)
          : prev.dateOfBirth;

        const newNokName =
          kycData?.nextOfKinName || profileUser?.nextOfKinName || user?.nextOfKinName || prev.nextOfKinName;
        const newNokRel =
          kycData?.nextOfKinRelationship || profileUser?.nextOfKinRelationship || user?.nextOfKinRelationship || prev.nextOfKinRelationship;
        const newNokPhone =
          kycData?.nextOfKinPhone || profileUser?.nextOfKinPhone || user?.nextOfKinPhone || prev.nextOfKinPhone;

        return {
          ...prev,
          firstName: newFirstName || "",
          lastName: newLastName || "",
          bvn: newBvn || "",
          dateOfBirth: newDob || "",
          nextOfKinName: newNokName || "",
          nextOfKinRelationship: newNokRel || "",
          nextOfKinPhone: newNokPhone || "",
        };
      });

      setScannedData((prev) => {
        const newFirstName = `${profileUser?.firstName || user?.firstName || prev.firstName.split(" ")[0] || ""} ${
          profileUser?.lastName || user?.lastName || prev.firstName.split(" ")[1] || ""
        }`.trim();
        const newDob = kycData?.dateOfBirth
          ? formatFromISO(kycData.dateOfBirth)
          : prev.dateOfBirth;

        return {
          ...prev,
          firstName: newFirstName || "",
          dateOfBirth: newDob || "",
          idType: kycData?.idType || prev.idType || "",
          idNumber: kycData?.idNumber || prev.idNumber || "",
        };
      });

      if (kycData?.idImageUrl) {
        setCapturedIdPhoto((prev) => prev || kycData.idImageUrl);
      }
      if (kycData?.faceImageUrl) {
        setCapturedSelfie((prev) => prev || kycData.faceImageUrl);
      }
    }
  }, [user, userProfileResponse, kycDocsResponse]);

  // Scanned data for Step 3
  const [scannedData, setScannedData] = useState<ScannedData>({
    firstName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    dateOfBirth: "",
    idType: "",
    idNumber: "",
    expires: "",
  });

  const handleFormChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    } else {
      router.back();
    }
  };

  const formatToYYYYMMDD = (dateStr: string): string => {
    if (!dateStr) return "";

    const parts = dateStr.split("/").map((part) => part.trim());
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);

      if (year < 100 && parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }

      if (
        !isNaN(day) &&
        !isNaN(month) &&
        !isNaN(year) &&
        year > 1900 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      ) {
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      }
    }

    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) {
      const y = fallback.getFullYear();
      const m = String(fallback.getMonth() + 1).padStart(2, "0");
      const d = String(fallback.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    return "";
  };

  const formatPhoneToE164 = (phoneInput?: string): string | undefined => {
    if (!phoneInput) return undefined;
    const cleaned = phoneInput.trim().replace(/[^\d+]/g, "");
    if (!cleaned) return undefined;
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("234")) return `+${cleaned}`;
    if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
    if (cleaned.length === 10) return `+234${cleaned}`;
    return `+${cleaned}`;
  };

  // Step 1 Submission
  const handleStep1Continue = async () => {
    try {
      const formattedDateOfBirth = formatToYYYYMMDD(formData.dateOfBirth);

      // 1. Permanently persist Next of Kin details to user profile via PUT /user/me
      if (formData.nextOfKinName || formData.nextOfKinPhone) {
        const profilePayload = {
          nextOfKinName: formData.nextOfKinName?.trim(),
          nextOfKinRelationship: formData.nextOfKinRelationship?.trim(),
          nextOfKinPhone: formatPhoneToE164(formData.nextOfKinPhone),
        };

        console.log("\n================ [STEP 1: NEXT OF KIN PROFILE SYNC REQUEST] ================");
        console.log("Endpoint: PUT /user/me");
        console.log("Payload:", JSON.stringify(profilePayload, null, 2));
        console.log("============================================================================\n");

        try {
          const profileRes = await updateMyProfile(profilePayload).unwrap();
          console.log("\n================ [STEP 1: NEXT OF KIN PROFILE SYNC RESPONSE] ================");
          console.log("Status: SUCCESS");
          console.log("Result from /user/me:", JSON.stringify(profileRes, null, 2));
          console.log("=============================================================================\n");
        } catch (profileErr: any) {
          console.log("\n❌ [STEP 1: NEXT OF KIN PROFILE SYNC FAILED]:");
          console.log("Error details:", JSON.stringify(profileErr, null, 2));
          console.log("=============================================================================\n");
        }
      }

      // 2. Submit strict BVN and Date of Birth payload to POST /kyc/level-2/submit-info
      const kycPayload = {
        bvn: formData.bvn.trim(),
        dateOfBirth: formattedDateOfBirth,
      };

      console.log("\n================ [STEP 1: KYC BVN SUBMIT REQUEST] ================");
      console.log("Endpoint: POST /kyc/level-2/submit-info");
      console.log("Payload:", JSON.stringify(kycPayload, null, 2));
      console.log("===================================================================\n");

      const response = await submitLevel2Info(kycPayload).unwrap();

      console.log("\n================ [STEP 1: KYC BVN SUBMIT RESPONSE] ================");
      console.log("Status: SUCCESS");
      console.log("Result from /kyc/level-2/submit-info:", JSON.stringify(response, null, 2));
      console.log("====================================================================\n");

      setScannedData((prev) => ({
        ...prev,
        firstName: `${formData.firstName} ${formData.lastName}`.trim(),
        dateOfBirth: formData.dateOfBirth,
      }));
      setStep(2);
    } catch (err: any) {
      console.log("\n❌ [STEP 1: SUBMIT LEVEL 2 INFO ERROR]:", JSON.stringify(err, null, 2));
      console.log("===================================================================\n");
      const errMsg = (err?.data?.message || err?.message || "").toLowerCase();
      // If BVN was already submitted or info exists from a prior attempt, advance to Step 2 so user can upload ID and Face
      if (
        errMsg.includes("already") ||
        errMsg.includes("exist") ||
        errMsg.includes("bvn") ||
        Boolean(user?.bvn)
      ) {
        setScannedData((prev) => ({
          ...prev,
          firstName: `${formData.firstName} ${formData.lastName}`.trim(),
          dateOfBirth: formData.dateOfBirth,
        }));
        setStep(2);
      }
    }
  };

  // Step 3 Submission
  const handleStep3Confirm = async (data: ScannedData) => {
    setLocalError(null);
    try {
      console.log("\n================ [KYC 2 - STEP 3: ID CONFIRMATION] ================");
      console.log("Local capturedIdPhoto:", capturedIdPhoto);
      console.log("Form data:", JSON.stringify(data, null, 2));
      console.log("====================================================================\n");

      if (!capturedIdPhoto) {
        throw new Error("Please scan or take a photo of your ID before confirming.");
      }

      console.log("[KYC 2] Uploading ID image to cloud server...");
      const imageUrl = await uploadImage(capturedIdPhoto, {
        name: "id_card.jpg",
        allowFallback: false,
      });

      console.log("\n================ [KYC 2 - STEP 3: CLOUD UPLOAD RESULT] ================");
      console.log("Resolved imageUrl:", imageUrl);
      console.log("=======================================================================\n");

      // Strict validation: Must be a remote public http(s) URL
      if (!imageUrl || (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))) {
        throw new Error("Could not obtain a valid public cloud URL for your ID image. Please try again.");
      }

      const payload = {
        idType: data.idType,
        idNumber: data.idNumber,
        idImageUrl: imageUrl,
      };

      console.log("\n================ [KYC 2 - STEP 3: SCAN ID REQUEST] ================");
      console.log("Endpoint: POST /kyc/level-2/scan-id");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("===================================================================\n");

      const response = await scanId(payload).unwrap();

      console.log("\n================ [KYC 2 - STEP 3: SCAN ID RESPONSE] ================");
      console.log("Response from server:", JSON.stringify(response, null, 2));
      console.log("====================================================================\n");

      setScannedData(data);
      setStep(4);
    } catch (err: any) {
      console.log("\n❌ [KYC 2 - STEP 3: SCAN ID ERROR]:", err);
      console.log("===================================================================\n");
      setLocalError(err?.data?.message || err?.message || "Failed to upload ID image. Please try again.");
    }
  };

  // Step 5 Capture
  const handleFaceScanComplete = (photoUri?: string, base64?: string) => {
    if (photoUri) {
      setCapturedSelfie(photoUri);
    }
    if (base64) {
      setCapturedSelfieBase64(base64);
    }
    setStep(6);
  };

  // Step 6 Submission
  const handleStep6Continue = async () => {
    setLocalError(null);
    try {
      let uploadedSelfieUrl: string | undefined;
      if (capturedSelfie) {
        try {
          console.log("[KYC 2 - STEP 6]: Optimizing and uploading face selfie to cloud storage...");
          let selfieUriToUpload = capturedSelfie;
          try {
            const optimizedSelfie = await manipulateAsync(
              capturedSelfie,
              [{ resize: { width: 480 } }],
              { compress: 0.4, format: SaveFormat.JPEG }
            );
            if (optimizedSelfie?.uri) {
              selfieUriToUpload = optimizedSelfie.uri;
            }
          } catch (optErr) {
            console.log("Selfie cloud optimization fallback:", optErr);
          }

          uploadedSelfieUrl = await uploadImage(selfieUriToUpload, {
            name: "face_selfie.jpg",
            allowFallback: false,
          });
          console.log("[KYC 2 - STEP 6]: Face selfie uploaded successfully:", uploadedSelfieUrl);
        } catch (uploadErr) {
          console.warn("[KYC 2 - STEP 6]: Cloud selfie upload warning (continuing with biometric verify):", uploadErr);
        }
      }

      // Ensure base64 string is cleaned and ultra-lightweight (< 30KB) to prevent HTTP 413 Payload Too Large
      let safeBase64 = capturedSelfieBase64 || "";
      if (safeBase64.includes(",")) {
        safeBase64 = safeBase64.split(",")[1];
      }

      // If safeBase64 is missing or oversized (> 60,000 chars ~ 45KB), re-compress to 280px / 0.2 quality
      if (capturedSelfie && (!safeBase64 || safeBase64.length > 60000)) {
        try {
          const recompressed = await manipulateAsync(
            capturedSelfie,
            [{ resize: { width: 280 } }],
            { compress: 0.2, format: SaveFormat.JPEG, base64: true }
          );
          if (recompressed?.base64) {
            safeBase64 = recompressed.base64;
          }
        } catch (recompErr) {
          console.log("[KYC 2] Safe base64 recompression:", recompErr);
        }
      }

      const sessionId = `session_${Date.now()}`;
      const payload: any = {
        biometricSessionId: sessionId,
        imageBase64: safeBase64 || "mock_base64_string",
        ...(uploadedSelfieUrl ? { faceImageUrl: uploadedSelfieUrl, imageUrl: uploadedSelfieUrl } : {}),
      };

      console.log("\n================ [KYC 2 - STEP 6: FACE VERIFY REQUEST] ================");
      console.log("Endpoint: POST /kyc/level-2/face-verify");
      console.log("biometricSessionId:", sessionId);
      console.log("imageBase64 length:", safeBase64?.length || 0);
      if (uploadedSelfieUrl) console.log("faceImageUrl:", uploadedSelfieUrl);
      console.log("=======================================================================\n");

      const response = await faceVerify(payload).unwrap();

      console.log("\n================ [KYC 2 - STEP 6: FACE VERIFY RESPONSE] ================");
      console.log("Response from server:", JSON.stringify(response, null, 2));
      console.log("========================================================================\n");

      setStep(7);
    } catch (err: any) {
      console.log("\n❌ [KYC 2 - STEP 6: FACE VERIFY ERROR]:", err);
      console.log("=======================================================================\n");
      const errMessage =
        err?.data?.message ||
        err?.message ||
        (err?.status === 413 ? "Photo file was too large. Please retake photo." : "Face verification failed. Please try again.");
      setLocalError(errMessage);
    }
  };

  const handleFinishAll = () => {
    if (user?.kycStatus === "VERIFIED" || (user?.kycLevel && user.kycLevel >= 2)) {
      dispatch(updateKycLevel(2));
    }
    router.replace("/(tabs)");
  };

  const formatErrorMessage = (errorObj: any): string | undefined => {
    if (!errorObj) return undefined;
    if (typeof errorObj.data?.message === "string") return errorObj.data.message;
    if (typeof errorObj.message === "string") return errorObj.message;
    if (typeof errorObj.error === "string") return errorObj.error;
    return "An error occurred during verification. Please try again.";
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: step === 5 || step === 6 ? "#0F172A" : "white",
      }}
      edges={step === 5 || step === 6 ? [] : ["top", "bottom"]}
    >
      <StatusBar
        style={step === 5 || step === 6 ? "light" : "dark"}
        translucent={true}
      />

      {isLevel2Rejected && specificRejectionReason && step !== 5 && (
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 4,
            padding: 12,
            backgroundColor: "#FEF2F2",
            borderColor: "#FECACA",
            borderWidth: 1,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginTop: 1 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#991B1B" }}>
              Re-submission Notice
            </Text>
            <Text style={{ fontSize: 12, color: "#B91C1C", marginTop: 2, lineHeight: 16 }}>
              {specificRejectionReason}
            </Text>
          </View>
        </View>
      )}

      {step === 1 && (
        <Step1PersonalData
          formData={formData}
          onChange={handleFormChange}
          onContinue={handleStep1Continue}
          onBack={handleBack}
          isLoading={isSubmittingInfo}
          error={formatErrorMessage(submitInfoError)}
        />
      )}

      {step === 2 && (
        <Step2ScanId
          onStartScanning={(photoUri) => {
            if (photoUri) setCapturedIdPhoto(photoUri);
            setStep(3);
          }}
          onBack={handleBack}
        />
      )}

      {step === 3 && (
        <Step3ScanSuccessful
          initialData={scannedData}
          photoUri={capturedIdPhoto}
          onConfirm={handleStep3Confirm}
          onBack={handleBack}
          isLoading={isScanningId || isUploadingImage}
          error={
            localError ||
            formatErrorMessage(scanIdError) ||
            (isNinRejected && idReason ? `ID Issue: ${idReason}` : undefined)
          }
        />
      )}

      {step === 4 && (
        <Step4FaceIntro
          onStartScanning={() => setStep(5)}
          onBack={handleBack}
        />
      )}

      {step === 5 && (
        <Step5FaceLive
          onScanComplete={handleFaceScanComplete}
          onBack={handleBack}
        />
      )}

      {step === 6 && (
        <Step6FaceCompleted
          photoUri={capturedSelfie}
          onContinue={handleStep6Continue}
          onRetake={() => {
            setLocalError(null);
            setStep(5);
          }}
          isLoading={isVerifyingFace || isUploadingImage}
          error={
            localError ||
            formatErrorMessage(faceVerifyError) ||
            (isFaceRejected && faceReason ? `Face Issue: ${faceReason}` : undefined)
          }
        />
      )}

      {step === 7 && (
        <Step7Congratulation
          onFinish={handleFinishAll}
          isPending={user?.kycStatus !== "VERIFIED" && (user?.kycLevel || 1) < 2}
        />
      )}
    </SafeAreaView>
  );
}
