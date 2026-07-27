import { AccountHeader } from "@/src/features/account/components/AccountHeader";
import { AccountMenuSections } from "@/src/features/account/components/AccountMenuItems";
import { LogoutModal } from "@/src/features/account/components/LogoutModal";
import { SavingsSummary } from "@/src/features/account/components/SavingsSummary";
import { RootState } from "@/src/store";
import { useLogoutSessionMutation } from "@/src/store/api/authApi";
import { baseApi } from "@/src/store/api/baseApi";
import { useGetKycStatusQuery } from "@/src/store/api/kycApi";
import { useListNotificationsQuery } from "@/src/store/api/notificationApi";
import {
  useGetDashboardSummaryQuery,
  useGetMyProfileQuery,
} from "@/src/store/api/userApi";
import { logout } from "@/src/store/slices/authSlice";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function MyAccountScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Local state
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auth Redux state for instant cached rendering
  const { user: authUser, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  // RTK Query API Integrations
  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetMyProfileQuery();

  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetDashboardSummaryQuery();

  const {
    data: kycData,
    isLoading: kycLoading,
    refetch: refetchKyc,
  } = useGetKycStatusQuery();

  const { data: notificationsData, refetch: refetchNotifications } =
    useListNotificationsQuery({ limit: 20 });

  const [logoutSession] = useLogoutSessionMutation();

  // Combine store user with live query user
  const activeUser = profileData?.data || authUser;
  const isLoading = profileLoading && !activeUser;

  // Memoized unread notification count
  const unreadCount = useMemo(() => {
    const items =
      notificationsData?.data?.items ||
      (notificationsData as any)?.items ||
      [];
    return items.filter((item: any) => !item.isRead).length;
  }, [notificationsData]);

  // Unified pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchSummary(),
        refetchKyc(),
        refetchNotifications(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProfile, refetchSummary, refetchKyc, refetchNotifications]);

  // Stable callbacks for child components to prevent unnecessary re-renders
  const handleToggleBalance = useCallback(() => {
    setBalanceVisible((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  const handleKycPress = useCallback(() => {
    router.push("/profile/security" as any);
  }, [router]);

  const handleOpenLogoutModal = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleCloseLogoutModal = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      if (refreshToken) {
        await logoutSession({ refreshToken }).unwrap();
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      dispatch(baseApi.util.resetApiState());
      dispatch(logout());
      router.replace("/(auth)/login" as any);
    }
  }, [refreshToken, logoutSession, dispatch, router]);

  // Check if wealth preference hides interest
  const showGrowth = useMemo(() => {
    return !activeUser?.wealthPreference?.toLowerCase().includes("impact");
  }, [activeUser]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1 }}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#155D5F"
          />
        }
      >
        {/* Profile Header Card */}
        <AccountHeader
          user={activeUser}
          kycLevel={kycData?.data?.currentLevel}
          kycStatus={kycData?.data?.status}
          loading={isLoading}
          onPressKyc={handleKycPress}
        />

        {/* Total Savings & Daily Growth Summary */}
        <SavingsSummary
          balanceVisible={balanceVisible}
          onToggleBalance={handleToggleBalance}
          totalSavings={
            (summaryData as any)?.data?.totalSavings ?? activeUser?.totalSavings
          }
          dailyGrowth={
            (summaryData as any)?.data?.totalInterest ?? activeUser?.totalInterest
          }
          showGrowth={showGrowth}
          loading={summaryLoading && !(summaryData as any)?.data}
        />

        {/* Menu Navigation Sections */}
        <AccountMenuSections
          unreadNotificationsCount={unreadCount}
          onNavigate={handleNavigate}
          onLogoutPress={handleOpenLogoutModal}
        />
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  );
}
