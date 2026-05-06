import { useRouter } from "expo-router";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#155D5F";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const CHECK_LIGHT = "#59AFAF";

export default function SuccessScreen() {
  const router = useRouter();

  const handleLetsGo = () => {
    // Replace entire stack so user can't go back to reset flow
    router.replace("/(auth)/login" as any);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 40,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Success Image (Confetti) - Move to upper part */}
      <Animated.View
        entering={FadeInUp.duration(700).delay(100)}
        style={{
          marginTop: 60, // Push to upper part
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        {/* Confetti Image (Background) */}
        <Image
          source={require("../../assets/images/success.png")}
          style={{ width: 300, height: 300, position: "absolute" }}
          resizeMode="contain"
        />

        {/* Custom Checkmark Circle */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#E7EFEF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          {/* Checkmark composed of two rectangles */}
          <View style={{ width: 60, height: 45, position: "relative" }}>
            {/* Shorter part (Left side) - Defined first to be at base */}
            <View
              style={{
                width: 30,
                height: 19,
                backgroundColor: CHECK_LIGHT,
                borderRadius: 4,
                position: "absolute",
                bottom: 10,
                right: 28,
                transform: [{ rotate: "50.52deg" }],
              }}
            />
            {/* Longer part (Right side) - Overlaying the short one */}
            <View
              style={{
                width: 60,
                height: 19,
                backgroundColor: PRIMARY,
                borderRadius: 4,
                position: "absolute",
                top: 15,
                left: 14,
                transform: [{ rotate: "138deg" }],
              }}
            />
          </View>
        </View>
      </Animated.View>

      {/* Text Content */}
      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={{ alignItems: "center", width: "100%", marginBottom: 40 }}>
        {/* Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: PRIMARY,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Yes! You Did It.
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            color: SECONDARY,
            fontSize: 16,
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          Welcome to a journey of purposeful{"\n"}
          <Text style={{ color: DARK, fontWeight: "bold" }}>
            Wealth Building!
          </Text>
        </Text>
      </Animated.View>

      {/* Let's Go Button */}
      <Animated.View entering={FadeInDown.duration(600).delay(500)} style={{ width: "100%" }}>
      <TouchableOpacity
        onPress={handleLetsGo}
        style={{
          backgroundColor: PRIMARY,
          borderRadius: 12,
          paddingVertical: 18,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
          Let's Go!
        </Text>
      </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
