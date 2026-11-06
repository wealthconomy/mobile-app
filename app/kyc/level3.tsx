import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { updateKycLevel } from "@/src/store/slices/authSlice";
import { RootState } from "@/src/store";
import { useGetKycDocumentsQuery, useGetKycStatusQuery, useUploadLevel3DocsMutation } from "@/src/store/api/kycApi";
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/src/store/api/userApi";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import Header from "@/src/components/common/Header";
import {
  isLevel2Verified as checkIsLevel2Verified,
  isLevel3Verified as checkIsLevel3Verified,
  isLevel3Rejected as checkIsLevel3Rejected,
  isLevel3Pending as checkIsLevel3Pending,
  hasLevel3AddressDoc as checkHasLevel3AddressDoc,
  utilityRejectionText,
} from "@/src/features/kyc/utils/kycState";

import { NIGERIA_STATES } from "@/src/constants/nigeriaLocations";

import {
  Step1UploadCredentials,
  Step2Congratulation,
  IdCardData,
  AddressFormData,
} from "@/src/features/kyc/components/level3";

export default function KYCLevel3Screen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycStatusResponse } = useGetKycStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: kycDocsResponse } = useGetKycDocumentsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: userProfileResponse } = useGetMyProfileQuery();
  const [uploadLevel3Docs] = useUploadLevel3DocsMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const { uploadImage } = useImageUpload();

  const profilePayload: any = userProfileResponse?.data;
  const profile: any = profilePayload?.data || profilePayload || user;
  const kycPayload: any = kycDocsResponse?.data;
  const kycData: any = kycPayload?.data || kycPayload;

  const currentLevel = kycStatusResponse?.data?.currentLevel ?? user?.kycLevel ?? 1;

  const isLevel2Verified = checkIsLevel2Verified(kycData, user);
  const hasLevel3AddressDoc = checkHasLevel3AddressDoc(kycData);
  const isLevel3Verified = checkIsLevel3Verified(kycData, user);
  const isLevel3Rejected = checkIsLevel3Rejected(kycData, user);
  const isLevel3Pending = checkIsLevel3Pending(kycData, user);

  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    // Only redirect if both queries have responded AND Level 2 is genuinely unverified
    if (kycStatusResponse && kycDocsResponse && !isLevel2Verified) {
      router.replace("/kyc/level2-intro");
      return;
    }

    if (isLevel3Verified && step < 2) {
      router.replace("/(tabs)/my-account");
      return;
    }

    if (isLevel3Pending && step < 2) {
      router.replace("/kyc/level3-intro");
      return;
    }
  }, [kycStatusResponse, kycDocsResponse, isLevel2Verified, isLevel3Verified, isLevel3Pending, step, router]);
  const [proofOfAddress, setProofOfAddress] = useState<string | null>(null);
  const [proofOfAddressName, setProofOfAddressName] = useState<string | null>(null);
  const [passport, setPassport] = useState<string | null>(null);
  const [passportName, setPassportName] = useState<string | null>(null);
  const [isPassportReplaced, setIsPassportReplaced] = useState(false);
  const [isUtilityReplaced, setIsUtilityReplaced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passportStatus = kycData?.passportStatus;
  const passportRejectionReason = kycData?.passportRejectionReason;
  const utilityStatus = kycData?.utilityStatus;
  const utilityRejectionReason = utilityRejectionText(kycData);
  const overallRejectionReason =
    utilityRejectionReason ||
    kycData?.kycRejectionReason ||
    kycData?.rejectionReason ||
    kycStatusResponse?.data?.kycRejectionReason ||
    user?.kycRejectionReason;


  const [addressData, setAddressData] = useState<AddressFormData>({
    streetAddress: "",
    city: "",
    state: "",
  });

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

  const extractFileName = (url?: string | null, fallback = "Document") => {
    if (!url) return fallback;
    try {
      const clean = url.split("?")[0];
      const name = clean.substring(clean.lastIndexOf("/") + 1);
      return name || fallback;
    } catch {
      return fallback;
    }
  };

  const parseAddressString = (rawAddress: string) => {
    if (!rawAddress) return { streetAddress: "", city: "", state: "" };
    const clean = rawAddress.trim();
    if (!clean) return { streetAddress: "", city: "", state: "" };

    const parts = clean.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) {
      return { streetAddress: clean, city: "", state: "" };
    }

    // Check if any segment matches a Nigerian State
    let matchedState = "";
    let matchedStateIdx = -1;
    let matchedStateObj: (typeof NIGERIA_STATES)[0] | undefined;

    for (let i = parts.length - 1; i >= 0; i--) {
      const pLower = parts[i].toLowerCase();
      const s = NIGERIA_STATES.find(
        (st) =>
          st.name.toLowerCase() === pLower ||
          (st.name.toLowerCase() === "federal capital territory" &&
            (pLower === "fct" || pLower === "abuja" || pLower.includes("abuja")))
      );
      if (s) {
        matchedState = s.name;
        matchedStateIdx = i;
        matchedStateObj = s;
        break;
      }
    }

    if (matchedStateIdx !== -1 && matchedStateObj) {
      let matchedCity = "";
      let cityIdx = -1;
      if (matchedStateIdx > 0) {
        const candidate = parts[matchedStateIdx - 1];
        const candLower = candidate.toLowerCase();
        const lga = matchedStateObj.lgas.find(
          (l) => l.toLowerCase() === candLower || candLower.includes(l.toLowerCase())
        );
        matchedCity = lga || candidate;
        cityIdx = matchedStateIdx - 1;
      }

      const streetEnd = cityIdx !== -1 ? cityIdx : matchedStateIdx;
      const street = parts.slice(0, streetEnd).join(", ");
      return {
        streetAddress: street || parts[0] || "",
        city: matchedCity,
        state: matchedState,
      };
    }

    if (parts.length === 2) {
      return {
        streetAddress: parts[0],
        city: "",
        state: parts[1],
      };
    }

    return {
      streetAddress: parts.slice(0, parts.length - 2).join(", "),
      city: parts[parts.length - 2] || "",
      state: parts[parts.length - 1] || "",
    };
  };

  useEffect(() => {
    const kycPayload: any = kycDocsResponse?.data;
    const kycData: any = kycPayload?.data || kycPayload;
    const profileUser: any = profile;

    if (user || kycData || profileUser) {
      setScannedData((prev) => ({
        firstName: profileUser?.firstName || user?.firstName || prev.firstName,
        lastName: profileUser?.lastName || user?.lastName || prev.lastName,
        dateOfBirth: kycData?.dateOfBirth ? formatFromISO(kycData.dateOfBirth) : prev.dateOfBirth,
        nin: kycData?.idNumber || prev.nin,
        expires: prev.expires || "N/A",
        idImageUrl: kycData?.idImageUrl || prev.idImageUrl,
      }));

      // Auto-prefill Proof of Address if previously uploaded
      if (kycData?.addressDocUrl) {
        setProofOfAddress((prev) => prev || kycData.addressDocUrl || null);
        setProofOfAddressName((prev) => prev || extractFileName(kycData.addressDocUrl, "Proof_of_Address"));
      }

      // Auto-prefill International Passport if previously uploaded
      if (kycData?.passportUrl) {
        setPassport((prev) => prev || kycData.passportUrl || null);
        setPassportName((prev) => prev || extractFileName(kycData.passportUrl, "International_Passport"));
      }

      // Extract explicit street address if present from any KYC/NIN/BVN/Profile source
      const explicitStreet =
        profileUser?.streetAddress ||
        profileUser?.street ||
        kycData?.streetAddress ||
        kycData?.street ||
        kycData?.residenceAddress ||
        kycData?.residentialAddress ||
        kycData?.ninExtracted?.residence_address ||
        kycData?.ninExtracted?.address ||
        kycData?.ninExtracted?.residence?.address1 ||
        kycData?.bvnExtracted?.residentialAddress ||
        kycData?.bvnExtracted?.address ||
        (user as any)?.streetAddress;

      const fullAddr =
        explicitStreet ||
        profileUser?.address ||
        user?.address ||
        kycData?.address ||
        "";

      if (fullAddr) {
        const parsed = parseAddressString(fullAddr);
        const resolvedStreet = explicitStreet || parsed.streetAddress;
        setAddressData((prev) => ({
          streetAddress: prev.streetAddress.trim() ? prev.streetAddress : (resolvedStreet || ""),
          city: prev.city.trim() ? prev.city : (parsed.city || ""),
          state: prev.state.trim() ? prev.state : (parsed.state || ""),
        }));
      }
    }
  }, [user, profile, kycDocsResponse]);


  const handleConfirm = async () => {
    if (!proofOfAddress) return;
    setLocalError(null);
    setIsUploading(true);
    try {
      // 1. Sync structured residential address to user profile
      const fullAddress = `${addressData.streetAddress.trim()}, ${addressData.city.trim()}, ${addressData.state.trim()}`;
      try {
        await updateMyProfile({ address: fullAddress }).unwrap();
      } catch {
        console.warn("Could not sync address to profile");
      }

      // 2. Upload proof of address (PDF or image)
      const isPdfProof =
        proofOfAddressName?.toLowerCase().endsWith(".pdf") ||
        proofOfAddress.toLowerCase().endsWith(".pdf");

      const addressDocUrl = await uploadImage(proofOfAddress, {
        name: proofOfAddressName || (isPdfProof ? "address_proof.pdf" : "address_proof.jpg"),
        type: isPdfProof ? "application/pdf" : "image/jpeg",
        allowFallback: false,
      });

      if (
        !addressDocUrl ||
        (!addressDocUrl.startsWith("http://") && !addressDocUrl.startsWith("https://"))
      ) {
        throw new Error("Could not obtain a valid public cloud URL for your address document. Please try again.");
      }

      // 3. Submit Level 3 verification request
      await uploadLevel3Docs({
        addressDocUrl,
        ...(passport ? { passportUrl: passport } : {}),
      }).unwrap();

      setStep(2);
    } catch (err: any) {
      setLocalError(err?.data?.message || err?.message || "Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = () => {
    if (user?.kycStatus === "VERIFIED" || (user?.kycLevel && user.kycLevel >= 3)) {
      dispatch(updateKycLevel(3));
    }
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
            addressData={addressData}
            setAddressData={setAddressData}
            proofOfAddress={proofOfAddress}
            proofOfAddressName={proofOfAddressName}
            passport={passport}
            passportName={passportName}
            setProofOfAddress={(uri, name) => {
              setProofOfAddress(uri);
              setProofOfAddressName(name || null);
              setIsUtilityReplaced(true);
            }}
            setPassport={(uri, name) => {
              setPassport(uri);
              setPassportName(name || null);
              setIsPassportReplaced(true);
            }}
            onConfirm={handleConfirm}
            isLoading={isUploading}
            error={localError || undefined}
            passportStatus={passportStatus}
            passportRejectionReason={passportRejectionReason}
            utilityStatus={utilityStatus}
            utilityRejectionReason={utilityRejectionReason}
            overallRejectionReason={overallRejectionReason}
            isPassportReplaced={isPassportReplaced}
            isUtilityReplaced={isUtilityReplaced}
          />
        </>
      )}

      {step === 2 && (
        <Step2Congratulation
          onFinish={handleFinish}
          isPending={user?.kycStatus !== "VERIFIED" && (user?.kycLevel || 1) < 3}
        />
      )}
    </SafeAreaView>
  );
}
