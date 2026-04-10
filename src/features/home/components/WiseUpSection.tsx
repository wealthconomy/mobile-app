import { blogService } from "@/src/api/blogService";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { WiseUpSkeleton } from "./WiseUpSkeleton";

interface WiseUpCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const WiseUpCard = ({
  id,
  title,
  description,
  image,
}: WiseUpCardProps) => (
  <TouchableOpacity
    className="mr-4"
    style={{ width: 170, height: 162 }}
    activeOpacity={0.8}
    onPress={() => router.push(`/blog/${id}` as any)}
  >
    <View className="w-[169px] h-[107px] rounded-[10px] overflow-hidden mb-2">
      <Image
        source={{ uri: image }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>
    <Text
      className="text-[#1A1A1A] font-bold text-[15px] leading-tight mb-1"
      numberOfLines={1}
    >
      {title}
    </Text>
    <Text
      className="text-[#9CA3AF] text-[12px] font-medium leading-[16px]"
      numberOfLines={2}
    >
      {description}
    </Text>
  </TouchableOpacity>
);

export const WiseUpSection = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["home-blogs"],
    queryFn: () => blogService.getBlogs(),
  });

  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[#1A1A1A] font-bold text-lg">WiseUp</Text>
        <TouchableOpacity
          onPress={() => router.push("/education/wise-up" as any)}
        >
          <Text className="text-[#155D5F] text-sm font-medium">View all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5 px-5"
      >
        {isLoading ? (
          <WiseUpSkeleton />
        ) : (
          blogs?.map((blog) => (
            <WiseUpCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              description={blog.description}
              image={blog.image}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
