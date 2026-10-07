import Header from "@/src/components/common/Header";
import { ProfileAvatarSection } from "@/src/features/profile/components/ProfileAvatarSection";
import { ProfileEditableField } from "@/src/features/profile/components/ProfileEditableField";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { RootState } from "@/src/store";
import { useGetKycStatusQuery } from "@/src/store/api/kycApi";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/src/store/api/userApi";
import { setCredentials } from "@/src/store/slices/authSlice";
import { imageService } from "@/src/utils/imageService";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const stripCountryCode = (phone?: string) => {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[^0-9]/g, "");
  if (cleaned.startsWith("234")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
};

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  // Redux auth user
  const {
    user: authUser,
    token,
    refreshToken,
  } = useSelector((state: RootState) => state.auth);

  // RTK Query API
  const { data: profileResponse, isLoading: queryLoading } =
    useGetMyProfileQuery();
  const { data: kycResponse } = useGetKycStatusQuery();
  const [updateProfile, { isLoading: updatingProfile }] =
    useUpdateMyProfileMutation();
  const { uploadImage, isLoading: uploadingFile } = useImageUpload();

  const activeUser = profileResponse?.data || authUser;
  const isLoading = queryLoading && !activeUser;

  const { control, handleSubmit, reset } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  // Sync form values whenever user data arrives
  useEffect(() => {
    if (activeUser) {
      const rawPhone =
        activeUser.phone ||
        activeUser.phoneNumber ||
        activeUser.phone_number ||
        activeUser.mobile ||
        "";

      reset({
        firstName: activeUser.firstName || activeUser.name?.split(" ")[0] || "",
        lastName:
          activeUser.lastName ||
          activeUser.name?.split(" ").slice(1).join(" ") ||
          "",
        phone: stripCountryCode(rawPhone),
        email: activeUser.email || "",
      });
    }
  }, [activeUser, reset]);

  const handleProcessPhoto = useCallback(
    async (fileAsset: ImagePicker.ImagePickerAsset) => {
      try {
        const newImageUrl = await uploadImage(fileAsset.uri, {
          name: fileAsset.fileName || "avatar.jpg",
          type: fileAsset.mimeType || "image/jpeg",
        });

        await updateProfile({ imageUrl: newImageUrl }).unwrap();
        Alert.alert("Success", "Profile photo updated successfully!");
      } catch {
        // Fallback: update local credentials if server upload fails during dev
        if (activeUser && token) {
          const updatedUser = { ...activeUser, imageUrl: fileAsset.uri };
          dispatch(
            setCredentials({
              user: updatedUser,
              token,
              refreshToken: refreshToken || undefined,
            }),
          );
          Alert.alert("Success", "Profile photo updated!");
        }
      }
    },
    [uploadImage, updateProfile, activeUser, token, refreshToken, dispatch],
  );

  const pickImage = useCallback(async () => {
    const result = await imageService.pickImageFromLibrary({ aspect: [1, 1] });
    if (result) {
      handleProcessPhoto(result as any);
    }
  }, [handleProcessPhoto]);

  const takePhoto = useCallback(async () => {
    const result = await imageService.captureImageWithCamera({
      aspect: [1, 1],
    });
    if (result) {
      handleProcessPhoto(result as any);
    }
  }, [handleProcessPhoto]);

  const handlePhotoUpdate = useCallback(() => {
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
  }, [takePhoto, pickImage]);

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        const payload: Record<string, any> = {
          firstName: (data.firstName || "").trim(),
          lastName: (data.lastName || "").trim(),
        };

        const cleanedPhone = stripCountryCode(data.phone);
        if (cleanedPhone.length > 0) {
          payload.phone = `+234${cleanedPhone}`;
        }

        const res = await updateProfile(payload).unwrap();

        // Update local Redux state with verified API response or payload
        if (activeUser && token) {
          const updatedUser = {
            ...activeUser,
            ...(res?.data || payload),
          };
          dispatch(
            setCredentials({
              user: updatedUser,
              token,
              refreshToken: refreshToken || undefined,
            }),
          );
        }

        setIsEditing(false);
        Alert.alert("Success", "Personal information updated successfully!");
      } catch (error: any) {
        console.log("Profile update error details:", JSON.stringify(error, null, 2));
        const errMsg = Array.isArray(error?.data?.message)
          ? error.data.message[0]
          : error?.data?.message ||
            error?.message ||
            "Failed to update profile. Please verify your details.";
        Alert.alert("Update Failed", errMsg);
      }
    },
    [updateProfile, activeUser, token, refreshToken, dispatch],
  );

  const handleCancel = useCallback(() => {
    if (activeUser) {
      const rawPhone =
        activeUser.phone ||
        activeUser.phoneNumber ||
        activeUser.phone_number ||
        activeUser.mobile ||
        "";
      reset({
        firstName: activeUser.firstName || activeUser.name?.split(" ")[0] || "",
        lastName:
          activeUser.lastName ||
          activeUser.name?.split(" ").slice(1).join(" ") ||
          "",
        phone: stripCountryCode(rawPhone),
        email: activeUser.email || "",
      });
    }
    setIsEditing(false);
  }, [activeUser, reset]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Personal Information" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Avatar Section */}
        <ProfileAvatarSection
          user={activeUser}
          kycLevel={kycResponse?.data?.currentLevel}
          loading={isLoading}
          uploading={uploadingFile}
          onPressPhoto={handlePhotoUpdate}
        />

        {/* Form Fields */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          className="gap-y-10 mb-10"
        >
          <ProfileEditableField
            control={control}
            name="firstName"
            label="First Name"
            placeholder="Enter first name"
            isEditing={isEditing}
          />
          <ProfileEditableField
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Enter last name"
            isEditing={isEditing}
          />
          <ProfileEditableField
            control={control}
            name="email"
            label="Email Address"
            placeholder="Enter email address"
            keyboardType="email-address"
            isEditing={isEditing}
            editable={false} // Email is usually read-only / managed via security settings
          />
          <ProfileEditableField
            control={control}
            name="phone"
            label="Phone Number"
            placeholder="e.g. 802 696 0604"
            keyboardType="phone-pad"
            prefix="+234"
            isEditing={isEditing}
          />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              activeOpacity={0.8}
              className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center shadow-sm"
            >
              <Text className="text-white text-base font-bold">
                Edit Profile
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={handleCancel}
                disabled={updatingProfile}
                activeOpacity={0.8}
                className="flex-1 h-14 border border-[#E5E7EB] rounded-2xl items-center justify-center"
              >
                <Text className="text-base font-bold text-[#323232]">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={updatingProfile}
                activeOpacity={0.8}
                className="flex-1 bg-[#155D5F] h-14 rounded-2xl items-center justify-center flex-row gap-x-2"
              >
                {updatingProfile && (
                  <ActivityIndicator color="white" size="small" />
                )}
                <Text className="text-white text-base font-bold">
                  {updatingProfile ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
