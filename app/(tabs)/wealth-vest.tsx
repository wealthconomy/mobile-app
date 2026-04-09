import { StatusBar } from "expo-status-bar";
import { Dimensions, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function WealthVestScreen() {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1 }}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />

      {/* Background Image with Opacity */}
      <View className="absolute inset-0 items-center justify-center">
        <Image
          source={require("../../assets/images/success.png")}
          style={{ width: 300, height: 500, opacity: 0.2 }}
          resizeMode="cover"
        />
      </View>

      <View className="flex-1 items-center justify-center px-8">
      {/* Coming Soon Graphic */}
<View style={{ position: "relative", width: 280, height: 260, marginBottom: -15 }}>
  <Image
    source={require("../../assets/images/coming.png")}
    style={{ width: 280, height: 260 }}
    resizeMode="contain"
  />
  {/* Rocket — bottom left */}
  <View style={{ position: "absolute", bottom: 40, right: -10 }}>
    <Svg width="57" height="57" viewBox="0 0 57 57" fill="none">
      <Path
        d="M1.5835 26.9193L14.2502 15.8359L39.5835 17.4193L41.1668 42.7526L30.0835 55.4193C30.0835 55.4193 30.0851 45.9209 20.5835 36.4193C11.0819 26.9177 1.5835 26.9193 1.5835 26.9193Z"
        fill="#A0041E"
      />
      <Path
        d="M1.54056 55.4145C1.54056 55.4145 1.48356 42.7811 6.26681 37.9978C11.0501 33.2146 23.75 33.5439 23.75 33.5439C23.75 33.5439 23.7484 45.9145 18.9984 50.6645C14.2484 55.4145 1.54056 55.4145 1.54056 55.4145Z"
        fill="#FFAC33"
      />
      <Path
        d="M14.2484 49.0807C17.7462 49.0807 20.5817 46.2452 20.5817 42.7474C20.5817 39.2496 17.7462 36.4141 14.2484 36.4141C10.7506 36.4141 7.91504 39.2496 7.91504 42.7474C7.91504 46.2452 10.7506 49.0807 14.2484 49.0807Z"
        fill="#FFCC4D"
      />
      <Path
        d="M56.9986 0C56.9986 0 41.1652 0 22.1652 15.8333C12.6652 23.75 12.6652 38 15.8319 41.1667C18.9986 44.3333 33.2486 44.3333 41.1652 34.8333C56.9986 15.8333 56.9986 0 56.9986 0Z"
        fill="#55ACEE"
      />
      <Path
        d="M42.7483 7.91406C41.5298 7.9163 40.3377 8.27003 39.3152 8.93281C38.2926 9.5956 37.483 10.5393 36.9834 11.6507C37.7994 11.2789 38.685 11.0847 39.5816 11.0807C41.2614 11.0807 42.8723 11.748 44.06 12.9357C45.2477 14.1234 45.915 15.7344 45.915 17.4141C45.915 18.3419 45.7044 19.2175 45.3466 20.0107C46.4587 19.5126 47.403 18.7035 48.0657 17.6809C48.7284 16.6584 49.0812 15.4659 49.0816 14.2474C49.0816 12.5677 48.4144 10.9568 47.2267 9.76905C46.0389 8.58132 44.428 7.91406 42.7483 7.91406Z"
        fill="black"
      />
      <Path
        d="M12.6665 44.3297C12.6665 44.3297 12.6665 37.9963 14.2498 36.413C15.8332 34.8297 34.8348 18.9979 36.4165 20.5797C37.9983 22.1614 22.1649 41.163 20.5816 42.7463C18.9983 44.3297 12.6665 44.3297 12.6665 44.3297Z"
        fill="#A0041E"
      />
    </Svg>
  </View>
</View>

      <Text className="text-[#323232] text-[28px] font-bold text-center mb-5">
  The Future of{"\n"}Wealth is Vesting 🥳
</Text>

        <View className="space-y-6">
          <Text className="text-[#484848] text-[14px] text-center font-bold leading-6">
            Move beyond saving. Start owning. WealthVest is coming to help you
            invest confidently in vetted, high-growth opportunities.
          </Text>

        </View>
      </View>
    </SafeAreaView>
  );
}
