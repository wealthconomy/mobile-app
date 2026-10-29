/**
 * Pure KYC status helper functions
 *
 * Normalizes document status checks across both OLD flow (ninStatus) and NEW flow (idStatus & faceStatus).
 *
 * Examples:
 * 1. Old flow approval: { ninStatus: "Approved", faceStatus: "Approved" } -> idDocStatus="APPROVED", isLevel2Verified=true
 * 2. New flow approval: { idStatus: "Approved", faceStatus: "Approved", ninStatus: "Pending" } -> idDocStatus="APPROVED", isLevel2Verified=true
 * 3. Pending submission: { idImageUrl: "https://...", selfieUrl: "https://...", idStatus: "Pending" } -> hasLevel2Uploads=true, isLevel2Pending=true
 */

export type DocStatus = "APPROVED" | "REJECTED" | "PENDING";

export interface KycDocsLike {
  idStatus?: string;
  ninStatus?: string;
  faceStatus?: string;
  utilityStatus?: string;
  kycStatus?: string;
  status?: string;
  kycLevel?: number;
  currentLevel?: number;
  idImageUrl?: string;
  faceImageUrl?: string;
  selfieUrl?: string;
  faceVerified?: boolean;
  addressDocUrl?: string;
  proofOfAddressUrl?: string;
  utilityBillUrl?: string;
  ninRejectionReason?: string;
  faceRejectionReason?: string;
  utilityRejectionReason?: string;
  rejectionReason?: string;
  kycRejectionReason?: string;
  [key: string]: any;
}

export interface AuthUserLike {
  kycLevel?: number;
  kycStatus?: string;
  kycVerified?: boolean;
  isVerified?: boolean;
  idImageUrl?: string;
  faceImageUrl?: string;
  imageUrl?: string;
  kycRejectionReason?: string;
  rejectionReason?: string;
  [key: string]: any;
}

/**
 * Returns "APPROVED" if idStatus OR ninStatus is Approved.
 * Returns "REJECTED" if either is Rejected.
 * Otherwise returns "PENDING".
 */
export function idDocStatus(docs?: KycDocsLike | null): DocStatus {
  if (!docs) return "PENDING";
  const id = (docs.idStatus || "").trim().toUpperCase();
  const nin = (docs.ninStatus || "").trim().toUpperCase();

  if (id === "REJECTED" || nin === "REJECTED") return "REJECTED";
  if (id === "APPROVED" || nin === "APPROVED") return "APPROVED";
  return "PENDING";
}

/**
 * Returns face status normalized to "APPROVED" | "REJECTED" | "PENDING".
 */
export function faceDocStatus(docs?: KycDocsLike | null): DocStatus {
  if (!docs) return "PENDING";
  const face = (docs.faceStatus || "").trim().toUpperCase();

  if (face === "REJECTED") return "REJECTED";
  if (face === "APPROVED") return "APPROVED";
  return "PENDING";
}

/**
 * Returns utility/address status normalized to "APPROVED" | "REJECTED" | "PENDING" | "IN_REVIEW".
 */
export function utilityDocStatus(docs?: KycDocsLike | null): string {
  if (!docs) return "PENDING";
  const utility = (docs.utilityStatus || "").trim().toUpperCase();
  if (utility === "REJECTED") return "REJECTED";
  if (utility === "APPROVED") return "APPROVED";
  if (utility === "IN_REVIEW") return "IN_REVIEW";
  return "PENDING";
}

/**
 * Checks whether both ID image and live face image/selfie have been uploaded.
 */
export function hasLevel2Uploads(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  const hasIdUpload = Boolean(docs?.idImageUrl || user?.idImageUrl);
  const hasFaceUpload = Boolean(
    docs?.faceImageUrl ||
    docs?.selfieUrl ||
    user?.faceImageUrl ||
    user?.imageUrl ||
    docs?.faceVerified
  );
  return hasIdUpload && hasFaceUpload;
}

/**
 * Evaluates whether Level 2 is rejected.
 */
export function isLevel2Rejected(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  const idStatus = idDocStatus(docs);
  const faceStatus = faceDocStatus(docs);
  const docsKycStatus = (docs?.kycStatus || docs?.status || "").toUpperCase();
  const userKycStatus = (user?.kycStatus || "").toUpperCase();

  return (
    idStatus === "REJECTED" ||
    faceStatus === "REJECTED" ||
    docsKycStatus === "REJECTED" ||
    userKycStatus === "REJECTED"
  );
}

/**
 * Evaluates whether Level 2 is fully verified.
 */
export function isLevel2Verified(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  if (isLevel2Rejected(docs, user)) return false;

  const idApproved = idDocStatus(docs) === "APPROVED";
  const faceApproved = faceDocStatus(docs) === "APPROVED";
  if (idApproved && faceApproved) return true;

  const docsKycStatus = (docs?.kycStatus || docs?.status || "").toUpperCase();
  const docsLevel = docs?.currentLevel ?? docs?.kycLevel ?? 1;
  if ((docsKycStatus === "VERIFIED" || docsKycStatus === "APPROVED") && docsLevel >= 2) {
    return true;
  }

  const userKycStatus = (user?.kycStatus || "").toUpperCase();
  const userLevel = user?.kycLevel ?? 1;
  if ((userKycStatus === "VERIFIED" || userKycStatus === "APPROVED" || user?.kycVerified || user?.isVerified) && userLevel >= 2) {
    return true;
  }

  return false;
}

/**
 * Evaluates whether Level 2 is submitted and currently under review.
 */
export function isLevel2Pending(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  if (isLevel2Verified(docs, user)) return false;
  if (isLevel2Rejected(docs, user)) return false;
  if (!hasLevel2Uploads(docs, user)) return false;

  const docsKycStatus = (docs?.kycStatus || docs?.status || "").toUpperCase();
  const userKycStatus = (user?.kycStatus || "").toUpperCase();
  const idStatus = idDocStatus(docs);
  const faceStatus = faceDocStatus(docs);

  return (
    docsKycStatus === "PENDING" ||
    userKycStatus === "PENDING" ||
    idStatus === "PENDING" ||
    faceStatus === "PENDING"
  );
}

/**
 * Checks whether an address document has been uploaded for Level 3.
 */
export function hasLevel3AddressDoc(docs?: KycDocsLike | null): boolean {
  return Boolean(
    docs?.addressDocUrl ||
    docs?.proofOfAddressUrl ||
    docs?.utilityBillUrl
  );
}

/**
 * Evaluates whether Level 3 is fully verified.
 */
export function isLevel3Verified(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  if (!isLevel2Verified(docs, user)) return false;

  const utility = utilityDocStatus(docs);
  if (utility === "REJECTED") return false;

  const currentLevel = docs?.currentLevel ?? docs?.kycLevel ?? user?.kycLevel ?? 1;
  return currentLevel >= 3 || utility === "APPROVED";
}

/**
 * Evaluates whether Level 3 is rejected.
 */
export function isLevel3Rejected(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  if (!isLevel2Verified(docs, user)) return false;
  if (isLevel3Verified(docs, user)) return false;
  if (!hasLevel3AddressDoc(docs)) return false;

  return utilityDocStatus(docs) === "REJECTED";
}

/**
 * Evaluates whether Level 3 is submitted and currently under review.
 */
export function isLevel3Pending(
  docs?: KycDocsLike | null,
  user?: AuthUserLike | null
): boolean {
  if (!isLevel2Verified(docs, user)) return false;
  if (isLevel3Verified(docs, user)) return false;
  if (isLevel3Rejected(docs, user)) return false;
  if (!hasLevel3AddressDoc(docs)) return false;

  const utility = utilityDocStatus(docs);
  return utility === "PENDING" || utility === "IN_REVIEW";
}
