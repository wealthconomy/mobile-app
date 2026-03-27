import Header from "@/src/components/common/Header";
import KycIcon from "@/src/components/common/KycIcon";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const { control, handleSubmit, reset } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "Olabiran",
      lastName: "Simon",
      dob: "18 / 12 / 1731",
      phone: "0901234567890",
      email: "simon@gmail.com",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Saving data:", data);
    // API call would go here
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Settings" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Profile Pic Section */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
            className="relative"
          >
            <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden">
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
                }}
                className="w-full h-full"
              />
            </View>
            <View className="absolute bottom-0 right-0 bg-[#155D5F] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera-outline" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text className="text-[20px] font-extrabold text-[#323232] mt-4">
            Olabiran Simon
          </Text>

          <View className="flex-row items-center bg-[#FFF1D6] px-3 py-1.5 rounded-full mt-2 gap-x-1.5">
            <KycIcon />
            <Text className="text-[12px] font-bold text-[#D97706]">
              KYC level 3
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View className="gap-y-5 mb-10">
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
            name="dob"
            label="Date of Birth"
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
          />
        </View>

        {/* Actions */}
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
          >
            <Text className="text-white text-base font-bold">Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 h-14 border border-[#E5E7EB] rounded-2xl items-center justify-center"
            >
              <Text className="text-base font-bold text-[#323232]">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="flex-1 bg-[#155D5F] h-14 rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base font-bold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Profile Photo Picker Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPhotoModal(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-[36px] px-6 pb-12 pt-3">
                <View className="w-20 h-1.5 bg-[#bababa] rounded-full self-center mb-8" />

                <Text className="text-[22px] font-extrabold text-[#323232] mb-8 text-center">
                  Update Profile Photo
                </Text>

                <View className="gap-y-4">
                  <TouchableOpacity
                    className="flex-row items-center bg-[#F8F9FA] h-16 px-5 rounded-2xl border border-[#F0F0F0]"
                    onPress={() => setShowPhotoModal(false)}
                  >
                    <View className="w-10 h-10 bg-[#E7F5F5] rounded-full items-center justify-center mr-4">
                      <Ionicons
                        name="camera-outline"
                        size={20}
                        color="#155D5F"
                      />
                    </View>
                    <Text className="text-[16px] font-bold text-[#323232]">
                      Take a Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center bg-[#F8F9FA] h-16 px-5 rounded-2xl border border-[#F0F0F0]"
                    onPress={() => setShowPhotoModal(false)}
                  >
                    <View className="w-10 h-10 bg-[#E7F5F5] rounded-full items-center justify-center mr-4">
                      <Ionicons
                        name="images-outline"
                        size={20}
                        color="#155D5F"
                      />
                    </View>
                    <Text className="text-[16px] font-bold text-[#323232]">
                      Choose from Gallery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mt-4 h-16 rounded-2xl items-center justify-center border border-[#E5E7EB]"
                    onPress={() => setShowPhotoModal(false)}
                  >
                    <Text className="text-[16px] font-bold text-[#323232]">
                      Cancel
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

const EditableField = ({ control, name, label, isEditing }: any) => (
  <View className="gap-y-2">
    <Text className="text-[14px] font-medium text-[#6B7280]">{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View
          className={`h-14 rounded-xl px-4 justify-center border ${isEditing ? "bg-white border-[#155D5F]" : "bg-[#F8F8F8] border-[#F0F0F0]"}`}
        >
          {isEditing ? (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="text-[15px] font-semibold text-[#323232] h-full"
            />
          ) : (
            <Text className="text-[15px] font-semibold text-[#323232] opacity-40">
              {value}
            </Text>
          )}
        </View>
      )}
    />
  </View>
);
