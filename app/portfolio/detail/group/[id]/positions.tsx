import Header from "@/src/components/common/Header";
import { AppToast, ToastState } from "@/src/components/common/AppToast";
import {
  useGetGroupDetailsQuery,
  useGetGroupMembersQuery,
  useSetGroupPositionsMutation,
} from "@/src/store/api/groupApi";
import { GroupMember } from "@/src/types/group";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F";

interface MemberPositionItem {
  memberId: string;
  userId: string;
  name: string;
  avatar?: string;
  role: string;
  position: number;
}

export default function PayoutPositionsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [toast, setToast] = useState<ToastState | null>(null);

  const { data: group } = useGetGroupDetailsQuery(id as string, {
    skip: !id,
  });

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    refetch,
  } = useGetGroupMembersQuery(
    { id: id as string, populate: ["user"] },
    { skip: !id }
  );

  const [setPositions, { isLoading: isSaving }] = useSetGroupPositionsMutation();
  const [items, setItems] = useState<MemberPositionItem[]>([]);

  useEffect(() => {
    if (membersData?.items) {
      const activeMembers = membersData.items.filter(
        (m) =>
          m.status === "ACTIVE" ||
          m.status === "PAID" ||
          m.status === "UNPAID" ||
          m.role === "CREATOR" ||
          m.role === "OWNER"
      );

      const mapped: MemberPositionItem[] = activeMembers.map((m, index) => {
        const u = m.user;
        const name = u
          ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Member"
          : "Member";
        const avatar = u?.imageUrl || u?.avatar || u?.profilePicture;
        const assignedPos = (m as any).position || (m as any).payoutPosition || index + 1;

        return {
          memberId: m.id,
          userId: m.userId,
          name,
          avatar,
          role: m.role,
          position: Number(assignedPos),
        };
      });

      // Sort by assigned position
      mapped.sort((a, b) => a.position - b.position);
      // Re-index cleanly 1..N
      mapped.forEach((item, idx) => {
        item.position = idx + 1;
      });

      setItems(mapped);
    }
  }, [membersData]);

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;

    // Recalculate position numbers 1..N
    newItems.forEach((item, idx) => {
      item.position = idx + 1;
    });

    setItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;

    // Recalculate position numbers 1..N
    newItems.forEach((item, idx) => {
      item.position = idx + 1;
    });

    setItems(newItems);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const payload = {
        positions: items.map((item) => ({
          memberId: item.memberId,
          position: item.position,
        })),
      };

      console.log("🔄 [Payout Positions Request] POST /groups/" + id + "/positions:\n", JSON.stringify(payload, null, 2));
      await setPositions({ id: id as string, body: payload }).unwrap();

      setToast({
        type: "success",
        title: "Positions Saved! 🎉",
        message: "Group payout turn order has been updated successfully.",
      });

      setTimeout(() => {
        refetch();
        router.back();
      }, 1200);
    } catch (err: any) {
      console.error("❌ [Payout Positions Error]:", err);
      setToast({
        type: "error",
        title: "Save Failed",
        message: err?.data?.message || err?.message || "Failed to save payout positions.",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FAFAFA" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <Header title="Payout Positions" onBack={() => router.back()} />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Info Box */}
        <View
          style={{
            backgroundColor: "#F0F9F9",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#B2EBF2",
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Ionicons name="swap-vertical" size={22} color={THEME} />
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A" }}>
              Rotational Payout Sequence
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "#64748B", lineHeight: 18 }}>
            Arrange the payout order (1 to {items.length}) for active members in{" "}
            <Text style={{ fontWeight: "700", color: THEME }}>{group?.name || "Group"}</Text>. In each cycle, the member at position #1 receives the pool payout next.
          </Text>
        </View>

        {isLoadingMembers ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={THEME} />
            <Text style={{ marginTop: 12, color: "#64748B", fontSize: 13 }}>
              Loading group members...
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.memberId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                {/* Position Rank Badge */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: index === 0 ? "#FEF3C7" : index === 1 ? "#E2E8F0" : "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "900",
                      color: index === 0 ? "#B45309" : "#475569",
                    }}
                  >
                    #{item.position}
                  </Text>
                </View>

                {/* Avatar */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: "#E2E8F0",
                    overflow: "hidden",
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.avatar ? (
                    <Image
                      source={{ uri: item.avatar }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={20} color="#64748B" />
                  )}
                </View>

                {/* Name & Role */}
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                    {item.role === "CREATOR" || item.role === "OWNER"
                      ? "Group Admin"
                      : "Active Member"}
                  </Text>
                </View>

                {/* Reorder Buttons */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => moveUp(index)}
                    disabled={index === 0}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: index === 0 ? "#F1F5F9" : "#F0F9F9",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: index === 0 ? 0.4 : 1,
                    }}
                  >
                    <Ionicons name="chevron-up" size={18} color={index === 0 ? "#94A3B8" : THEME} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: index === items.length - 1 ? "#F1F5F9" : "#F0F9F9",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: index === items.length - 1 ? 0.4 : 1,
                    }}
                  >
                    <Ionicons name="chevron-down" size={18} color={index === items.length - 1 ? "#94A3B8" : THEME} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Save Button Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || items.length === 0}
          style={{
            backgroundColor: items.length > 0 && !isSaving ? THEME : "#9CA3AF",
            height: 52,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
              Save Payout Positions
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AppToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
}
