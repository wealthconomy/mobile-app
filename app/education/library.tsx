import { useGetLibraryMaterialsQuery } from "@/src/store/api/libraryApi";
import Header from "@/src/components/common/Header";
import { LibraryItem } from "@/src/features/library/components/LibraryItem";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
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

  const { data: response, isLoading } = useGetLibraryMaterialsQuery({ publishToApp: true });
  
  if (response) {
    console.log("=== ALL LIBRARY API RESPONSE ===");
    console.log(JSON.stringify(response, null, 2));
  }

  const materials = response?.data || [];

  const filteredMaterials =
    materials?.filter((material) =>
      material.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleReadInApp = async (url: string) => {
    try {
      // This opens an in-app browser overlay (SFSafariViewController/Chrome Custom Tabs)
      // so the user never actually leaves the app, preventing them from easily sharing the raw URL.
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening in-app browser", error);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      // This pushes them to their native device browser (Safari/Chrome) to handle the actual file download
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open this URL: " + url);
      }
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <Header title="Library Materials" />

      <View className="px-5 py-4">
        <Text className="text-[#6B7280] text-sm mb-4">
          Browse and download learning materials
        </Text>

        <View className="flex-row items-center mb-4">
          <View className="flex-row items-center bg-[#F8F8F8] px-4 py-2 rounded-xl flex-1 mr-3">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search materials..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 h-10 text-[#1A1A1A]"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="flex-row bg-[#F8F8F8] p-1 rounded-lg">
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              className="p-1.5 rounded-md"
              style={viewMode === "list" ? { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : undefined}
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
              style={viewMode === "grid" ? { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : undefined}
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
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#155D5F" />
          </View>
        ) : filteredMaterials.length > 0 ? (
          <View
            style={viewMode === "grid" ? { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" } : undefined}
          >
            {filteredMaterials.map((material) => (
              <LibraryItem
                key={material.id}
                material={material}
                viewMode={viewMode}
                onPress={() => router.push(`/education/library/${material.id}` as any)}
                onReadInApp={() => handleReadInApp(material.documentUrl ?? "")}
                onDownload={() => handleDownload(material.documentUrl ?? "")}
                onWatchOnYouTube={() => {
                  if (material.youtubeUrl) Linking.openURL(material.youtubeUrl);
                }}
              />
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="library-outline" size={48} color="#D1D5DB" />
            <Text className="text-[#6B7280] mt-4">No materials found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
