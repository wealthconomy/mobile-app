import { blogService } from "@/src/api/blogService";
import Header from "@/src/components/common/Header";
import Skeleton from "@/src/components/common/Skeleton";
import { WiseUpCard } from "@/src/features/home/components/WiseUpSection";
import { WiseUpSkeleton } from "@/src/features/home/components/WiseUpSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";

const HotlineSVG = () => (
  <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <G clipPath="url(#clip0_625_2573)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.9999 3.21429C13.1528 3.21429 11.3814 3.94802 10.0754 5.25408C8.76931 6.56013 8.03558 8.33153 8.03557 10.1786V15.5357C8.03557 15.962 7.86625 16.3707 7.56485 16.6721C7.26346 16.9735 6.85467 17.1429 6.42843 17.1429C6.00219 17.1429 5.59341 16.9735 5.29201 16.6721C4.99061 16.3707 4.82129 15.962 4.82129 15.5357V10.1786C4.82129 7.47905 5.89367 4.89009 7.80252 2.98123C9.71138 1.07238 12.3003 0 14.9999 0L15.5356 0C18.2351 0 20.8241 1.07238 22.7329 2.98123C24.6418 4.89009 25.7141 7.47905 25.7141 10.1786V21.7114C25.7141 23.6229 24.7541 25.2836 23.5863 26.4214C22.442 27.5379 20.8563 28.3929 19.2856 28.3929C18.8593 28.3929 18.4506 28.2235 18.1492 27.9221C17.8478 27.6207 17.6784 27.212 17.6784 26.7857C17.6784 26.3595 17.8478 25.9507 18.1492 25.6493C18.4506 25.3479 18.8593 25.1786 19.2856 25.1786C19.7591 25.1786 20.5841 24.8614 21.3427 24.1221C22.0734 23.4064 22.4999 22.53 22.4999 21.7114V10.1786C22.4999 8.33153 21.7661 6.56013 20.4601 5.25408C19.154 3.94802 17.3826 3.21429 15.5356 3.21429H14.9999Z"
        fill="#FFCF65"
      />
      <Path
        d="M10.7143 26.7824C10.7143 25.9299 11.0529 25.1123 11.6557 24.5095C12.2585 23.9067 13.0761 23.5681 13.9286 23.5681H17.1429C17.9953 23.5681 18.8129 23.9067 19.4157 24.5095C20.0185 25.1123 20.3571 25.9299 20.3571 26.7824C20.3571 27.6348 20.0185 28.4524 19.4157 29.0552C18.8129 29.658 17.9953 29.9967 17.1429 29.9967H13.9286C13.0761 29.9967 12.2585 29.658 11.6557 29.0552C11.0529 28.4524 10.7143 27.6348 10.7143 26.7824ZM0 13.9252C0 13.0727 0.338647 12.2552 0.941442 11.6524C1.54424 11.0496 2.3618 10.7109 3.21429 10.7109H8.03571V19.2824C8.03571 19.8507 7.80995 20.3957 7.40809 20.7976C7.00622 21.1995 6.46118 21.4252 5.89286 21.4252H3.21429C2.3618 21.4252 1.54424 21.0866 0.941442 20.4838C0.338647 19.881 0 19.0634 0 18.2109L0 13.9252ZM22.5 10.7109H26.7857C27.6382 10.7109 28.4558 11.0496 29.0586 11.6524C29.6614 12.2552 30 13.0727 30 13.9252V18.2109C30 19.0634 29.6614 19.881 29.0586 20.4838C28.4558 21.0866 27.6382 21.4252 26.7857 21.4252H22.5V10.7109Z"
        fill="#155D5F"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_625_2573">
        <Rect width="30" height="30" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const LiveChatSVG = () => (
  <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <Path
      d="M18.4308 5.875C20.2721 5.87457 22.0814 6.35562 23.6793 7.27042C25.2772 8.18521 26.608 9.50195 27.5398 11.0899C28.4716 12.6779 28.9719 14.482 28.9911 16.323C29.0102 18.1641 28.5476 19.9782 27.6491 21.5852L28.9421 24.967C29.0496 25.2481 29.0768 25.5536 29.0208 25.8493C28.9648 26.145 28.8278 26.4194 28.625 26.6417C28.4221 26.8641 28.1615 27.0257 27.8722 27.1086C27.5828 27.1915 27.2762 27.1923 26.9864 27.1111L22.9449 25.979C21.5139 26.6551 19.9491 27.0009 18.3664 26.9907C16.7837 26.9805 15.2235 26.6146 13.8013 25.9202C12.3791 25.2257 11.1312 24.2203 10.1499 22.9785C9.16869 21.7367 8.4792 20.2902 8.13246 18.7459C7.78572 17.2017 7.79061 15.5993 8.14676 14.0572C8.50292 12.5151 9.20122 11.0728 10.19 9.83697C11.1788 8.60116 12.4328 7.60346 13.8593 6.91766C15.2857 6.23186 16.8481 5.87553 18.4308 5.875Z"
      fill="#155D5F"
    />
    <Path
      d="M13.6197 1C11.7786 0.999854 9.96944 1.48111 8.37178 2.39602C6.77413 3.31094 5.44348 4.62769 4.51189 6.21564C3.5803 7.80359 3.08014 9.60753 3.06104 11.4485C3.04195 13.2894 3.50458 15.1033 4.40304 16.7102L3.11005 20.092C3.00256 20.3731 2.97529 20.6786 3.03129 20.9743C3.08729 21.27 3.22435 21.5444 3.42717 21.7667C3.63 21.9891 3.89062 22.1507 4.17996 22.2336C4.4693 22.3165 4.77598 22.3173 5.06578 22.2361L9.10557 21.104C10.5366 21.7801 12.1012 22.1258 13.6839 22.1157C15.2665 22.1055 16.8266 21.7397 18.2488 21.0453C19.671 20.3509 20.9189 19.3457 21.9002 18.104C22.8815 16.8623 23.571 15.4159 23.9179 13.8717C24.2647 12.3276 24.26 10.7252 23.904 9.18316C23.548 7.6411 22.8499 6.19879 21.8612 4.96292C20.8726 3.72705 19.6188 2.72923 18.1925 2.04328C16.7662 1.35732 15.2024 1.00077 13.6197 1Z"
      fill="#FFCF65"
    />
  </Svg>
);

export const SUPPORT_FAQS = [
  {
    id: "1",
    question: "How do I create a Wealthconomy account?",
    answer:
      "Simply download the app, click 'Create Account', and follow the prompts to enter your phone number and BVN for verification. You'll be up and running in minutes!",
  },
  {
    id: "2",
    question: "How can I reset my password?",
    answer:
      "Go to the login screen, click 'Forgot Password?', and enter your registered email. We'll send you a secure link to reset it. Make sure to choose a strong, unique password.",
  },
  {
    id: "3",
    question: "How can I withdraw my funds?",
    answer:
      "Select the portfolio you want to withdraw from, click 'Withdraw', and choose your linked bank account. Funds are typically processed within 24 hours back to your local bank.",
  },
  {
    id: "4",
    question: "How do I fund my Wealthconomy wallet?",
    answer:
      "You can fund your wallet via bank transfer to your unique virtual account number or by using your debit card directly in the app. Both options are instant and secure.",
  },
  {
    id: "5",
    question: "How can I update my KYC level?",
    answer:
      "Go to Account > Security Settings > KYC Verification. You can upgrade to Level 3 by providing a valid government ID and proof of address. This increases your transaction limits.",
  },
  {
    id: "6",
    question: "Is my money safe with Wealthconomy?",
    answer:
      "Yes, your funds are invested in low-risk financial instruments and protected by bank-grade security and encryption protocols. We use a PND-compliant infrastructure.",
  },
  {
    id: "7",
    question: "What are the investment cycles?",
    answer:
      "Investment cycles vary by portfolio. Wealth Flex is daily interest, while Wealth Fix and Goal have fixed tenures ranging from 30 days to 2 years, offering higher returns.",
  },
];

interface SupportCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: React.ReactNode;
  avatars?: React.ReactNode;
  loading?: boolean;
}

const SupportCard = ({
  title,
  subtitle,
  onPress,
  icon,
  avatars,
  loading,
}: SupportCardProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    disabled={loading}
    className="w-[174px] h-[67px] bg-[#EEF7F8] rounded-[15px] border-[0.7px] border-[#155D5F80] flex-row p-[10px] justify-between"
  >
    {loading ? (
      <View className="flex-1 justify-center space-y-2">
        <Skeleton width="80%" height={12} />
        <Skeleton width="50%" height={8} />
        {avatars && (
          <View className="mt-1">
            <Skeleton width={40} height={10} borderRadius={5} />
          </View>
        )}
      </View>
    ) : (
      <View className="flex-1 justify-center">
        <Text className="text-sm font-bold text-[#323232] leading-[14px]">
          {" "}
          {/* was text-[10px] */}
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-[#6B7280] mt-[2px]">{subtitle}</Text>
        ) : null}
        {avatars && <View className="mt-1">{avatars}</View>}
      </View>
    )}
    <View className="items-end justify-between">
      {loading ? (
        <View className="items-end space-y-2">
          <Skeleton width={24} height={24} circle />
        </View>
      ) : (
        <>
          <View className="-mt-[4px]">{icon}</View>
        </>
      )}
    </View>
  </TouchableOpacity>
);

export default function SupportCenterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ["support-blogs"],
    queryFn: () => blogService.getBlogs(),
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCall = () => {
    Linking.openURL("tel:07032424294");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <Header title="Customer Service Center" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between mb-6">
          <SupportCard
            title="Customer Support Hotline(24hours)"
            subtitle="07032424294"
            onPress={handleCall}
            icon={<HotlineSVG />}
            loading={loading}
          />
          <SupportCard
            title="Live Chat"
            subtitle=""
            onPress={() => router.push("/chat" as any)}
            icon={<LiveChatSVG />}
            loading={loading}
            avatars={
              <View className="flex-row">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
                  }}
                  className="w-4 h-4 rounded-full border border-white"
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                  }}
                  className="w-4 h-4 rounded-full border border-white -ml-2"
                />
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
                  }}
                  className="w-4 h-4 rounded-full border border-white -ml-2"
                />
              </View>
            }
          />
        </View>

        <View className="h-[1px] bg-[#E5E5E5] mb-6" />

        <View className="mb-8">
          <Text className="text-lg font-extrabold text-[#323232] mb-4">
            Popular Questions
          </Text>
          <View className="bg-[#F0F9F9] rounded-[20px] p-6">
            {loading ? (
              <View className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} width="90%" height={16} />
                ))}
              </View>
            ) : (
              SUPPORT_FAQS.map((faq, i) => (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() =>
                    router.push({
                      pathname: "/faq-detail",
                      params: { id: faq.id },
                    } as any)
                  }
                >
                  <Text className="text-sm text-[#408688] font-semibold mb-5 leading-5">
                    {i + 1}. {faq.question}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-extrabold text-[#323232]">
              Wise Up
            </Text>
            <TouchableOpacity onPress={() => router.push("/wise-up" as any)}>
              <Text className="text-[#155D5F] text-[13px] font-bold">
                View all
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-3 px-3"
          >
            {isLoadingBlogs ? (
              <WiseUpSkeleton />
            ) : (
              blogs?.map((blog: any) => (
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

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
