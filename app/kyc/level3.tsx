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
  const { data: kycStatusResponse } = useGetKycStatusQuery();
  const { data: kycDocsResponse } = useGetKycDocumentsQuery();
  const { data: userProfileResponse } = useGetMyProfileQuery();
  const [uploadLevel3Docs] = useUploadLevel3DocsMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const { uploadImage } = useImageUpload();

  const profilePayload: any = userProfileResponse?.data;
  const profile: any = profilePayload?.data || profilePayload || user;
  const kycPayload: any = kycDocsResponse?.data;
  const kycData: any = kycPayload?.data || kycPayload;

  const currentLevel = kycStatusResponse?.data?.currentLevel ?? user?.kycLevel ?? 1;

  // Level 2 is verified if currentLevel >= 2 OR if NIN & Face are approved/verified
  const isLevel2Verified =
    currentLevel >= 2 ||
    (kycData?.ninStatus === "Approved" && kycData?.faceStatus === "Approved") ||
    (kycData?.faceVerified && (kycData?.ninProviderVerified || Boolean(kycData?.idNumber)));

  useEffect(() => {
    // Only redirect if both queries have responded AND Level 2 is genuinely unverified
    if (kycStatusResponse && kycDocsResponse && !isLevel2Verified) {
      router.replace("/kyc/level2-intro");
    }
  }, [kycStatusResponse, kycDocsResponse, isLevel2Verified, router]);

  const [step, setStep] = useState<1 | 2>(1);
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
  const utilityRejectionReason = kycData?.utilityRejectionReason;
  const overallRejectionReason =
    kycData?.kycRejectionReason ||
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
    if (!proofOfAddress || !passport) return;
    setLocalError(null);
    setIsUploading(true);
    try {
      // 1. Sync structured residential address to user profile
      const fullAddress = `${addressData.streetAddress.trim()}, ${addressData.city.trim()}, ${addressData.state.trim()}`;
      try {
        await updateMyProfile({ address: fullAddress }).unwrap();
      } catch (profileErr) {
        console.warn("Could not sync address to profile:", profileErr);
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

      // 3. Upload passport
      const passportUrl = await uploadImage(passport, {
        name: passportName || "passport.jpg",
        type: "image/jpeg",
        allowFallback: false,
      });

      if (
        !addressDocUrl ||
        !passportUrl ||
        (!addressDocUrl.startsWith("http://") && !addressDocUrl.startsWith("https://")) ||
        (!passportUrl.startsWith("http://") && !passportUrl.startsWith("https://"))
      ) {
        throw new Error("Could not obtain valid public cloud URLs for your documents. Please try again.");
      }

      // 4. Submit Level 3 verification request
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
