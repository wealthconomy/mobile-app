import Header from "@/src/components/common/Header";
import ThemedButton from "@/src/components/ThemedButton";
import {
  useGetGroupDetailsQuery,
  useUpdateGroupSettingsMutation,
} from "@/src/store/api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check } from "lucide-react-native";
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

const VISIBILITY_OPTIONS = [
  "Public/Open: Visible on the discovery page",
  "Private/Closed: Invite only",
];

export default function GeneralSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: group, isLoading } = useGetGroupDetailsQuery(id as string, {
    skip: !id,
  });
  const [updateSettings, { isLoading: isSaving }] = useUpdateGroupSettingsMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Business");
  const [visibility, setVisibility] = useState(VISIBILITY_OPTIONS[0]);
  const [coverImage, setCoverImage] = useState("");
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setCategory(group.category || "Business");
      setVisibility(
        group.accessType === "PRIVATE" ? VISIBILITY_OPTIONS[1] : VISIBILITY_OPTIONS[0]
      );
      setCoverImage(group.coverImage || "");
    }
  }, [group]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Group name cannot be empty.");
      return;
    }

    try {
      const accessType = visibility.includes("Private") ? "PRIVATE" : "PUBLIC";
      await updateSettings({
        id: id as string,
        body: {
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          accessType,
          coverImage: coverImage || undefined,
        },
      }).unwrap();

      Alert.alert("Settings Saved", "Group details updated successfully.");
      router.back();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to update group settings.";
      Alert.alert("Update Failed", msg);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="General" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#155D5F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="General" onBack={() => router.back()} />

      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-5 py-6">
            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Group Name
              </Text>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl h-14 px-5 text-[#1A1A1A] text-base"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Group Category
              </Text>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl h-14 px-5 text-[#1A1A1A] text-base"
                value={category}
                onChangeText={setCategory}
                placeholder="eg., Rent, Festival, Business, etc."
              />
            </View>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Group Cover Image (Optional)
              </Text>
              {coverImage ? (
                <View className="w-full h-48 rounded-2xl overflow-hidden mb-3">
                  <Image
                    source={{ uri: coverImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ) : null}
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-14 bg-white border border-[#E2E8F0] rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="create-outline" size={20} color="#64748B" />
                <Text className="ml-2 text-[#64748B] font-medium text-base">
                  {coverImage ? "Change picture" : "Upload picture"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Group Description
              </Text>
              <TextInput
                className="bg-[#F3F4F6] rounded-2xl p-5 text-[#1A1A1A] text-base min-h-[100px]"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="mb-8">
              <Text className="text-[14px] font-medium text-[#155D5F] mb-3">
                Visibility
              </Text>
              <TouchableOpacity
                onPress={() => setIsVisibilityOpen(!isVisibilityOpen)}
                activeOpacity={1}
                className="bg-[#F3F4F6] rounded-2xl h-14 px-5 flex-row items-center justify-between"
              >
                <Text className="text-[#1A1A1A] text-base">{visibility}</Text>
                <Ionicons
                  name={isVisibilityOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#1A1A1A"
                />
              </TouchableOpacity>
              {isVisibilityOpen && (
                <View className="bg-white rounded-2xl mt-2 border border-[#F1F5F9] overflow-hidden shadow-sm">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => {
                        setVisibility(opt);
                        setIsVisibilityOpen(false);
                      }}
                      className="px-5 py-4 border-b border-[#F8FAFC] flex-row items-center justify-between"
                    >
                      <Text
                        className={`text-base ${
                          visibility === opt
                            ? "text-[#155D5F] font-bold"
                            : "text-[#64748B]"
                        }`}
                      >
                        {opt}
                      </Text>
                      {visibility === opt && (
                        <Check size={18} color="#155D5F" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-10">
          <ThemedButton
            title={isSaving ? "Saving..." : "Save"}
            onPress={handleSave}
            disabled={isSaving}
            style={{ backgroundColor: "#155D5F", borderRadius: 16, height: 60 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
