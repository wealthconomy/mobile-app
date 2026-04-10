import Skeleton from "@/src/components/common/Skeleton";
import { ScrollView, View } from "react-native";

export const PortfolioCardSkeleton = () => (
  <View
    style={{
      width: 179,
      height: 119,
      backgroundColor: "#F9F9F9",
      borderTopLeftRadius: 37,
      borderTopRightRadius: 15,
      borderBottomRightRadius: 37,
      borderBottomLeftRadius: 15,
      padding: 16,
      borderWidth: 0.7,
      borderColor: "#E5E7EB",
    }}
  >
    <Skeleton
      width={35}
      height={35}
      circle
      style={{ marginBottom: 12, backgroundColor: "#EEEEEE" }}
    />
    <Skeleton
      width={80}
      height={14}
      style={{ borderRadius: 4, marginBottom: 6, backgroundColor: "#EEEEEE" }}
    />
    <Skeleton
      width={120}
      height={10}
      style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
    />
    <Skeleton
      width={100}
      height={10}
      style={{
        borderRadius: 4,
        marginTop: 4,
        backgroundColor: "#EEEEEE",
      }}
    />

    {/* Interest Tag Skeleton */}
    <View
      style={{
        position: "absolute",
        top: 11,
        left: 91,
        width: 82,
        height: 21,
        borderRadius: 20,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <Skeleton
        width={60}
        height={10}
        style={{ borderRadius: 5, backgroundColor: "#EEEEEE" }}
      />
    </View>
  </View>
);

export const RecentActivitySkeleton = () => (
  <View className="flex-row items-center bg-[#F8F8F8] rounded-[20px] p-4 mb-3">
    <Skeleton
      width={40}
      height={40}
      circle
      style={{ marginRight: 12, backgroundColor: "#EEEEEE" }}
    />
    <View className="flex-1">
      <View className="flex-row justify-between mb-2">
        <Skeleton
          width="50%"
          height={14}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
        <Skeleton
          width="20%"
          height={14}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
      </View>
      <Skeleton
        width="30%"
        height={10}
        style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
      />
    </View>
  </View>
);

export const PortfolioDetailSkeleton = () => (
  <View style={{ flex: 1, backgroundColor: "white" }}>
    <View className="px-5 pt-4">
      {/* Total Savings Card Skeleton */}
      <View
        style={{
          width: "100%",
          height: 140,
          borderRadius: 20,
          backgroundColor: "#F9F9F9",
          padding: 20,
          marginBottom: 32,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Skeleton
            width={80}
            height={14}
            style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
          />
          <Skeleton
            width={20}
            height={20}
            style={{ borderRadius: 10, backgroundColor: "#EEEEEE" }}
          />
        </View>
        <Skeleton
          width={200}
          height={32}
          style={{
            borderRadius: 8,
            marginBottom: 8,
            backgroundColor: "#EEEEEE",
          }}
        />
        <Skeleton
          width={180}
          height={12}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
      </View>

      {/* Info Box Skeleton */}
      <Skeleton
        width="100%"
        height={120}
        borderRadius={24}
        style={{ marginBottom: 32, backgroundColor: "#F9F9F9" }}
      />

      {/* Action Buttons Skeleton */}
      <View className="flex-row justify-between mb-8">
        <Skeleton
          width="48.5%"
          height={75}
          borderRadius={13}
          style={{ backgroundColor: "#F9F9F9" }}
        />
        <Skeleton
          width="48.5%"
          height={75}
          borderRadius={13}
          style={{ backgroundColor: "#F9F9F9" }}
        />
      </View>

      <View
        style={{ height: 1, backgroundColor: "#EEEEEE", marginBottom: 32 }}
      />

      {/* Transactions Header Skeleton */}
      <View className="flex-row justify-between items-center mb-6">
        <Skeleton
          width={140}
          height={20}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
        <Skeleton
          width={60}
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
      </View>

      {/* Transaction Items Skeleton */}
      <RecentActivitySkeleton />
      <RecentActivitySkeleton />
      <RecentActivitySkeleton />
    </View>
  </View>
);

export const DashboardLoadingState = () => (
  <View>
    {/* Wealth Card Skeleton */}
    <View className="mb-10">
      <Skeleton
        width="100%"
        height={170}
        borderRadius={20}
        style={{ backgroundColor: "#EEEEEE" }}
      />
    </View>

    {/* Portfolios Skeleton */}
    <View className="mb-10">
      <View className="flex-row justify-between items-center mb-4">
        <Skeleton
          width={130}
          height={20}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
        <Skeleton
          width={60}
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
      >
        <View className="mr-4">
          <PortfolioCardSkeleton />
        </View>
        <View className="mr-4">
          <PortfolioCardSkeleton />
        </View>
        <PortfolioCardSkeleton />
      </ScrollView>
    </View>

    {/* Todo Skeleton */}
    <View className="mb-10">
      <Skeleton
        width={100}
        height={20}
        style={{
          borderRadius: 4,
          marginBottom: 16,
          backgroundColor: "#EEEEEE",
        }}
      />
      <Skeleton
        width="100%"
        height={100}
        borderRadius={24}
        style={{ backgroundColor: "#EEEEEE" }}
      />
    </View>

    {/* Wise Up Skeleton */}
    <View className="mb-10">
      <Skeleton
        width={80}
        height={20}
        style={{
          borderRadius: 4,
          marginBottom: 16,
          backgroundColor: "#EEEEEE",
        }}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
      >
        {[1, 2, 3].map((i) => (
          <View key={i} className="mr-4" style={{ width: 170 }}>
            <Skeleton
              width={169}
              height={107}
              borderRadius={10}
              style={{ marginBottom: 8, backgroundColor: "#EEEEEE" }}
            />
            <Skeleton
              width={140}
              height={14}
              style={{
                borderRadius: 4,
                marginBottom: 6,
                backgroundColor: "#EEEEEE",
              }}
            />
            <Skeleton
              width={100}
              height={10}
              style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
            />
          </View>
        ))}
      </ScrollView>
    </View>

    {/* Activities Skeleton */}
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-5">
        <Skeleton
          width={140}
          height={20}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
        <Skeleton
          width={60}
          height={16}
          style={{ borderRadius: 4, backgroundColor: "#EEEEEE" }}
        />
      </View>
      <RecentActivitySkeleton />
      <RecentActivitySkeleton />
      <RecentActivitySkeleton />
    </View>
  </View>
);
