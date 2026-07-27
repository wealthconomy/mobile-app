import React from "react";
import {
  FlatList,
  FlatListProps,
  ActivityIndicator,
  View,
} from "react-native";

export interface InfiniteScrollListProps<T>
  extends Omit<FlatListProps<T>, "onEndReached" | "onEndReachedThreshold"> {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoadingInitial?: boolean;
}

export function InfiniteScrollList<T>({
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isLoadingInitial,
  ...flatListProps
}: InfiniteScrollListProps<T>) {
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center justify-center">
          <ActivityIndicator size="small" color="#155D5F" />
        </View>
      );
    }
    return <View className="h-4" />;
  };

  if (
    isLoadingInitial &&
    (!flatListProps.data || flatListProps.data.length === 0)
  ) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <ActivityIndicator size="large" color="#155D5F" />
      </View>
    );
  }

  return (
    <FlatList
      {...flatListProps}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}
