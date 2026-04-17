import Header from "@/src/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
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
    status: "Overdue",
    isAdmin: true,
    avatar: "https://i.pravatar.cc/100?u=1",
  },
  {
    id: "2",
    name: "Boluwatife Daniel",
    savings: "₦12,500.00",
    status: "Overdue",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=2",
  },
  {
    id: "3",
    name: "Sarah Jenkins",
    savings: "₦8,250.50",
    status: "Overdue",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=3",
  },
  {
    id: "4",
    name: "Chinedu Okafor",
    savings: "₦15,000.00",
    status: "Pending",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=4",
  },
  {
    id: "5",
    name: "Adesola Adeyemi",
    savings: "₦4,697.69",
    status: "Pending",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=5",
  },
  {
    id: "6",
    name: "Michael Smith",
    savings: "₦2,100.00",
    status: "Paid",
    isAdmin: true,
    avatar: "https://i.pravatar.cc/100?u=6",
  },
  {
    id: "7",
    name: "Fatima Hassan",
    savings: "₦6,000.00",
    status: "Paid",
    isAdmin: true,
    avatar: "https://i.pravatar.cc/100?u=7",
  },
  {
    id: "8",
    name: "John Doe",
    savings: "₦9,800.75",
    status: "Paid",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=8",
  },
  {
    id: "9",
    name: "Grace O'Malley",
    savings: "₦3,450.00",
    status: "Paid",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=9",
  },
  {
    id: "10",
    name: "Kemi Adeyemo",
    savings: "₦5,200.00",
    status: "Paid",
    isAdmin: false,
    avatar: "https://i.pravatar.cc/100?u=10",
  },
];

const FILTER_OPTIONS = [
  "All",
  "Paid",
  "Pending",
  "Overdue",
  "Inactive",
  "Past Member",
  "Blacklist",
];

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "#F3F4F6";
  let textColor = "#64748B";

  switch (status) {
    case "Paid":
      bgColor = "#E6F7ED";
      textColor = "#4CAF50";
      break;
    case "Pending":
      bgColor = "#FEF9C3";
      textColor = "#EAB308";
      break;
    case "Overdue":
      bgColor = "#FEE2E2";
      textColor = "#EF4444";
      break;
  }

  return (
    <View
      style={{
        backgroundColor: bgColor,
        width: 68,
        height: 25,
        borderRadius: 5,
        paddingHorizontal: 7,
      }}
      className="items-center justify-center"
    >
      <Text style={{ color: textColor }} className="text-[11px] font-bold">
        {status}
      </Text>
    </View>
  );
};

const StatItem = ({
  label,
  value,
  color = "#155D5F",
  isTrend = false,
  trendType = "up",
}: {
  label: string;
  value: string;
  color?: string;
  isTrend?: boolean;
  trendType?: "up" | "down";
}) => (
  <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
    <Text className="text-[#64748B] text-[13px] font-medium">{label}</Text>
    <View className="flex-row items-center">
      {isTrend && (
        <Text
          style={{ color: trendType === "up" ? "#4CAF50" : "#EF4444" }}
          className="mr-1 text-[14px]"
        >
          {trendType === "up" ? "↑" : "↓"}
        </Text>
      )}
      <Text
        style={{
          color: isTrend ? (trendType === "up" ? "#4CAF50" : "#EF4444") : color,
        }}
        className="text-[14px] font-bold"
      >
        {value}
      </Text>
    </View>
  </View>
);

const UserDetailModal = ({
  visible,
  onClose,
  user,
}: {
  visible: boolean;
  onClose: () => void;
  user: any;
}) => {
  if (!user) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{ maxHeight: "92%" }}
          className="bg-white rounded-t-[40px] overflow-hidden"
        >
          {/* Handle bar */}
          <View className="items-center py-4">
            <View className="w-16 h-1.5 bg-gray-300 rounded-full" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-4"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Profile Section */}
            <View className="flex-row items-start mt-2 px-2">
              <View
                style={{ width: 87, height: 87 }}
                className="rounded-full overflow-hidden border-2 border-[#F0F9F9]"
              >
                <Image
                  source={{ uri: user.avatar }}
                  style={{ width: 87, height: 87 }}
                  className="bg-[#E2E8F0]"
                />
              </View>

              <View className="ml-5 flex-1" style={{ height: 84 }}>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-[24px] font-bold text-[#1A1A1A]">
                      {user.name}
                    </Text>
                    <Text className="text-[#64748B] text-[13px] mt-0.5">
                      Total Saving
                    </Text>
                    <Text className="text-[#155D5F] text-[26px] font-bold mt-0.5">
                      {user.savings || "₦4,723,697.69"}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <StatusBadge status={user.status} />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mt-8 px-1">
              <TouchableOpacity
                style={{ width: 158, height: 50, backgroundColor: "#D7F5DE" }}
                className="flex-row items-center justify-center rounded-[15px] space-x-2"
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#4CAF50"
                />
                <Text className="text-[#4CAF50] font-bold text-[14px]">
                  Send Reminder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/support/chat");
                }}
                style={{ width: 90, height: 50, backgroundColor: "#F6F6F6" }}
                className="flex-row items-center justify-center rounded-[15px] space-x-1"
              >
                <Ionicons name="at-outline" size={20} color="#64748B" />
                <Text className="text-[#64748B] font-bold text-[14px]">
                  Tag
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ width: 96, height: 50, backgroundColor: "#F6F6F6" }}
                className="flex-row items-center justify-center rounded-[15px] space-x-1"
              >
                <Ionicons name="ban-outline" size={20} color="#EF4444" />
                <Text className="text-[#EF4444] font-bold text-[14px]">
                  Block
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View className="mt-8 px-2">
              <StatItem
                label="Wealth Growth"
                value="₦4,697.69"
                isTrend
                trendType="up"
              />
              <StatItem
                label="Growth/week"
                value="₦632,02"
                isTrend
                trendType="down"
              />
              <StatItem label="Weeks" value="45/254" />
              <StatItem label="Status" value="Active" color="#155D5F" />
              <StatItem label="Date of Birth" value="2/3/2011" />
              <StatItem label="Date Joined" value="2/3/2011" />
              <StatItem label="Date left" value="-/-/-" />
            </View>

            {/* Bottom Summary Action Buttons */}
            <View className="mt-6">
              <TouchableOpacity
                style={{ height: 50, backgroundColor: "#F44336" }}
                className="w-full rounded-[15px] items-center justify-center mb-3"
              >
                <Text className="text-white font-bold text-base">
                  Remove Member
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ height: 50, backgroundColor: "#747474" }}
                className="w-full rounded-[15px] items-center justify-center"
              >
                <Text className="text-white font-bold text-base">
                  Add to blacklist
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const MoreOptionsModal = ({
  visible,
  onClose,
  id,
}: {
  visible: boolean;
  onClose: () => void;
  id: string | string[];
}) => {
  const options = [
    { label: "Group Info", icon: "information-circle-outline" },
    { label: "Send Reminder", icon: "notifications-outline" },
    { label: "Role Management", icon: "people-outline" },
    { label: "Remove member", icon: "trash-outline", isDestructive: true },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/20"
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{ elevation: 10 }}
          className="absolute top-16 right-5 w-56 bg-white rounded-2xl shadow-xl overflow-hidden p-2"
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onClose();
                // Handle different options here if needed in the future
                if (option.label === "Role Management") {
                  router.push(
                    `/portfolio/detail/group/${id}/tribe-settings/membership` as any,
                  );
                }
              }}
              className="flex-row items-center p-3 rounded-xl active:bg-gray-100"
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={option.isDestructive ? "#EF4444" : "#1A1A1A"}
              />
              <Text
                className={`ml-3 text-[14px] ${
                  option.isDestructive ? "text-[#EF4444]" : "text-[#1A1A1A]"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function TribeMembersScreen() {
  const { id } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailVisible, setIsUserDetailVisible] = useState(false);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join our Wealth Group on Wealthconomy! Group ID: ${id}`,
        url: "https://wealthconomy.com/invite", // Dummy URL
      });
    } catch (error) {
      console.error(error);
    }
  };

  const filteredMembers = useMemo(() => {
    return MOCK_MEMBERS.filter((m) => {
      const matchesSearch = m.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "All" || m.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus]);

  const handleStatusChange = (status: string) => {
    setIsFilterModalVisible(false);
    setIsLoading(true);
    setSelectedStatus(status);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const renderHeader = () => (
    <View className="px-5 pt-4 pb-2">
      <View
        style={{
          width: "100%",
          height: 49,
          backgroundColor: "#F2FFFF",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#D9D9D9",
        }}
        className="flex-row items-center px-[12px] mb-4"
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

      <TouchableOpacity
        onPress={() => setIsFilterModalVisible(true)}
        className="flex-row items-center mb-6"
      >
        <Text className="text-[#1A1A1A] text-[14px] font-medium mr-1">
          {selectedStatus}
        </Text>
        <Ionicons name="caret-down" size={12} color="#1A1A1A" />
      </TouchableOpacity>

      <View className="flex-row items-center px-2 mb-4">
        <Text className="flex-1 text-[12px] font-medium text-[#64748B]">
          Names
        </Text>
        <Text className="w-24 text-[12px] font-medium text-[#64748B] text-center">
          Status
        </Text>
        <Text className="w-24 text-[12px] font-medium text-[#64748B] text-right">
          Total savings
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Tribe Members"
        onBack={() => router.back()}
        rightElement={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingRight: 16,
            }}
          >
            <TouchableOpacity onPress={handleShare} style={{ marginRight: 20 }}>
              <Ionicons name="person-add-outline" size={20} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsMoreOptionsVisible(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#155D5F" />
          <Text className="mt-4 text-[#64748B]">Filtering members...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-10">
              <Text className="text-[#64748B] text-center text-base">
                No User is on {selectedStatus.toLowerCase()} list
              </Text>
            </View>
          }
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedUser(item);
                setIsUserDetailVisible(true);
              }}
              className="px-5 mb-2"
            >
              <View
                style={{
                  height: 56,
                  borderRadius: 15,
                  backgroundColor: "#F9FAFB",
                }}
                className="flex-row items-center px-[10px]"
              >
                <View className="flex-row items-center flex-1">
                  <Image
                    source={{ uri: item.avatar }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#E2E8F0",
                    }}
                    className="mr-2"
                  />
                  <View className="flex-1 flex-row items-center">
                    <Text
                      className="text-[#1A1A1A] font-medium text-[13px] mr-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.isAdmin && (
                      <View className="bg-[#155D5F] px-1.5 py-0.5 rounded-md">
                        <Text className="text-white text-[8px] font-bold">
                          Admin
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="w-24 items-center">
                  <StatusBadge status={item.status} />
                </View>

                <View className="w-24 flex-row items-center justify-end">
                  <Text className="text-[#155D5F] font-bold text-[12px]">
                    {item.savings}
                  </Text>
                  <View className="bg-[#E2F2F2] rounded-sm ml-1 self-center h-4 w-4 items-center justify-center">
                    <Ionicons name="arrow-up" size={10} color="#155D5F" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/20"
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View
            className="absolute top-48 left-5 w-48 bg-white rounded-2xl shadow-xl overflow-hidden p-2"
            style={{ elevation: 10 }}
          >
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleStatusChange(option)}
                className={`p-3 rounded-xl ${
                  selectedStatus === option ? "bg-[#F0F9F9]" : ""
                }`}
              >
                <Text
                  className={`text-[14px] ${
                    selectedStatus === option
                      ? "text-[#155D5F] font-bold"
                      : "text-[#1A1A1A]"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* User Detail Modal */}
      <UserDetailModal
        visible={isUserDetailVisible}
        onClose={() => setIsUserDetailVisible(false)}
        user={selectedUser}
      />

      {/* More Options Modal */}
      <MoreOptionsModal
        visible={isMoreOptionsVisible}
        onClose={() => setIsMoreOptionsVisible(false)}
        id={id}
      />
    </SafeAreaView>
  );
}
