import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { RootState } from "@/src/store";
import {
  useSubmitLevel2InfoMutation,
  useScanIdMutation,
  useFaceVerifyMutation,
  useGetKycDocumentsQuery,
} from "@/src/store/api/kycApi";
import { useImageUpload } from "@/src/hooks/useImageUpload";

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

  const { data: kycDocsResponse } = useGetKycDocumentsQuery();
  const [submitLevel2Info, { isLoading: isSubmittingInfo, error: submitInfoError }] =
    useSubmitLevel2InfoMutation();
  const [scanId, { isLoading: isScanningId, error: scanIdError }] =
    useScanIdMutation();
  const [faceVerify, { isLoading: isVerifyingFace, error: faceVerifyError }] =
    useFaceVerifyMutation();
  const { uploadImage, isLoading: isUploadingImage } = useImageUpload();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [capturedSelfie, setCapturedSelfie] = useState<string | undefined>(undefined);
  const [capturedSelfieBase64, setCapturedSelfieBase64] = useState<string | undefined>(undefined);
  const [capturedIdPhoto, setCapturedIdPhoto] = useState<string | undefined>(undefined);
  const [localError, setLocalError] = useState<string | null>(null);

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
    const isLevel2Complete =
      (user?.kycLevel !== undefined && user.kycLevel >= 2) ||
      kycDocsResponse?.data?.faceVerified === true;

    if (isLevel2Complete && step < 7) {
      router.replace("/kyc/level3-intro");
      return;
    }

    const kycData = kycDocsResponse?.data;
    if (user || kycData) {
      setFormData((prev) => {
        const newFirstName = user?.firstName !== undefined && user.firstName !== null ? user.firstName : prev.firstName;
        const newLastName = user?.lastName !== undefined && user.lastName !== null ? user.lastName : prev.lastName;
        const newBvn = kycData?.bvn ? String(kycData.bvn) : prev.bvn;
        const newDob = kycData?.dateOfBirth
          ? formatFromISO(kycData.dateOfBirth)
          : prev.dateOfBirth;

        const newNokName = user?.nextOfKinName !== undefined && user.nextOfKinName !== null ? user.nextOfKinName : prev.nextOfKinName;
        const newNokRel = user?.nextOfKinRelationship !== undefined && user.nextOfKinRelationship !== null ? user.nextOfKinRelationship : prev.nextOfKinRelationship;
        const newNokPhone = user?.nextOfKinPhone !== undefined && user.nextOfKinPhone !== null ? user.nextOfKinPhone : prev.nextOfKinPhone;

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
        const newFirstName = `${user?.firstName || prev.firstName.split(" ")[0] || ""} ${
          user?.lastName || prev.firstName.split(" ")[1] || ""
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
    }
  }, [user, kycDocsResponse]);

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

  // Step 1 Submission
  const handleStep1Continue = async () => {
    try {
      const formattedDateOfBirth = formatToYYYYMMDD(formData.dateOfBirth);
      const payload = {
        bvn: formData.bvn,
        dateOfBirth: formattedDateOfBirth,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nextOfKinName: formData.nextOfKinName || user?.nextOfKinName || "",
        nextOfKinRelationship: formData.nextOfKinRelationship || user?.nextOfKinRelationship || "",
        nextOfKinPhone: formData.nextOfKinPhone || user?.nextOfKinPhone || "",
      };

      await submitLevel2Info(payload).unwrap();

      setScannedData((prev) => ({
        ...prev,
        firstName: `${formData.firstName} ${formData.lastName}`.trim(),
        dateOfBirth: formData.dateOfBirth,
      }));
      setStep(2);
    } catch {
      // handled by mutation error state
    }
  };

  // Step 3 Submission
  const handleStep3Confirm = async (data: ScannedData) => {
    setLocalError(null);
    try {
      const fallbackPhoto = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80";
      const imageUrl = await uploadImage(capturedIdPhoto || fallbackPhoto, {
        name: "id_card.jpg",
        allowFallback: false,
      });

      const payload = {
        idType: data.idType,
        idNumber: data.idNumber,
        idImageUrl: imageUrl,
      };

      await scanId(payload).unwrap();

      setScannedData(data);
      setStep(4);
    } catch (err: any) {
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
    try {
      const sessionId = `session_${Date.now()}`;
      const payload = {
        biometricSessionId: sessionId,
        imageBase64: capturedSelfieBase64 || "mock_base64_string",
      };

      await faceVerify(payload).unwrap();

      setStep(7);
    } catch {
      // handled by mutation error state
    }
  };

  const handleFinishAll = () => {
    dispatch(updateKycLevel(2));
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
          error={localError || formatErrorMessage(scanIdError)}
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
          isLoading={isVerifyingFace}
          error={formatErrorMessage(faceVerifyError)}
        />
      )}

      {step === 7 && (
        <Step7Congratulation onFinish={handleFinishAll} />
      )}
    </SafeAreaView>
  );
}
