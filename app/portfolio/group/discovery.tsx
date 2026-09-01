import Header from "@/src/components/common/Header";
import { useListGroupsQuery } from "@/src/store/api/groupApi";
import { WealthGroupModel } from "@/src/types/group";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search, Users } from "lucide-react-native";
import { useState } from "react";
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

export default function GroupDiscoveryScreen() {
  const router = useRouter();
  const { type = "trending" } = useLocalSearchParams<{ type?: string }>();
  const isTrending = type === "trending";

  const { data: groupsData, isLoading, refetch } = useListGroupsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const allGroups: WealthGroupModel[] = groupsData?.items || [];

  const filteredGroups = allGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      (g.category && g.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

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
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: selectedCategory === cat ? "white" : "#64748B",
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
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
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
                        {group.coverImage ? (
                          <Image
                            source={{ uri: group.coverImage }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        ) : (
                          <Users size={28} color={THEME} />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text
                            numberOfLines={1}
                            style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A", flex: 1, marginRight: 8 }}
                          >
                            {group.name}
                          </Text>
                          <View
                            style={{
                              backgroundColor: "#F0FDF4",
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: "700", color: THEME }}>
                              {group.category || "Tribe"}
                            </Text>
                          </View>
                        </View>

                        <Text numberOfLines={1} style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                          {group.description || "Collective growth tribe"}
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <Text style={{ fontSize: 12, fontWeight: "700", color: THEME }}>
                            Target: ₦{targetFormatted}
                          </Text>
                          <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
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
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#64748B", marginTop: 12 }}>
                  No tribes found
                </Text>
                <Text style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 4, paddingHorizontal: 30 }}>
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
