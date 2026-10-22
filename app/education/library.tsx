import Header from "@/src/components/common/Header";
import { AppRefreshIndicator } from "@/src/components/common/AppRefreshIndicator";
import { LibraryItem } from "@/src/features/library/components/LibraryItem";
import {
  useGetLibraryMaterialsQuery,
  useRecordDownloadMutation,
} from "@/src/store/api/libraryApi";
import {
  downloadAndShareDocument,
  openDocumentInApp,
  openDownloadedDocument,
} from "@/src/utils/documentFile";
import { useDownloadedMaterials } from "@/src/hooks/useDownloadedMaterials";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [refreshing, setRefreshing] = useState(false);

  const { data: response, isLoading, refetch } = useGetLibraryMaterialsQuery({
    publishToApp: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const materials = response?.data?.items || [];

  const filteredMaterials =
    materials?.filter((material) =>
      material.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const [recordDownload] = useRecordDownloadMutation();
  const { isDownloaded, getDownload, markDownloaded, removeDownload, refresh } =
    useDownloadedMaterials();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleReadInApp = async (material: (typeof filteredMaterials)[number]) => {
    await openDocumentInApp(material);
  };

  const handleDownload = async (material: (typeof filteredMaterials)[number]) => {
    if (!material.isDownloadable) return;

    const existing = getDownload(material.id, material.documentUrl);
    if (existing) {
      const opened = await openDownloadedDocument(existing, material.title);
      if (opened) {
        return;
      }
      await removeDownload(material.id);
    }

    setDownloadingId(material.id);
    try {
      const result = await downloadAndShareDocument(material, {
        onRecordDownload: (idToRecord) => recordDownload(idToRecord),
      });
      if (result) {
        await markDownloaded(material.id, {
          ...result,
          documentUrl: material.documentUrl,
        });
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Header title="Library Materials" />

      <AppRefreshIndicator refreshing={refreshing} topOffset={65} />

      <View className="px-5 py-4">
        <Text className="text-[#4B5563] text-[13px] leading-[18px] font-kumbh-semibold mb-4">
          Browse and download learning materials
        </Text>

        <View className="flex-row items-center mb-4">
          <View className="flex-row items-center bg-[#F8F8F8] px-4 py-2 rounded-xl flex-1 mr-3">
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Search materials..."
              placeholderTextColor="#6B7280"
              className="flex-1 ml-3 h-10 text-[#1A1A1A] font-kumbh"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="flex-row bg-[#F8F8F8] p-1 rounded-lg">
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              className="p-1.5 rounded-md"
              style={
                viewMode === "list"
                  ? {
                      backgroundColor: "#fff",
                      shadowColor: "#000",
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Ionicons
                name="list"
                size={20}
                color={viewMode === "list" ? "#155D5F" : "#9CA3AF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              className="p-1.5 rounded-md"
              style={
                viewMode === "grid"
                  ? {
                      backgroundColor: "#fff",
                      shadowColor: "#000",
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <Ionicons
                name="grid"
                size={20}
                color={viewMode === "grid" ? "#155D5F" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={["#155D5F"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#155D5F" />
          </View>
        ) : filteredMaterials.length > 0 ? (
          <View
            style={
              viewMode === "grid"
                ? {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }
                : undefined
            }
          >
            {filteredMaterials.map((material) => (
              <LibraryItem
                key={material.id}
                material={material}
                viewMode={viewMode}
                isDownloaded={isDownloaded(material.id, material.documentUrl)}
                isDownloading={downloadingId === material.id}
                onPress={() =>
                  router.push(`/education/library/${material.id}` as any)
                }
                onReadInApp={() => handleReadInApp(material)}
                onDownload={() => handleDownload(material)}
                onWatchOnYouTube={() => {
                  if (material.youtubeUrl) Linking.openURL(material.youtubeUrl);
                }}
              />
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="library-outline" size={48} color="#9CA3AF" />
            <Text className="text-[#4B5563] text-[13px] leading-[18px] font-kumbh-semibold mt-4">
              No materials found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
