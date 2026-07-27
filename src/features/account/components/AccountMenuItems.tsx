import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export interface MenuItemProps {
  icon: any;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconBgColor: string;
  iconColor: string;
  isDestructive?: boolean;
}

export const MenuItem = React.memo(
  ({
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
        width: "100%",
        minHeight: 55,
        borderRadius: 10,
        paddingTop: 12,
        paddingRight: 10,
        paddingBottom: 12,
        paddingLeft: 10,
        justifyContent: "space-between",
        backgroundColor: "white",
      }}
      className="flex-row items-center active:bg-black/5"
      activeOpacity={0.7}
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
      <View className="flex-1 mr-2">
        <Text
          className={`text-[15px] font-semibold ${
            isDestructive ? "text-[#EF4444]" : "text-[#323232]"
          }`}
        >
          {label}
        </Text>
        {subtitle && (
          <Text className="text-[12px] font-semibold text-[#4B5563] mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDestructive ? "#EF4444" : "#155D5F"}
      />
    </TouchableOpacity>
  )
);

MenuItem.displayName = "MenuItem";

export const MenuGroup = React.memo(({ children }: { children: React.ReactNode }) => (
  <View className="mb-4 rounded-[20px] bg-[#EEF7F8] border border-[#E5F3F4] p-5 gap-y-2">
    {children}
  </View>
));

MenuGroup.displayName = "MenuGroup";

interface AccountMenuSectionsProps {
  unreadNotificationsCount?: number;
  onNavigate: (route: string) => void;
  onLogoutPress: () => void;
}

export const AccountMenuSections = React.memo(
  ({ unreadNotificationsCount = 0, onNavigate, onLogoutPress }: AccountMenuSectionsProps) => {
    return (
      <>
        {/* Menu Items Group 1 */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <MenuGroup>
            <MenuItem
              icon="person"
              iconBgColor="#E0F2F1"
              iconColor="#155D5F"
              label="Personal Information"
              onPress={() => onNavigate("/profile")}
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
              onPress={() => onNavigate("/profile/invite")}
            />
            <MenuItem
              icon="notifications"
              iconBgColor="#E0F2F1"
              iconColor="#155D5F"
              label="Notifications"
              subtitle={
                unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} unread message${
                      unreadNotificationsCount > 1 ? "s" : ""
                    }`
                  : undefined
              }
              onPress={() => onNavigate("/profile/notifications")}
            />
          </MenuGroup>
        </Animated.View>

        <View className="h-[1px] bg-[#E5E5E5] mb-6" />

        {/* Menu Items Group 2 */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <MenuGroup>
            <MenuItem
              icon="list"
              iconBgColor="#E0F2F1"
              iconColor="#155D5F"
              label="Transaction History"
              onPress={() => onNavigate("/transactions")}
            />
            <MenuItem
              icon="wallet"
              iconBgColor="#E0F2F1"
              iconColor="#155D5F"
              label="Wallet & Payment Settings"
              onPress={() => onNavigate("/payment")}
            />
          </MenuGroup>
        </Animated.View>

        <View className="h-[1px] bg-[#E5E5E5] mb-6" />

        {/* Menu Items Group 3 */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <MenuGroup>
            <MenuItem
              icon="shield-checkmark"
              iconBgColor="#E0F2F1"
              iconColor="#155D5F"
              label="Security Settings"
              subtitle="Protect your funds"
              onPress={() => onNavigate("/profile/security")}
            />
            <MenuItem
              icon="people"
              iconBgColor="#E0F2F1"
              iconColor="#155D5F"
              label="Customer Service Center"
              onPress={() => onNavigate("/support")}
            />
          </MenuGroup>
        </Animated.View>

        {/* Logout Group */}
        <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          <MenuGroup>
            <MenuItem
              icon="log-out"
              iconBgColor="#FEE2E2"
              iconColor="#EF4444"
              label="Log Out"
              isDestructive
              onPress={onLogoutPress}
            />
          </MenuGroup>
        </Animated.View>
      </>
    );
  }
);

AccountMenuSections.displayName = "AccountMenuSections";
