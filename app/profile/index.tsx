import Header from "@/src/components/common/Header";
import KycIcon from "@/src/components/common/KycIcon";
import { RootState } from "@/src/store";
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/src/store/api/userApi";
import { setCredentials } from "@/src/store/slices/authSlice";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { suspendAppLock } from "@/src/store/slices/appStatusSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const PRIMARY = "#155D5F";
const DARK = "#323232";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const { data: profileResponse } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const { uploadImage } = useImageUpload();

  const profile = profileResponse?.data;

  const initialFirstName = profile?.firstName || user?.firstName || (user?.name ? user.name.split(" ")[0] : "");
  const initialLastName = profile?.lastName || user?.lastName || (user?.name ? user.name.split(" ").slice(1).join(" ") : "");
  const initialPhone = profile?.phone || user?.phone || "";
  const initialEmail = profile?.email || user?.email || "";
  const kycLevel = profile?.kycLevel ?? user?.kycLevel ?? 1;

  const [profileImage, setProfileImage] = useState<string | null>(
    (profile?.imageUrl && profile.imageUrl.startsWith("http"))
      ? profile.imageUrl
      : (user?.imageUrl && user.imageUrl.startsWith("http"))
      ? user.imageUrl
      : null
  );

  // Load locally saved avatar if it's a valid remote URL
  useEffect(() => {
    const avatarKey = `@wealth_avatar_${user?.id || "me"}`;
    AsyncStorage.getItem(avatarKey).then((saved) => {
      if (saved && saved.startsWith("http")) {
        setProfileImage(saved);
      }
    }).catch(() => {});
  }, [user?.id]);

  const userInitials = useMemo(() => {
    const first = initialFirstName?.[0] || user?.name?.[0] || user?.username?.[0] || "U";
    const last = initialLastName?.[0] || "";
    return (first + last).toUpperCase();
  }, [initialFirstName, initialLastName, user]);

  const { control, handleSubmit, reset } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      phone: initialPhone,
      email: initialEmail,
    },
  });

  useEffect(() => {
    reset({
      firstName: initialFirstName,
      lastName: initialLastName,
      phone: initialPhone,
      email: initialEmail,
    });

    // Only update profile image from network if a real cloud image URL exists
    if (profile?.imageUrl && profile.imageUrl.startsWith("http")) {
      setProfileImage(profile.imageUrl);
    } else if (user?.imageUrl && user.imageUrl.startsWith("http")) {
      setProfileImage(user.imageUrl);
    }
  }, [profile, user]);

  const handleImageSelected = async (uri: string) => {
    if (!uri) return;

    try {
      setIsUploadingPhoto(true);

      // 1. Upload local image file to cloud storage via /api/v1/file/upload
      const cloudUrl = await uploadImage(uri, { allowFallback: false });

      if (!cloudUrl || !cloudUrl.startsWith("http")) {
        throw new Error("The storage server did not return a valid cloud URL.");
      }

      // 2. Persist the permanent cloud URL to the user record via PUT /api/v1/user/me
      await updateProfile({ imageUrl: cloudUrl }).unwrap();

      // 3. Update local state and cached avatar
      setProfileImage(cloudUrl);
      const avatarKey = `@wealth_avatar_${user?.id || "me"}`;
      await AsyncStorage.setItem(avatarKey, cloudUrl);

      // 4. Update Redux credentials so the photo displays across the entire app
      if (user && token) {
        dispatch(
          setCredentials({
            user: { ...user, imageUrl: cloudUrl },
            token,
            refreshToken: refreshToken || undefined,
          })
        );
      }

      Alert.alert("Success", "Profile photo uploaded and saved successfully!");
    } catch (err: any) {
      console.error("[ProfileScreen] Image upload error:", err);
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Could not upload profile photo. Please try again.";
      Alert.alert("Upload Failed", errorMsg);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const pickImage = async () => {
    suspendAppLock(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need access to your gallery to change your profile photo.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await handleImageSelected(result.assets[0].uri);
      }
    } finally {
      suspendAppLock(false);
    }
  };

  const takePhoto = async () => {
    suspendAppLock(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need access to your camera to take a photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await handleImageSelected(result.assets[0].uri);
      }
    } finally {
      suspendAppLock(false);
    }
  };

  const handlePhotoUpdate = () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose a source for your photo",
      [
        { text: "Take a Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        ...(profileImage && profileImage.startsWith("http") ? { imageUrl: profileImage } : {}),
      }).unwrap();
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to update profile. Please try again.";
      Alert.alert("Update Failed", errorMsg);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const fullName = `${initialFirstName} ${initialLastName}`.trim() || user?.name || "User";

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Personal Information" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Profile Pic Section */}
        <Animated.View entering={FadeInUp.duration(700).delay(100)} className="items-center mb-8">
          <TouchableOpacity
            onPress={handlePhotoUpdate}
            activeOpacity={0.8}
            disabled={isUploadingPhoto}
            className="relative"
          >
            <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-[#155D5F] items-center justify-center">
              {isUploadingPhoto ? (
                <View className="items-center justify-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white text-[10px] font-bold mt-1">Uploading...</Text>
                </View>
              ) : profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-white text-[30px] font-extrabold tracking-wider">
                  {userInitials}
                </Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-[#155D5F] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              {isUploadingPhoto ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera-outline" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>

          <Text className="text-[20px] font-extrabold text-[#323232] mt-4">
            {fullName}
          </Text>

          <View className="flex-row items-center bg-[#FFF1D6] px-3 py-1.5 rounded-full mt-2 gap-x-1.5">
            <KycIcon />
            <Text className="text-[12px] font-bold text-[#D97706]">
              KYC level {kycLevel}
            </Text>
          </View>
        </Animated.View>

        {/* Form Fields (Without Date of Birth) */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={{ gap: 18, marginBottom: 36 }}>
          <EditableField
            control={control}
            name="firstName"
            label="First Name"
            isEditing={isEditing}
          />
          <EditableField
            control={control}
            name="lastName"
            label="Last Name"
            isEditing={isEditing}
          />
          <EditableField
            control={control}
            name="phone"
            label="Phone Number"
            isEditing={isEditing}
          />
          <EditableField
            control={control}
            name="email"
            label="Email Address"
            isEditing={isEditing}
            isReadOnly
          />
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-bold">Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 h-14 border border-[#E5E7EB] rounded-2xl items-center justify-center bg-[#F9FAFB]"
              activeOpacity={0.85}
            >
              <Text className="text-base font-bold text-[#323232]">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="flex-1 bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
              activeOpacity={0.85}
            >
              <Text className="text-white text-base font-bold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EditableField = ({
  control,
  name,
  label,
  isEditing,
  isReadOnly,
}: {
  control: any;
  name: string;
  label: string;
  isEditing: boolean;
  isReadOnly?: boolean;
}) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280" }}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View
          style={{
            height: 54,
            borderRadius: 14,
            paddingHorizontal: 16,
            justifyContent: "center",
            backgroundColor: isEditing && !isReadOnly ? "#F9FAFB" : "#F8F8F8",
            borderWidth: isEditing && !isReadOnly ? 1.5 : 1,
            borderColor: isEditing && !isReadOnly ? "#D1D5DB" : "#E5E7EB",
          }}
        >
          {isEditing && !isReadOnly ? (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#1A1A1A",
                height: "100%",
                padding: 0,
                borderWidth: 0,
              }}
              underlineColorAndroid="transparent"
            />
          ) : (
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isReadOnly ? "#9CA3AF" : "#4B5563",
              }}
            >
              {value || "Not set"}
            </Text>
          )}
        </View>
      )}
    />
  </View>
);
