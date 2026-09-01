import Header from "@/src/components/common/Header";
import ThemedButton from "@/src/components/ThemedButton";
import {
  useApproveJoinRequestMutation,
  useGetGroupDetailsQuery,
  useGetGroupMembersQuery,
  useListJoinRequestsQuery,
  useRejectJoinRequestMutation,
  useUpdateGroupSettingsMutation,
} from "@/src/store/api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F";

export default function MembershipRolesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group, isLoading } = useGetGroupDetailsQuery(id as string, {
    skip: !id,
  });
  const { data: membersData } = useGetGroupMembersQuery(
    { id: id as string },
    { skip: !id }
  );
  const { data: requestsData, refetch: refetchRequests } = useListJoinRequestsQuery(
    { id: id as string, populate: ["user"] },
    { skip: !id }
  );

  const [updateSettings, { isLoading: isSaving }] = useUpdateGroupSettingsMutation();
  const [approveRequest] = useApproveJoinRequestMutation();
  const [rejectRequest] = useRejectJoinRequestMutation();

  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (group) {
      setLimit(group.membersLimit?.toString() || "10");
    }
  }, [group]);

  const members = membersData?.items || [];
  const joinRequests = requestsData?.items || [];
  const adminsCount = members.filter(
    (m) => m.role === "ADMIN" || (m.role as string) === "OWNER" || (m.role as string) === "CREATOR"
  ).length || 1;

  const handleApprove = async (userId: string, name: string) => {
    try {
      await approveRequest({ id: id as string, userId }).unwrap();
      Alert.alert("Approved", `${name} has been added to the tribe.`);
      refetchRequests();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to approve request.";
      Alert.alert("Notice", msg);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    try {
      await rejectRequest({ id: id as string, userId }).unwrap();
      Alert.alert("Rejected", `Join request for ${name} was rejected.`);
      refetchRequests();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to reject request.";
      Alert.alert("Notice", msg);
    }
  };

  const handleSave = async () => {
    const numericLimit = parseInt(limit.replace(/\D/g, ""));
    if (!numericLimit || numericLimit <= 0 || numericLimit > 200) {
      Alert.alert("Invalid Limit", "Member limit must be between 1 and 200.");
      return;
    }

    try {
      await updateSettings({
        id: id as string,
        body: { membersLimit: numericLimit },
      }).unwrap();

      Alert.alert("Settings Saved", "Membership settings updated.");
      router.back();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update membership settings.";
      Alert.alert("Update Failed", msg);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Membership & Roles" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Membership & Roles" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[14px] font-medium text-[#155D5F]">
                  Members Limit
                </Text>
                <Text className="text-[10px] text-[#64748B]">200 maximum</Text>
              </View>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 text-[#1A1A1A] text-base font-medium"
                value={limit}
                keyboardType="numeric"
                onChangeText={(v) => setLimit(v.replace(/\D/g, ""))}
                placeholder="e.g. 10"
              />
              <Text className="text-[10px] text-[#64748B] mt-2">
                {members.length || group?.activeMembersCount || 1} Active Members
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Role Management
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname:
                      "/portfolio/detail/group/[id]/tribe-settings/members-list",
                    params: { id },
                  })
                }
                activeOpacity={0.85}
                className="bg-[#F3F4F6] rounded-2xl h-16 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">
                  {adminsCount} {adminsCount === 1 ? "Admin" : "Admins"}
                </Text>
                <Ionicons name="people-outline" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Pending Join Requests Section */}
            {joinRequests.length > 0 && (
              <View className="mb-6">
                <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                  Pending Join Requests ({joinRequests.length})
                </Text>
                <View className="bg-white rounded-2xl p-4 border border-[#F1F5F9] shadow-sm">
                  {joinRequests.map((req) => {
                    const reqName = req.user
                      ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email || "Applicant"
                      : "Applicant";
                    const initial = (req.user?.firstName || "A").charAt(0).toUpperCase();

                    return (
                      <View
                        key={req.id}
                        className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <View className="flex-row items-center flex-1 mr-3">
                          {req.user?.imageUrl ? (
                            <Image
                              source={{ uri: req.user.imageUrl }}
                              style={{ width: 36, height: 36, borderRadius: 18 }}
                              className="mr-3"
                            />
                          ) : (
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: "#E6F0F1",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              className="mr-3"
                            >
                              <Text style={{ color: THEME, fontWeight: "bold", fontSize: 13 }}>
                                {initial}
                              </Text>
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className="text-[#1A1A1A] font-bold text-sm" numberOfLines={1}>
                              {reqName}
                            </Text>
                            <Text className="text-[#64748B] text-xs">Wants to join</Text>
                          </View>
                        </View>

                        <View className="flex-row items-center space-x-2">
                          <TouchableOpacity
                            onPress={() => handleReject(req.userId, reqName)}
                            style={{
                              backgroundColor: "#FEE2E2",
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 8,
                              marginRight: 6,
                            }}
                          >
                            <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 11 }}>
                              Reject
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleApprove(req.userId, reqName)}
                            style={{
                              backgroundColor: "#E6F7ED",
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 8,
                            }}
                          >
                            <Text style={{ color: "#4CAF50", fontWeight: "700", fontSize: 11 }}>
                              Approve
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <ThemedButton
              title={isSaving ? "Saving..." : "Save"}
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: "#155D5F",
                borderRadius: 16,
                height: 60,
                marginTop: 10,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
