import Header from "@/src/components/common/Header";
import { useListGroupsQuery } from "@/src/store/api/groupApi";
import { isGroupCompleted, isGroupDateEnded, isGroupTerminated } from "@/app/(tabs)/portfolios/wealth-group";
import { WealthGroupModel } from "@/src/types/group";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME = "#155D5F";

const CATEGORIES = ["All", "Business", "Real Estate", "Tech", "Savings", "Rotational"];

const GroupCoverThumbnail = ({ uri, name }: { uri?: string; name?: string }) => {
  const [hasError, setHasError] = useState(false);
  const sanitized = uri?.startsWith("http://") ? uri.replace("http://", "https://") : uri;

  if (!sanitized || hasError) {
    return <Users size={28} color={THEME} />;
  }

  return (
    <Image
      source={{ uri: sanitized }}
      onError={() => {
        setHasError(true);
      }}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    />
  );
};

export default function GroupDiscoveryScreen() {
  const router = useRouter();
  const { type = "trending" } = useLocalSearchParams<{ type?: string }>();
  const isTrending = type === "trending";

  const { data: groupsData, isLoading, refetch } = useListGroupsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );



  const rawGroups: WealthGroupModel[] = Array.isArray(groupsData?.items)
    ? groupsData.items
    : Array.isArray((groupsData as any)?.data?.items)
    ? (groupsData as any).data.items
    : Array.isArray((groupsData as any)?.data)
    ? (groupsData as any).data
    : Array.isArray(groupsData)
    ? (groupsData as any)
    : [];

  const uniqueGroupsMap = new Map<string, WealthGroupModel>();
  rawGroups.forEach((g: any) => {
    if (!g) return;
    const id = String(
      g.id ||
        g._id ||
        g.groupId ||
        g.group_id ||
        (g.name ? `${g.name}_${g.createdAt || ""}` : "")
    ).trim();
    if (id) {
      uniqueGroupsMap.set(id, { ...g, id: String(g.id || g._id || id) });
    }
  });
  const allGroups = Array.from(uniqueGroupsMap.values());

  // Filter out completed, terminated, AND date-ended groups — same logic as wealth-group.tsx
  const activeGroups = allGroups.filter(
    (g) => !isGroupCompleted(g) && !isGroupTerminated(g) && !isGroupDateEnded(g)
  );

  const filteredGroups = activeGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      (g.category && g.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const displayGroups = isTrending
    ? [...filteredGroups].sort((a, b) => Number(b.membersCount || 0) - Number(a.membersCount || 0))
    : filteredGroups;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={isTrending ? "Trending Groups" : "Recommended Groups"}
        onBack={() => router.back()}
      />

      <View className="flex-1 px-5 pt-2">
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            paddingHorizontal: 14,
            height: 48,
            marginBottom: 16,
          }}
        >
          <Search size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search tribes by name or category..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, marginLeft: 10, fontSize: 14, color: "#1A1A1A" }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 40, marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === cat ? THEME : "#F1F5F9",
              }}
            >
              <Text
                maxFontSizeMultiplier={1.35}
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  fontFamily: "KumbhSans_700Bold",
                  color: selectedCategory === cat ? "white" : "#4B5563",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Group Feed */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={THEME} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {displayGroups.length > 0 ? (
              displayGroups.map((group) => {
                const targetFormatted = (parseFloat(group.targetAmount?.toString() || "0") / 100).toLocaleString();
                const currentFormatted = ((typeof group.currentBalance === "string" ? parseFloat(group.currentBalance) : (group.currentBalance || 0)) / 100).toLocaleString();

                return (
                  <TouchableOpacity
                    key={group.id}
                    onPress={() =>
                      router.push({
                        pathname: "/portfolio/detail/group/[id]",
                        params: { id: group.id },
                      })
                    }
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: "#F1F5F9",
                      padding: 14,
                      marginBottom: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 14,
                          overflow: "hidden",
                          marginRight: 14,
                          backgroundColor: "#F0FDF4",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <GroupCoverThumbnail uri={group.coverImage} name={group.name} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.35}
                            style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A", flex: 1, marginRight: 8 }}
                          >
                            {group.name}
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            {Boolean(group.isVetted) && (
                              <View
                                style={{
                                  backgroundColor: "#F0FDF4",
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 6,
                                  borderWidth: 1,
                                  borderColor: "#BBF7D0",
                                }}
                              >
                                <Text
                                  maxFontSizeMultiplier={1.35}
                                  style={{ fontSize: 12, fontWeight: "700", fontFamily: "KumbhSans_700Bold", color: "#166534" }}
                                >
                                  🛡️ Vetted
                                </Text>
                              </View>
                            )}
                            <View
                              style={{
                                backgroundColor: "#E6F7F7",
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                maxFontSizeMultiplier={1.35}
                                style={{ fontSize: 12, fontWeight: "700", fontFamily: "KumbhSans_700Bold", color: THEME }}
                              >
                                {(group.groupType || (group as any).type || "FIXED").toString().includes("FLEX")
                                  ? "Flex"
                                  : (group.groupType || (group as any).type || "FIXED").toString().includes("ROTATIONAL")
                                  ? "Rotational"
                                  : "Fixed"}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: "#F1F5F9",
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                maxFontSizeMultiplier={1.35}
                                style={{ fontSize: 12, fontWeight: "700", fontFamily: "KumbhSans_700Bold", color: "#4B5563" }}
                              >
                                {group.category || "Tribe"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Text
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.35}
                          style={{ fontSize: 13, lineHeight: 18, color: "#4B5563", fontFamily: "KumbhSans_600SemiBold", fontWeight: "600", marginTop: 2 }}
                        >
                          {group.description || "Collective growth tribe"}
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <Text
                            maxFontSizeMultiplier={1.35}
                            style={{ fontSize: 12, fontWeight: "700", fontFamily: "KumbhSans_700Bold", color: THEME }}
                          >
                            Target: ₦{targetFormatted}
                          </Text>
                          <Text
                            maxFontSizeMultiplier={1.35}
                            style={{ fontSize: 12, color: "#4B5563", fontFamily: "KumbhSans_600SemiBold", fontWeight: "600" }}
                          >
                            {group.membersCount || 1} / {group.membersLimit || 10} members
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
                <Users size={48} color="#CBD5E1" />
                <Text
                  maxFontSizeMultiplier={1.35}
                  style={{ fontSize: 16, fontWeight: "700", fontFamily: "KumbhSans_700Bold", color: "#1A1A1A", marginTop: 12 }}
                >
                  No tribes found
                </Text>
                <Text
                  maxFontSizeMultiplier={1.35}
                  style={{ fontSize: 13, lineHeight: 18, color: "#4B5563", fontFamily: "KumbhSans_600SemiBold", fontWeight: "600", textAlign: "center", marginTop: 4, paddingHorizontal: 30 }}
                >
                  Try changing your search keywords or be the first to start a new tribe!
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
