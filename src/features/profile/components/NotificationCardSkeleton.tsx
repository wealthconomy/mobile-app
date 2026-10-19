import { Skeleton } from "@/src/components/common/skeletons";
import { View } from "react-native";

export const NotificationCardSkeleton = () => (
  <View className="flex-row bg-[#F8F8F8] rounded-[16px] p-4 mb-3 items-start">
    <Skeleton
      width={40}
      height={40}
      circle
      style={{ marginRight: 12, backgroundColor: "#E1E1E1" }}
    />
    <View className="flex-1">
      <View className="flex-row justify-between mb-2">
        <Skeleton
          width="60%"
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#E1E1E1" }}
        />
        <Skeleton
          width="20%"
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#E1E1E1" }}
        />
      </View>
      <Skeleton
        width="90%"
        height={12}
        style={{ borderRadius: 4, marginBottom: 8, backgroundColor: "#E1E1E1" }}
      />
      <View className="flex-row justify-between items-center">
        <Skeleton
          width="40%"
          height={10}
          style={{ borderRadius: 2, backgroundColor: "#E1E1E1" }}
        />
        <Skeleton
          width={60}
          height={18}
          style={{ borderRadius: 8, backgroundColor: "#E1E1E1" }}
        />
      </View>
    </View>
  </View>
);
