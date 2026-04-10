import { View } from "react-native";
import Skeleton from "../../../components/common/Skeleton";

export const BlogSkeleton = () => {
  return (
    <View className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="flex-row items-center py-4"
          style={{ height: 81 }}
        >
          <Skeleton width={104} height={66} borderRadius={6} />

          <View className="flex-1 ml-4 h-[66px] justify-center">
            <View className="mb-1.5">
              <Skeleton
                width={57}
                height={15}
                borderRadius={4}
                style={{ marginBottom: 4 }}
              />
              <View className="flex-row items-center justify-between">
                <Skeleton width="80%" height={16} borderRadius={4} />
                <Skeleton
                  width={30}
                  height={16}
                  borderRadius={4}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>

            <View className="flex-row items-center">
              <Skeleton
                circle
                width={16}
                height={16}
                style={{ marginRight: 8 }}
              />
              <View>
                <Skeleton
                  width={60}
                  height={10}
                  borderRadius={2}
                  style={{ marginBottom: 2 }}
                />
                <Skeleton width={80} height={8} borderRadius={2} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};
