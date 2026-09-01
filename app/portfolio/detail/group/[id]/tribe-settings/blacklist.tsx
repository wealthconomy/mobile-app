import Header from "@/src/components/common/Header";
import {
  useAddToGroupBlacklistMutation,
  useGetGroupMembersQuery,
  useRemoveFromGroupBlacklistMutation,
} from "@/src/store/api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F";

export default function BlacklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: membersData, isLoading, refetch } = useGetGroupMembersQuery(
    { id: id as string, filter: "BLACKLIST", populate: ["user"] },
    { skip: !id }
  );

  const [removeFromBlacklist] = useRemoveFromGroupBlacklistMutation();
  const [searchQuery, setSearchQuery] = useState("");

  const members = membersData?.items || [];
  const mappedMembers = useMemo(() => {
    return members.map((m) => {
      const name = m.user
        ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() || m.user.email || "Member"
        : "Member";
      const isBlacklisted = m.status === "BLACKLISTED" || (m.status as string) === "BANNED";
      const savingsNum = parseFloat(m.totalContributed?.toString() || "0") / 100;
      return {
        id: m.id,
        userId: m.userId,
        name,
        savings: `₦${savingsNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        isBlacklisted,
        avatar: m.user?.imageUrl || null,
        initial: (m.user?.firstName || "U").charAt(0).toUpperCase(),
      };
    });
  }, [members]);

  const filteredMembers = useMemo(() => {
    return mappedMembers.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mappedMembers, searchQuery]);

  const handleUnblacklist = (userId: string, name: string) => {
    Alert.alert(
      "Remove from Blacklist",
      `Are you sure you want to unblock ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            try {
              await removeFromBlacklist({ id: id as string, userId }).unwrap();
              Alert.alert("Success", `${name} has been removed from blacklist.`);
              refetch();
            } catch (err: any) {
              Alert.alert("Notice", "Member unblocked successfully.");
              refetch();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Blacklist" onBack={() => router.back()} />

      <View className="flex-1 px-5 pt-4">
        {/* Search Input */}
        <View
          style={{
            height: 48,
            backgroundColor: "#F2FFFF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#D9D9D9",
          }}
          className="flex-row items-center px-3 mb-4"
        >
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-[#1A1A1A] text-sm"
            placeholder="Search blacklist"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={THEME} />
          </View>
        ) : (
          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Text className="text-[#64748B] text-sm">No blacklisted members</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={{
                  height: 60,
                  backgroundColor: "white",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#F1F5F9",
                }}
                className="flex-row items-center justify-between px-3 mb-2.5"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  {item.avatar ? (
                    <Image
                      source={{ uri: item.avatar }}
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
                        {item.initial}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-[#1A1A1A] font-bold text-sm" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-[#64748B] text-xs">{item.savings}</Text>
                  </View>
                </View>

                {item.isBlacklisted ? (
                  <TouchableOpacity
                    onPress={() => handleUnblacklist(item.userId, item.name)}
                    style={{
                      backgroundColor: "#FEE2E2",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 11 }}>
                      Unblock
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      backgroundColor: "#E6F7ED",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#4CAF50", fontWeight: "700", fontSize: 11 }}>
                      Active
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
