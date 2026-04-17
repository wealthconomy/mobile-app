import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_MEMBERS = [
  {
    id: "1",
    name: "Tolu Olamide",
    savings: "₦4,697.69",
    isBlacklisted: true,
    avatar: "https://i.pravatar.cc/100?u=11",
  },
  {
    id: "2",
    name: "Boluwatife Daniel",
    savings: "₦12,500.00",
    isBlacklisted: true,
    avatar: "https://i.pravatar.cc/100?u=12",
  },
  {
    id: "3",
    name: "Sarah Jenkins",
    savings: "₦8,250.50",
    isBlacklisted: true,
    avatar: "https://i.pravatar.cc/100?u=13",
  },
  {
    id: "4",
    name: "Chinedu Okafor",
    savings: "₦15,000.00",
    isBlacklisted: true,
    avatar: "https://i.pravatar.cc/100?u=14",
  },
  {
    id: "5",
    name: "Adesola Adeyemi",
    savings: "₦4,697.69",
    isBlacklisted: false,
    avatar: "https://i.pravatar.cc/100?u=15",
  },
  {
    id: "6",
    name: "Michael Smith",
    savings: "₦2,100.00",
    isBlacklisted: false,
    avatar: "https://i.pravatar.cc/100?u=16",
  },
  {
    id: "7",
    name: "Fatima Hassan",
    savings: "₦6,000.00",
    isBlacklisted: false,
    avatar: "https://i.pravatar.cc/100?u=17",
  },
  {
    id: "8",
    name: "John Doe",
    savings: "₦9,800.75",
    isBlacklisted: false,
    avatar: "https://i.pravatar.cc/100?u=18",
  },
  {
    id: "9",
    name: "Grace O'Malley",
    savings: "₦3,450.00",
    isBlacklisted: false,
    avatar: "https://i.pravatar.cc/100?u=19",
  },
];

const BlacklistHeader = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (t: string) => void;
}) => (
  <View className="px-5 pt-4 pb-2">
    <View
      style={{
        width: 365,
        height: 49,
        backgroundColor: "#F2FFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#D9D9D9",
      }}
      className="flex-row items-center px-[12px] mb-6 mx-auto"
    >
      <Ionicons name="search-outline" size={20} color="#94A3B8" />
      <TextInput
        className="flex-1 ml-2 text-[#1A1A1A] text-base"
        placeholder="Search member"
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ paddingVertical: 6 }}
      />
    </View>

    <View className="flex-row items-center px-4 mb-4">
      <Text className="flex-1 text-[12px] font-medium text-[#64748B]">
        Names
      </Text>
      <Text className="w-24 text-[12px] font-medium text-[#64748B] text-center">
        Total Savings
      </Text>
      <Text className="w-20 text-[12px] font-medium text-[#64748B] text-right">
        Actions
      </Text>
    </View>
  </View>
);

export default function BlacklistScreen() {
  const { id } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    return MOCK_MEMBERS.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Blacklist"
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 96,
              height: 40,
              borderRadius: 13,
              backgroundColor: "#155D5F",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 21,
              paddingVertical: 9,
              gap: 10,
            }}
          >
            <Text className="text-white font-bold text-[14px]">Save</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filteredMembers}
        ListHeaderComponent={
          <BlacklistHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View className="px-5 mb-2">
            <View
              style={{
                height: 47,
                borderRadius: 15,
                backgroundColor: "#F6F6F6",
              }}
              className="flex-row items-center px-[10px] gap-3"
            >
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: item.avatar }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#E2E8F0",
                  }}
                  className="mr-2"
                />
                <Text
                  className="text-[#1A1A1A] font-medium text-[13px] flex-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              <View className="w-24 flex-row items-center justify-center">
                <Text className="text-[#155D5F] font-bold text-[11px]">
                  {item.savings}
                </Text>
                <Text className="text-[14px] ml-1">⬆️</Text>
              </View>

              <View className="w-20 items-end">
                <TouchableOpacity
                  className={`px-3 py-1.5 rounded-lg ${
                    item.isBlacklisted ? "bg-[#FF4D4D]" : "bg-[#155D5F]"
                  }`}
                >
                  <Text className="text-white font-bold text-[10px]">
                    {item.isBlacklisted ? "Remove" : "Request"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
