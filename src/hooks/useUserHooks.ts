import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { getApiErrorMessage } from "./useAuthHooks";
import {
  useSetupPinMutation,
  useToggleBiometricsMutation,
  useUpdateMyProfileMutation,
  useUpdateNotificationSettingsMutation,
  useUpdatePinMutation,
  useVerifyPinMutation,
  UserProfile,
} from "../store/api/userApi";
import {
  NotificationSettingsFormData,
  notificationSettingsSchema,
  PinFormData,
  pinSchema,
  UpdatePinFormData,
  updatePinSchema,
  UpdateProfileFormData,
  updateProfileSchema,
} from "../validations/userSchemas";

/**
 * Custom Hook for Profile Update Form
 */
export function useUpdateProfileForm(initialProfile?: UserProfile, onSuccessCallback?: () => void) {
  const [updateMutation, { isLoading }] = useUpdateMyProfileMutation();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: initialProfile?.firstName || "",
      lastName: initialProfile?.lastName || "",
      phone: initialProfile?.phone || "",
      username: initialProfile?.username || "",
      bio: initialProfile?.bio || "",
      imageUrl: initialProfile?.imageUrl || "",
      nextOfKinName: initialProfile?.nextOfKinName || "",
      nextOfKinRelationship: initialProfile?.nextOfKinRelationship || "",
      nextOfKinPhone: initialProfile?.nextOfKinPhone || "",
    },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      const res = await updateMutation(data).unwrap();
      Alert.alert("Success", res.message || "Profile updated successfully!");
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Update Failed", getApiErrorMessage(err, "Could not update profile"));
    }
  };

  return {
    ...form,
    isLoading,
    handleUpdateProfile: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for Transaction PIN Setup
 */
export function useSetupPinForm(onSuccessCallback?: () => void) {
  const [setupMutation, { isLoading }] = useSetupPinMutation();

  const form = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const onSubmit = async (data: PinFormData) => {
    try {
      const res = await setupMutation(data).unwrap();
      Alert.alert("Success", res.message || "PIN set successfully!");
      form.reset();
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("PIN Setup Failed", getApiErrorMessage(err, "Could not setup PIN"));
    }
  };

  return {
    ...form,
    isLoading,
    handleSetupPin: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for Transaction PIN Verification
 */
export function useVerifyPinForm(onSuccessCallback?: () => void) {
  const [verifyMutation, { isLoading }] = useVerifyPinMutation();

  const form = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const onSubmit = async (data: PinFormData) => {
    try {
      const res = await verifyMutation(data).unwrap();
      Alert.alert("Success", res.message || "PIN verified!");
      form.reset();
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Incorrect PIN", getApiErrorMessage(err, "Invalid transaction PIN"));
    }
  };

  return {
    ...form,
    isLoading,
    handleVerifyPin: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for Transaction PIN Update
 */
export function useUpdatePinForm(onSuccessCallback?: () => void) {
  const [updateMutation, { isLoading }] = useUpdatePinMutation();

  const form = useForm<UpdatePinFormData>({
    resolver: zodResolver(updatePinSchema),
    defaultValues: {
      oldPin: "",
      newPin: "",
      confirmPin: "",
    },
  });

  const onSubmit = async (data: UpdatePinFormData) => {
    try {
      const res = await updateMutation({ oldPin: data.oldPin, newPin: data.newPin }).unwrap();
      Alert.alert("Success", res.message || "Transaction PIN updated!");
      form.reset();
      onSuccessCallback?.();
    } catch (err: any) {
      Alert.alert("Update Failed", getApiErrorMessage(err, "Could not update PIN"));
    }
  };

  return {
    ...form,
    isLoading,
    handleUpdatePin: form.handleSubmit(onSubmit),
  };
}

/**
 * Custom Hook for Toggling User Settings (Notifications & Biometrics)
 */
export function useUserSettingsActions() {
  const [notifMutation, { isLoading: isUpdatingNotifs }] = useUpdateNotificationSettingsMutation();
  const [bioMutation, { isLoading: isUpdatingBio }] = useToggleBiometricsMutation();

  const handleToggleNotifications = async (settings: NotificationSettingsFormData) => {
    try {
      await notifMutation(settings).unwrap();
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not update notifications"));
    }
  };

  const handleToggleBiometrics = async (enabled: boolean) => {
    try {
      await bioMutation({ biometricsEnabled: enabled }).unwrap();
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err, "Could not toggle biometrics"));
    }
  };

  return {
    handleToggleNotifications,
    handleToggleBiometrics,
    isUpdatingNotifs,
    isUpdatingBio,
  };
}
