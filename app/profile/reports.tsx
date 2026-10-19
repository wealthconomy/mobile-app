import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import { AppToast, ToastState } from "@/src/components/common/AppToast";
import Header from "@/src/components/common/Header";
import { ThemedButton } from "@/src/components/ThemedButton";
import {
  useGetMyGroupReportsQuery,
  useReportGroupMutation,
} from "@/src/store/api/groupApi";
import { useListNotificationsQuery } from "@/src/store/api/notificationApi";
import { UserGroupReportItem } from "@/src/types/group";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserFiledReportsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    groupId?: string;
    groupName?: string;
  }>();
  const [filterGroupId, setFilterGroupId] = useState<string | undefined>(
    params.groupId,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // New report form state
  const [reportReason, setReportReason] = useState("");
  const [showReportForm, setShowReportForm] = useState(Boolean(params.groupId));

  // RTK Query hooks
  const {
    data: reportsData,
    isLoading,
    refetch: refetchReports,
  } = useGetMyGroupReportsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [reportGroup, { isLoading: isSubmittingReport }] =
    useReportGroupMutation();

  const { data: notificationsData, refetch: refetchNotifications } =
    useListNotificationsQuery(
      { limit: 20 },
      { refetchOnMountOrArgChange: true },
    );

  const allReports: UserGroupReportItem[] = useMemo(() => {
    return reportsData?.items || [];
  }, [reportsData]);

  // Filtered reports if groupId is provided
  const reports = useMemo(() => {
    if (!filterGroupId) return allReports;
    return allReports.filter(
      (r) => r.groupId === filterGroupId || r.group?.id === filterGroupId,
    );
  }, [allReports, filterGroupId]);

  const targetGroupName =
    params.groupName ||
    reports.find((r) => r.group?.name)?.group?.name ||
    "Tribe";

  // Existing report for current group filter if any
  const existingGroupReport = useMemo(() => {
    if (!filterGroupId) return null;
    return allReports.find(
      (r) => r.groupId === filterGroupId || r.group?.id === filterGroupId,
    );
  }, [allReports, filterGroupId]);

  // Pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([refetchReports(), refetchNotifications()]);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetchReports();
      refetchNotifications();
    }, [refetchReports, refetchNotifications]),
  );

  // Sync route param changes
  useEffect(() => {
    if (params.groupId) {
      setFilterGroupId(params.groupId);
      setShowReportForm(true);
    }
  }, [params.groupId]);

  // Listen for wealth_group.report_status_updated push notifications
  useEffect(() => {
    const items =
      notificationsData?.data?.items || (notificationsData as any)?.items || [];
    const reportUpdateNotif = items.find((n: any) => {
      const type = (
        n?.kind ||
        n?.data?.type ||
        n?.data?.event ||
        ""
      ).toLowerCase();
      return (
        type.includes("wealth_group.report_status_updated") ||
        type.includes("report_status_updated")
      );
    });

    if (reportUpdateNotif && !reportUpdateNotif.isRead) {
      refetchReports();
    }
  }, [notificationsData, refetchReports]);

  // Submit new group report
  const handleSubmitReport = async () => {
    const targetId = filterGroupId || params.groupId;
    console.log("🚨 [Group Report] Submit initiated for groupId:", targetId, "reason:", reportReason);

    if (!targetId) {
      console.warn("⚠️ [Group Report] Missing targetId (groupId)");
      setToast({
        type: "warning",
        title: "Group Context Missing",
        message: "Unable to determine which group to report.",
      });
      return;
    }
    if (!reportReason.trim()) {
      console.warn("⚠️ [Group Report] Reason empty");
      setToast({
        type: "warning",
        title: "Reason Required",
        message: "Please describe the compliance violation reason.",
      });
      return;
    }

    try {
      console.log(`📡 [Group Report] POST /groups/${targetId}/report payload:`, { reason: reportReason.trim() });
      const result = await reportGroup({
        id: targetId,
        reason: reportReason.trim(),
      }).unwrap();

      console.log("✅ [Group Report] Success response:", result);

      setToast({
        type: "success",
        title: "Report Submitted",
        message:
          "Your report has been received by our compliance team for review.",
      });
      setReportReason("");
      setShowReportForm(false);
      refetchReports();
    } catch (err: any) {
      console.error(`❌ [Group Report] POST /groups/${targetId}/report FAILED:`, {
        status: err?.status,
        data: err?.data,
        message: err?.message,
        errorRaw: JSON.stringify(err),
      });

      setToast({
        type: "error",
        title: "Report Failed",
        message:
          err?.data?.message ||
          err?.message ||
          "Failed to submit report. Please try again.",
      });
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: UserGroupReportItem["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={13}
              color="#EA580C"
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: "#C2410C" }]}>
              Pending Review
            </Text>
          </View>
        );

      case "INVESTIGATING":
        return (
          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={13}
              color="#2563EB"
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: "#1D4ED8" }]}>
              Under Investigation
            </Text>
          </View>
        );

      case "RESOLVED":
        return (
          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={13}
              color="#16A34A"
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: "#15803D" }]}>
              Resolved
            </Text>
          </View>
        );

      case "DISMISSED":
      default:
        return (
          <View
            style={[
              styles.badgeContainer,
              { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
            ]}
          >
            <Ionicons
              name="close-circle-outline"
              size={13}
              color="#6B7280"
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: "#4B5563" }]}>
              Dismissed
            </Text>
          </View>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={
          filterGroupId ? "Group Report & Status" : "Group Reports & Feedback"
        }
        onBack={() => router.back()}
      />

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#155D5F"]}
              tintColor="#155D5F"
            />
          }
        >
          {/* Active Group Filter Header */}
          {filterGroupId && (
            <View style={styles.filterBar}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Ionicons
                  name="funnel-outline"
                  size={16}
                  color="#155D5F"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.filterBarText} numberOfLines={1}>
                  Report for:{" "}
                  <Text style={{ fontWeight: "800" }}>{targetGroupName}</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.showAllPill}
                onPress={() => setFilterGroupId(undefined)}
              >
                <Text style={styles.showAllPillText}>Show All Reports</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form to submit a report (When in group context) */}

          {filterGroupId && (
            <View style={[styles.historyNoticeBanner, { marginTop: 12 }]}>
              <Ionicons
                name="information-circle"
                size={18}
                color="#155D5F"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.historyNoticeText}>
                Tip: You can also view all your reported groups anytime under{" "}
                <Text style={{ fontWeight: "700", color: "#155D5F" }}>
                  My Account {" > "} Submitted Group Reports
                </Text>
                .
              </Text>
            </View>
          )}

          {filterGroupId && (
            <View style={styles.reportFormCard}>
              <View style={styles.reportFormHeader}>
                <Ionicons
                  name="warning-outline"
                  size={22}
                  color="#D97706"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.reportFormTitle}>
                  File a Violation Report
                </Text>
              </View>
              <Text style={styles.reportFormSubtitle}>
                Report policy violations, fraud, or inappropriate behavior for "
                {targetGroupName}".
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="Describe the issue or violation in detail..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={reportReason}
                onChangeText={setReportReason}
                textAlignVertical="top"
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <ThemedButton
                  title={isSubmittingReport ? "Submitting..." : "Submit Report"}
                  onPress={handleSubmitReport}
                  loading={isSubmittingReport}
                  disabled={isSubmittingReport || !reportReason.trim()}
                  style={{ minWidth: 140, height: 44 }}
                />
              </View>
            </View>
          )}

          {/* Compliance Info Banner (Shown when viewing all reports) */}
          {!filterGroupId && (
            <View style={styles.bannerContainer}>
              <View style={styles.bannerIconWrapper}>
                <Ionicons name="shield-checkmark" size={24} color="#155D5F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  Group Compliance Feedback
                </Text>
                <Text style={styles.bannerSubtitle}>
                  Track status updates and official admin resolution notes on
                  tribe violations you reported.
                </Text>
              </View>
            </View>
          )}

          {/* Section Heading */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {filterGroupId ? "Filed Report Status" : "All Submitted Reports"}
            </Text>
            {reports.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{reports.length}</Text>
              </View>
            )}
          </View>

          {/* Loading State */}
          {isLoading && reports.length === 0 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#155D5F" />
              <Text style={{ marginTop: 12, color: "#64748B", fontSize: 14 }}>
                Fetching group reports...
              </Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && reports.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="flag-outline" size={38} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Reports Found</Text>
              <Text style={styles.emptySubtitle}>
                {filterGroupId
                  ? `You have not submitted a report for "${targetGroupName}" yet. Use the form above to file a report if needed.`
                  : "You haven't filed any violation reports for WealthGroup tribes. If you witness non-compliance, you can report it directly from any group's options menu."}
              </Text>
            </View>
          )}

          {/* Reports List Cards */}
          {reports.map((report) => {
            const groupName =
              report.group?.name || targetGroupName || "WealthGroup Tribe";
            const groupImg = report.group?.coverImage || report.group?.imageUrl;

            return (
              <View key={report.id} style={styles.card}>
                {/* Card Header: Group Info & Status Badge */}
                <View style={styles.cardHeader}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {groupImg ? (
                      <Image
                        source={{ uri: groupImg }}
                        style={styles.groupAvatar}
                      />
                    ) : (
                      <View style={styles.groupAvatarFallback}>
                        <MaterialCommunityIcons
                          name="account-group"
                          size={20}
                          color="#155D5F"
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.groupName} numberOfLines={1}>
                        {groupName}
                      </Text>
                      <Text style={styles.dateText}>
                        Filed on {formatDate(report.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {renderStatusBadge(report.status)}
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Violation Reason */}
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.sectionLabel}>
                    Reported Violation Reason:
                  </Text>
                  <Text style={styles.reasonText}>{report.reason}</Text>
                </View>

                {/* Admin Resolution Note / Feedback */}
                {report.resolutionNote ? (
                  <View style={styles.feedbackBox}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color="#0D9488"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.feedbackHeader}>
                        Admin Resolution Note
                      </Text>
                    </View>
                    <Text style={styles.feedbackContent}>
                      "{report.resolutionNote}"
                    </Text>
                  </View>
                ) : (
                  <View style={styles.pendingFeedbackBox}>
                    <Text style={styles.pendingFeedbackText}>
                      💬 Compliance team is reviewing this report. You will
                      receive a push notification once resolved.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Footer Notice when in Group Context */}
        </ScrollView>
      </KeyboardAvoidingView>

      <AppToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  historyNoticeBanner: {
    backgroundColor: "#E0F2F1",
    borderColor: "#B2DFDB",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  historyNoticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#155D5F",
    marginBottom: 2,
  },
  historyNoticeText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 12,
    color: "#334155",
    lineHeight: 17,
  },
  filterBar: {
    backgroundColor: "white",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterBarText: {
    fontSize: 13,
    color: "#334155",
  },
  showAllPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  showAllPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#155D5F",
  },
  reportFormCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#9aeeffff",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reportFormHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reportFormTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  reportFormSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 100,
  },
  bannerContainer: {
    backgroundColor: "#EEF7F8",
    borderColor: "#D1E7E8",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  bannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#155D5F",
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: "#E0F2F1",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#155D5F",
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    marginRight: 12,
  },
  groupAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  groupName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    fontWeight: "500",
  },
  feedbackBox: {
    backgroundColor: "#F0FDFA",
    borderColor: "#CCFBF1",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  feedbackHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F766E",
  },
  feedbackContent: {
    fontSize: 13,
    color: "#115E59",
    lineHeight: 19,
    fontStyle: "italic",
  },
  pendingFeedbackBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  pendingFeedbackText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
});
