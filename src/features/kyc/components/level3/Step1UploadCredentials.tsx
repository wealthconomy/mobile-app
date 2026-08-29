import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedButton } from "@/src/components/ThemedButton";
import { IdCardDisplay, IdCardData } from './IdCardDisplay';
import { DocumentUploadBox } from './DocumentUploadBox';
import * as ImagePicker from "expo-image-picker";

interface Props {
  scannedData: IdCardData;
  proofOfAddress: string | null;
  passport: string | null;
  setProofOfAddress: (uri: string | null) => void;
  setPassport: (uri: string | null) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string;
}

const THEME_TEAL = "#155D5F";

export const Step1UploadCredentials: React.FC<Props> = ({
  scannedData,
  proofOfAddress,
  passport,
  setProofOfAddress,
  setPassport,
  onConfirm,
  isLoading,
  error
}) => {

  const pickImage = async (setter: (uri: string | null) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const isValid = proofOfAddress && passport;

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white">
      <View className="px-6 py-6 pb-12 mt-4">
        <Animated.View entering={FadeInDown.duration(600).delay(100)} className="items-center mb-8 mt-2">
           <Text className="text-[28px] font-bold text-[#155D5F] mb-2">KYC Level 3</Text>
           <Text className="text-[#64748B] text-[15px] text-center px-4">
              Complete your 3rd KYC registration to receive limitless funds
           </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
           <IdCardDisplay data={scannedData} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} className="mt-2 mb-4">
           <Text className="text-[#155D5F] font-bold text-[18px]">
             Upload your credentials
           </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
           <DocumentUploadBox 
              label="Prove of Address" 
              imageUri={proofOfAddress} 
              onPick={() => pickImage(setProofOfAddress)} 
              onRemove={() => setProofOfAddress(null)} 
           />
           <DocumentUploadBox 
              label="International Passport" 
              imageUri={passport} 
              onPick={() => pickImage(setPassport)} 
              onRemove={() => setPassport(null)} 
           />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)} className="mt-4">
           {error ? (
             <Text className="text-red-500 text-center mb-4">{error}</Text>
           ) : null}
           <ThemedButton
             title="Confirm"
             onPress={onConfirm}
             disabled={!isValid || isLoading}
             loading={isLoading}
             style={{
               backgroundColor: THEME_TEAL,
               opacity: !isValid || isLoading ? 0.6 : 1,
               height: 56,
               borderRadius: 16,
             }}
           />
        </Animated.View>
      </View>
    </ScrollView>
  );
};
