import React from 'react';
import { View, Text, Image } from 'react-native';

export interface IdCardData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nin: string;
  expires: string;
  idImageUrl?: string;
}

export const IdCardDisplay: React.FC<{ data: IdCardData }> = ({ data }) => {
  return (
    <View className="mb-6">
      <View className="items-center mb-6">
        <View className="w-[300px] h-[180px] rounded-[16px] overflow-hidden bg-gray-100 shadow-md">
          {data.idImageUrl ? (
            <Image 
              source={{ uri: data.idImageUrl }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-gray-400 font-medium">No ID Image</Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between px-2">
         <View className="w-[48%] mb-4 flex-row">
            <Text className="text-gray-400 text-[13px] w-14">Name:</Text>
            <Text className="text-gray-800 text-[13px] font-medium flex-1" numberOfLines={1}>{data.firstName} {data.lastName}</Text>
         </View>
         <View className="w-[48%] mb-4 flex-row">
            <Text className="text-gray-400 text-[13px] w-12">DOB:</Text>
            <Text className="text-gray-800 text-[13px] font-medium flex-1">{data.dateOfBirth}</Text>
         </View>
         <View className="w-[48%] mb-2 flex-row">
            <Text className="text-gray-400 text-[13px] w-14">NIN:</Text>
            <Text className="text-gray-800 text-[13px] font-medium flex-1">{data.nin}</Text>
         </View>
         <View className="w-[48%] mb-2 flex-row">
            <Text className="text-gray-400 text-[13px] w-12">Exp:</Text>
            <Text className="text-gray-800 text-[13px] font-medium flex-1">{data.expires}</Text>
         </View>
      </View>
    </View>
  )
}
