import { View } from "react-native";

export const BlogSkeleton = () => {
  return (
    <View className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="flex-row items-center py-4">
          <View className="w-24 h-24 rounded-2xl bg-gray-100" />
          <View className="flex-1 ml-4 space-y-2">
            <View className="w-20 h-4 rounded bg-gray-100" />
            <View className="w-full h-6 rounded bg-gray-100" />
            <View className="flex-row items-center">
              <View className="w-5 h-5 rounded-full bg-gray-100 mr-2" />
              <View className="w-24 h-3 rounded bg-gray-100" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
