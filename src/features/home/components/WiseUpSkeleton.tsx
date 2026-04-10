import { View } from "react-native";
import Skeleton from "../../../components/common/Skeleton";

export const WiseUpSkeleton = () => {
  return (
    <View className="flex-row">
      {[1, 2, 3].map((i) => (
        <View key={i} className="mr-4" style={{ width: 170, height: 162 }}>
          <Skeleton
            width={169}
            height={107}
            borderRadius={10}
            style={{ marginBottom: 8 }}
          />
          <Skeleton
            width={140}
            height={15}
            borderRadius={4}
            style={{ marginBottom: 4 }}
          />
          <View className="space-y-1">
            <Skeleton width={160} height={10} borderRadius={2} />
            <Skeleton width={120} height={10} borderRadius={2} />
          </View>
        </View>
      ))}
    </View>
  );
};
