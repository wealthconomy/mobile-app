import Header from "@/src/components/common/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useDeleteAccountMutation } from "@/src/store/api/userApi";
import { useGetKycDocumentsQuery, useGetKycStatusQuery } from "@/src/store/api/kycApi";
import { logout } from "@/src/store/slices/authSlice";

export default function SecurityScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [showLockedModal, setShowLockedModal] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: kycData } = useGetKycStatusQuery();
  const { data: kycDocsResponse } = useGetKycDocumentsQuery();

  const kycDocsPayload: any = kycDocsResponse?.data;
  const kycDocs: any = kycDocsPayload?.data || kycDocsPayload;

  const currentLevel = kycData?.data?.currentLevel ?? user?.kycLevel ?? 1;
  const kycStatus = kycData?.data?.status ?? user?.kycStatus;

  // Level 2 is verified if currentLevel >= 2 OR if NIN & Face are approved/verified
  const isLevel2Verified =
    currentLevel >= 2 ||
    (kycDocs?.ninStatus === "Approved" && kycDocs?.faceStatus === "Approved") ||
    (kycDocs?.faceVerified && (kycDocs?.ninProviderVerified || Boolean(kycDocs?.idNumber)));

  const isLevel3Verified =
    currentLevel >= 3 ||
    (kycDocs?.utilityStatus === "Approved" && kycDocs?.passportStatus === "Approved");

  const isLevel2Pending = !isLevel2Verified && (kycStatus === "PENDING" || kycStatus === "pending");

  const isLevel3Rejected =
    isLevel2Verified &&
    (kycDocs?.passportStatus === "Rejected" ||
      kycDocs?.utilityStatus === "Rejected" ||
      kycStatus === "REJECTED" ||
      kycStatus === "rejected");

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      setShowDeleteModal(false);
      dispatch(logout());
      Alert.alert("Account Deleted", "Your account has been permanently deleted.");
      router.replace("/(auth)/login");
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      const msg = err?.data?.message || err?.message || "Failed to delete account. Please try again.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Security Settings" />

      <ScrollView
        className="flex-1 px-5 pt-8"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View
          className="bg-white rounded-[20px] justify-center"
          style={{ width: "100%", alignSelf: "center" }}
        >
          <View className="gap-y-[12px]">
            <MenuItem
              title="Identity Verification (Level 2)"
              subtitle="BVN, Government ID & Face Verification"
              badge={
                isLevel2Verified
                  ? { text: "Verified", bg: "#DCFCE7", color: "#166534" }
                  : isLevel2Pending
                  ? { text: "In Review", bg: "#FEF9C3", color: "#854D0E" }
                  : { text: "Required", bg: "#FEF3C7", color: "#92400E" }
              }
              icon={
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={24}
                  color="#155D5F"
                />
              }
              onPress={() => router.push("/kyc/level2-intro")}
            />
            <MenuItem
              title="Address Verification (Level 3)"
              subtitle={
                isLevel3Rejected
                  ? "Document rejected - tap to review & re-upload"
                  : "Proof of residency & international passport"
              }
              badge={
                isLevel3Verified
                  ? { text: "Verified", bg: "#DCFCE7", color: "#166534" }
                  : isLevel3Rejected
                  ? { text: "Action Required", bg: "#FEF2F2", color: "#DC2626" }
                  : isLevel2Verified
                  ? { text: "Upgrade", bg: "#E0F2FE", color: "#0369A1" }
                  : { text: "Locked", bg: "#F1F5F9", color: "#64748B" }
              }
              icon={
                <Ionicons
                  name={isLevel2Verified ? "location-outline" : "lock-closed-outline"}
                  size={24}
                  color={isLevel3Rejected ? "#DC2626" : isLevel2Verified ? "#155D5F" : "#94A3B8"}
                />
              }
              isLocked={!isLevel2Verified}
              onPress={() => {
                if (!isLevel2Verified) {
                  setShowLockedModal(true);
                  return;
                }
                router.push("/kyc/level3-intro");
              }}
            />
            <MenuItem
              title="Change Password"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  color="#155D5F"
                />
              }
              onPress={() => router.push("/profile/security/change-password")}
            />
            <MenuItem
              title="Transaction PIN"
              icon={
                <Ionicons name="keypad-outline" size={24} color="#155D5F" />
              }
              onPress={() => router.push("/profile/security/change-pin")}
            />
            <MenuItem
              title="Enable Face ID"
              icon={
                <MaterialCommunityIcons
                  name="face-recognition"
                  size={24}
                  color="#155D5F"
                />
              }
              onPress={() => router.push("/profile/security/enable-face-id")}
            />
            <MenuItem
              title="Delete your Account"
              titleColor="#CA1212"
              icon={
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="#CA1212"
                />
              }
              onPress={() => setShowDeleteModal(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Level 3 Locked Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLockedModal}
        onRequestClose={() => setShowLockedModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-[24px] p-6 w-full max-w-[340px] items-center">
            <View className="w-16 h-16 bg-[#F2FFFF] rounded-full justify-center items-center mb-4 border border-[#CCFBF1]">
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={34}
                color="#155D5F"
              />
            </View>
            <Text className="text-[20px] font-bold text-[#1E293B] text-center mb-2">
              Level 2 Required
            </Text>
            <Text className="text-[14px] text-[#64748B] text-center mb-6 leading-5">
              {isLevel2Pending
                ? "Your Level 2 Identity Verification is currently under review by compliance. Once verified, Address Verification (Level 3) will be unlocked automatically."
                : "Address Verification (Level 3) is currently locked. You must complete and get verified for Level 2 Identity Verification before you can submit proof of address."}
            </Text>

            <View className="w-full gap-y-3">
              <TouchableOpacity
                onPress={() => {
                  setShowLockedModal(false);
                  router.push("/kyc/level2-intro");
                }}
                activeOpacity={0.8}
                className="bg-[#155D5F] py-4 rounded-xl items-center w-full"
              >
                <Text className="text-white font-bold text-[16px]">
                  {isLevel2Pending ? "View Level 2 Status" : "Go to Level 2 Verification"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowLockedModal(false)}
                activeOpacity={0.7}
                className="bg-[#F1F5F9] py-4 rounded-xl items-center w-full"
              >
                <Text className="text-[#475569] font-semibold text-[16px]">
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <BlurView experimentalBlurMethod="dimezisBlurView" intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowDeleteModal(false)}
          />
          <View className="bg-white rounded-[24px] p-6 w-full max-w-[340px] items-center">
            <View className="w-16 h-16 bg-red-50 rounded-full justify-center items-center mb-4">
              <MaterialCommunityIcons
                name="alert-outline"
                size={32}
                color="#CA1212"
              />
            </View>
            <Text className="text-[20px] font-bold text-[#323232] text-center mb-2">
              Delete Account
            </Text>
            <Text className="text-[15px] text-[#666] text-center mb-8 leading-5">
              Are you sure you want to delete your account? This action is
              irreversible and all your data will be permanently removed.
            </Text>

            <View className="w-full gap-y-3">
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                activeOpacity={0.8}
                className={`py-4 rounded-xl items-center w-full ${isDeleting ? "bg-[#CA1212]/60" : "bg-[#CA1212]"}`}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-[16px]">
                    Yes, Delete Account
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.7}
                className="bg-[#F3F4F6] py-4 rounded-xl items-center w-full"
              >
                <Text className="text-[#323232] font-semibold text-[16px]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const MenuItem = ({ title, subtitle, icon, onPress, titleColor, badge, isLocked }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center justify-between bg-[#F8F8F8] px-4 rounded-[14px]"
    style={{ minHeight: 60, paddingVertical: 12, opacity: isLocked ? 0.85 : 1 }}
  >
    <View className="flex-row items-center flex-1 mr-2">
      <View className="mr-3">{icon}</View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text
            className="text-[15px] font-bold"
            style={{ color: titleColor || (isLocked ? "#475569" : "#323232") }}
          >
            {title}
          </Text>
          {badge && (
            <View
              style={{
                backgroundColor: badge.bg,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: badge.color,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {badge.text}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text className="text-[12px] text-[#6B7280] font-medium mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <Ionicons name={isLocked ? "lock-closed" : "chevron-forward"} size={18} color={isLocked ? "#94A3B8" : "#9CA3AF"} />
  </TouchableOpacity>
);

