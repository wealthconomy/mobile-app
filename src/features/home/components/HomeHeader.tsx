import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

export const NotificationIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill="#155D5F"
    />
  </Svg>
);

export const CustomerSupportIcon = () => (
  <Svg width="14" height="18" viewBox="0 0 14 18" fill="none">
    <Path
      d="M7 13.5C6.49719 13.5001 6.01279 13.3108 5.64327 12.9698C5.27375 12.6289 5.04622 12.1612 5.006 11.66C3.67219 11.1879 2.54805 10.2597 1.83202 9.03936C1.116 7.81901 0.854122 6.38493 1.09263 4.99027C1.33113 3.59561 2.05467 2.33005 3.13554 1.41698C4.21641 0.503917 5.5851 0.00206045 7 0C8.50489 -0.000218052 9.95492 0.565087 11.0626 1.58383C12.1702 2.60256 12.8546 4.00034 12.98 5.5C12.9842 5.56505 12.9748 5.63026 12.9524 5.69148C12.93 5.7527 12.8952 5.8086 12.85 5.85562C12.8049 5.90264 12.7504 5.93976 12.6902 5.96461C12.6299 5.98947 12.5652 6.00152 12.5 6C12.3661 5.99664 12.2381 5.94361 12.1411 5.8512C12.0441 5.7588 11.9849 5.63362 11.975 5.5C11.8859 4.61584 11.5628 3.77138 11.039 3.05357C10.5151 2.33576 9.80942 1.77054 8.99453 1.41609C8.17964 1.06163 7.28501 0.930763 6.40274 1.03694C5.52046 1.14313 4.68243 1.48252 3.97491 2.0202C3.26739 2.55787 2.71594 3.2744 2.37735 4.096C2.03876 4.9176 1.92525 5.8146 2.04851 6.69465C2.17177 7.5747 2.52734 8.406 3.07863 9.10297C3.62991 9.79994 4.35699 10.3374 5.185 10.66C5.33566 10.3345 5.57111 10.0554 5.86667 9.85213C6.16224 9.64885 6.50703 9.5288 6.86493 9.50457C7.22283 9.48033 7.58067 9.55281 7.90093 9.71439C8.2212 9.87597 8.49212 10.1207 8.68529 10.423C8.87846 10.7253 8.98679 11.0739 8.99891 11.4324C9.01103 11.7909 8.9265 12.1461 8.75418 12.4607C8.58186 12.7754 8.32809 13.0379 8.01947 13.2207C7.71084 13.4035 7.35872 13.5 7 13.5ZM2.009 11H2.1C2.69036 11.5791 3.37866 12.0491 4.133 12.388C4.35469 13.1194 4.84719 13.7387 5.50997 14.1193C6.17274 14.5 6.95581 14.6133 7.6993 14.4362C8.44279 14.259 9.09064 13.8048 9.51059 13.1662C9.93054 12.5276 10.0909 11.7528 9.959 11H12C12.5304 11 13.0391 11.2107 13.4142 11.5858C13.7893 11.9609 14 12.4696 14 13C14 14.691 13.167 15.966 11.865 16.797C10.583 17.614 8.855 18 7 18C5.145 18 3.417 17.614 2.135 16.797C0.833 15.967 0 14.69 0 13C0 11.887 0.903 11 2.009 11ZM11 6C11.0002 6.67664 10.8288 7.34227 10.5017 7.93463C10.1747 8.52698 9.70273 9.02669 9.13 9.387C8.85108 9.10589 8.51926 8.88278 8.15368 8.73054C7.78811 8.5783 7.39601 8.49995 7 8.5C6.60399 8.49995 6.21189 8.5783 5.84632 8.73054C5.48074 8.88278 5.14892 9.10589 4.87 9.387C4.11042 8.90932 3.53351 8.19012 3.232 7.345C3.07818 6.91327 2.99971 6.45831 3 6C3 4.93913 3.42143 3.92172 4.17157 3.17157C4.92172 2.42143 5.93913 2 7 2C8.06087 2 9.07828 2.42143 9.82843 3.17157C10.5786 3.92172 11 4.93913 11 6Z"
      fill="#155D5F"
    />
  </Svg>
);

export const HomeHeader = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const notificationCount = 3;

  return (
    <View className="flex-row justify-between items-center mb-5 ml-[10px]">
      {/* Left: Greeting */}
      <View>
        <Text className="text-[#6B7280] text-[13px] font-medium">
          Hello, WealthBuilder!
        </Text>
        <Text className="text-[#323232] text-[20px] font-extrabold tracking-[-0.5px]">
          {user?.name || "Simon"}
        </Text>
      </View>

      {/* Right: Notification + Support */}
      <View className="flex-row items-center space-x-3">
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={() => router.push("/notifications" as any)}
          className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center relative mr-3"
        >
          <NotificationIcon />
          {notificationCount > 0 && (
            <View className="absolute -top-[7px] -right-[6px] w-4 h-4 rounded-full bg-[#F44336] border-[1.5px] border-white items-center justify-center">
              <Text className="text-white text-[8px] font-bold">
                {notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Customer Support */}
        <TouchableOpacity
          onPress={() => router.push("/support" as any)}
          className="w-10 h-10 rounded-full bg-[#F5F5F5] items-center justify-center mr-1"
        >
          <CustomerSupportIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};
