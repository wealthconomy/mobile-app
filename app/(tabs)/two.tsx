import Skeleton from "@/src/components/common/Skeleton";
import { logout } from "@/src/store/slices/authSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

interface MenuItemProps {
  icon: any;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconBgColor: string;
  iconColor: string;
  isDestructive?: boolean;
}

const MenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  iconBgColor,
  iconColor,
  isDestructive,
}: MenuItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      width: 344,
      height: 55,
      borderRadius: 10,
      paddingTop: 15,
      paddingRight: 10,
      paddingBottom: 15,
      paddingLeft: 10,
      justifyContent: "space-between",
      backgroundColor: "white",
    }}
    className="flex-row items-center active:bg-black/5"
  >
    <View
      className="w-9 h-9 rounded-full items-center justify-center mr-4"
      style={{ backgroundColor: iconBgColor }}
    >
      {typeof icon === "string" ? (
        <Ionicons name={icon as any} size={18} color={iconColor} />
      ) : (
        icon
      )}
    </View>
    <View className="flex-1">
      <Text
        className={`text-[15px] font-semibold ${isDestructive ? "text-[#EF4444]" : "text-[#323232]"}`}
      >
        {label}
      </Text>
      {subtitle && (
        <Text className="text-[10px] text-[#6B7280]">{subtitle}</Text>
      )}
    </View>
    <Ionicons
      name="chevron-forward"
      size={18}
      color={isDestructive ? "#EF4444" : "#155D5F"}
    />
  </TouchableOpacity>
);

const MenuGroup = ({ children }: { children: React.ReactNode }) => (
  <View className="mb-4 rounded-[20px] bg-[#EEF7F8] border border-[#E5F3F4] p-5 gap-y-2">
    {children}
  </View>
);

export default function MyAccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    setShowLogoutModal(false);
    dispatch(logout());
    router.replace("/(auth)/login" as any);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
      >
        {/* Header Profile */}
        <View className="flex-row items-center mb-8">
          {loading ? (
            <Skeleton width={64} height={64} circle />
          ) : (
            <View className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
                }}
                className="w-full h-full"
              />
            </View>
          )}
          <View className="ml-4">
            {loading ? (
              <View className="space-y-2">
                <Skeleton width={100} height={20} />
                <Skeleton width={80} height={24} borderRadius={12} />
              </View>
            ) : (
              <>
                <Text className="text-[20px] font-extrabold text-[#323232]">
                  Hi, Simon
                </Text>
                <View className="flex-row items-center bg-[#FFF1D6] px-2.5 py-1 rounded-full mt-1.5 self-start">
                  <Ionicons name="medal" size={12} color="#F59E0B" />
                  <Text className="text-[10px] font-bold text-[#D97706] ml-1">
                    KYC level 3
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Savings Info */}
        <View className="mb-8">
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-medium text-[#6B7280] mr-2">
              Total Savings
            </Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
            >
              <Ionicons
                name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {loading ? (
            <Skeleton width={180} height={40} />
          ) : (
            <Text className="text-[32px] font-extrabold text-[#323232]">
              {balanceVisible ? (
                <>
                  ₦300,735
                  <Text className="text-[#9CA3AF]">.42</Text>
                </>
              ) : (
                "••••••••"
              )}
            </Text>
          )}
          <Text className="text-[12px] text-[#6B7280] mt-1">
            Your wealth grew to{" "}
            <Text className="text-[#10B981]">N230.00 today ↑</Text>
          </Text>
        </View>

        {/* Menu Items Group 1 */}
        <MenuGroup>
          <MenuItem
            icon="person"
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Personal Information"
            onPress={() => router.push("/profile" as any)}
          />
          <MenuItem
            icon={
              <MaterialCommunityIcons
                name="party-popper"
                size={18}
                color="#155D5F"
              />
            }
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Invitations"
            onPress={() => router.push("/invite" as any)}
          />
          <MenuItem
            icon="notifications"
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Notifications"
            onPress={() => router.push("/notifications" as any)}
          />
        </MenuGroup>
        <View className="h-[1px] bg-[#E5E5E5] mb-6" />

        {/* Menu Items Group 2 */}
        <MenuGroup>
          <MenuItem
            icon={
              <MaterialCommunityIcons
                name="hand-coin"
                size={18}
                color="#155D5F"
              />
            }
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Finance and Growth"
            subtitle="View your wealth growth progress"
            onPress={() => {}}
          />
          <MenuItem
            icon="list"
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Transaction History"
            onPress={() => router.push("/transactions" as any)}
          />
          <MenuItem
            icon="wallet"
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Wallet & Payment Settings"
            onPress={() => {}}
          />
        </MenuGroup>

        <View className="h-[1px] bg-[#E5E5E5] mb-6" />

        {/* Menu Items Group 3 */}
        <MenuGroup>
          <MenuItem
            icon="shield-checkmark"
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Security Settings"
            subtitle="Protect your funds"
            onPress={() => router.push("/security" as any)}
          />
          <MenuItem
            icon="people"
            iconBgColor="#E0F2F1"
            iconColor="#155D5F"
            label="Customer Service Center"
            onPress={() => router.push("/support" as any)}
          />
        </MenuGroup>

        {/* Logout Group */}
        <MenuGroup>
          <MenuItem
            icon="log-out"
            iconBgColor="#FEE2E2"
            iconColor="#EF4444"
            label="Log Out"
            isDestructive
            onPress={() => setShowLogoutModal(true)}
          />
        </MenuGroup>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogoutModal(false)}>
          <View className="flex-1 bg-black/50 items-center justify-center px-4">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-[32px] w-full p-8 items-center max-w-[340px]">
                <View className="w-1.5 h-1.5 bg-[#BABABA] rounded-full mb-6" />

                <View className="w-20 h-20 bg-[#FFF5F5] rounded-3xl items-center justify-center mb-6">
                  <Ionicons name="log-out" size={40} color="#EF4444" />
                </View>

                <Text className="text-[22px] font-extrabold text-[#111827] mb-3">
                  Confirm Logout!
                </Text>

                <Text className="text-[14px] text-[#6B7280] text-center leading-[20px] mb-8">
                  To keep your portfolios secure, we will sign you out of this
                  session. You will need your password or Biometrics to jump
                  back in.
                </Text>

                <View className="flex-row w-full gap-x-3">
                  <TouchableOpacity
                    onPress={() => setShowLogoutModal(false)}
                    className="flex-1 h-16 border border-[#E5E7EB] rounded-2xl items-center justify-center"
                  >
                    <Text className="text-base font-bold text-[#111827]">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-1 h-16 bg-[#FFF2F2] border border-[#FEE2E2] rounded-2xl items-center justify-center"
                  >
                    <Text className="text-base font-bold text-[#EF4444]">
                      Secure Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
