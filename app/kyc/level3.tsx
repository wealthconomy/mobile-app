import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { RootState } from "@/src/store";
import { useGetKycDocumentsQuery, useUploadLevel3DocsMutation } from "@/src/store/api/kycApi";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import Header from "@/src/components/common/Header";

import {
  Step1UploadCredentials,
  Step2Congratulation,
  IdCardData,
} from "@/src/features/kyc/components/level3";

export default function KYCLevel3Screen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycDocsResponse } = useGetKycDocumentsQuery();
  const [uploadLevel3Docs] = useUploadLevel3DocsMutation();
  const { uploadImage } = useImageUpload();

  const [step, setStep] = useState<1 | 2>(1);
  const [proofOfAddress, setProofOfAddress] = useState<string | null>(null);
  const [passport, setPassport] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [scannedData, setScannedData] = useState<IdCardData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: "",
    nin: "",
    expires: "",
    idImageUrl: "",
  });

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

  useEffect(() => {
    const kycData = kycDocsResponse?.data;
    if (user || kycData) {
      setScannedData((prev) => ({
        firstName: user?.firstName || prev.firstName,
        lastName: user?.lastName || prev.lastName,
        dateOfBirth: kycData?.dateOfBirth ? formatFromISO(kycData.dateOfBirth) : prev.dateOfBirth,
        nin: kycData?.idNumber || prev.nin,
        expires: prev.expires || "12 / 2029", // placeholder if missing
        idImageUrl: kycData?.idImageUrl || prev.idImageUrl,
      }));
    }
  }, [user, kycDocsResponse]);

  const handleConfirm = async () => {
    if (!proofOfAddress || !passport) return;
    setLocalError(null);
    setIsUploading(true);
    try {
      const addressDocUrl = await uploadImage(proofOfAddress, { name: "address_proof.jpg" });
      const passportUrl = await uploadImage(passport, { name: "passport.jpg" });

      await uploadLevel3Docs({
        addressDocUrl,
        passportUrl,
      }).unwrap();

      setStep(2);
    } catch (err: any) {
      console.log("KYC 3 Submit Error", err);
      setLocalError(err?.data?.message || err?.message || "Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = () => {
    dispatch(updateKycLevel(3));
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
      edges={["top", "bottom"]}
    >
      <StatusBar style="dark" translucent={true} />
      
      {step === 1 && (
        <>
          <Header title="" onBack={() => router.back()} />
          <Step1UploadCredentials
            scannedData={scannedData}
            proofOfAddress={proofOfAddress}
            passport={passport}
            setProofOfAddress={setProofOfAddress}
            setPassport={setPassport}
            onConfirm={handleConfirm}
            isLoading={isUploading}
            error={localError || undefined}
          />
        </>
      )}

      {step === 2 && (
        <Step2Congratulation onFinish={handleFinish} />
      )}
    </SafeAreaView>
  );
}
