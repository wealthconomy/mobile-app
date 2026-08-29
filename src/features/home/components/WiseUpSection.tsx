import { useGetBlogsQuery } from "@/src/store/api/blogApi";
import { router } from "expo-router";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/common/ui/Text";
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
    style={{ width: 170 }}
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
      variant="caption"
      className="font-kumbh-bold text-[#1A1A1A] leading-tight mb-1"
      numberOfLines={1}
    >
      {title}
    </Text>
    <Text
      variant="small"
      className="text-[#9CA3AF] leading-[16px]"
      numberOfLines={2}
    >
      {description}
    </Text>
  </TouchableOpacity>
);

interface WiseUpSectionProps {
  hideViewAll?: boolean;
  containerClassName?: string;
  scrollClassName?: string;
}

export const WiseUpSection = ({
  hideViewAll = false,
  containerClassName = "",
  scrollClassName = "-mx-5 px-5",
}: WiseUpSectionProps = {}) => {
  const { data: response, isLoading } = useGetBlogsQuery({ publishToApp: true });
  const blogs = response?.data?.items || [];

  return (
    <View className={containerClassName}>
      <View className="flex-row justify-between items-center mb-4">
        <Text variant="h3" className="text-[#1A1A1A] font-kumbh-extrabold">Wise Up</Text>
        {!hideViewAll && (
          <TouchableOpacity
            onPress={() => router.push("/education/wise-up" as any)}
          >
            <Text variant="caption" className="text-[#155D5F] font-kumbh-medium">View all</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={scrollClassName}
      >
        {isLoading ? (
          <WiseUpSkeleton />
        ) : (
          blogs?.map((blog) => (
            <WiseUpCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              description={blog.description || blog.content}
              image={blog.image}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
