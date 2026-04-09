import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { completeOnboarding } from "../src/store/slices/authSlice";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const sx = (px: number) => (px / 402) * SCREEN_W;
const sy = (px: number) => (px / 842) * SCREEN_H;

const PRIMARY = "#155D5F";
const CREAM = "#FFFBF3";
const DARK = "#323232";
const SECONDARY = "#6B7280";
const CIRCLE_BG = "#D0DFDF80";

type Seg = { t: string; b?: boolean };

type SlideData = {
  id: string;
  type: "splash" | "slide";
  image?: any;
  highlight?: string;
  rest?: string;
  segments?: Seg[];
};

const SLIDES: SlideData[] = [
  { id: "0", type: "splash" },
  {
    id: "1",
    type: "slide",
    image: require("../assets/images/onboarding-1.png"),
    highlight: "Win",
    rest: " Up",
    segments: [
      { t: "Save Purposefully & Win Financially. ", },
 
    ],
  },
  {
    id: "2",
    type: "slide",
    image: require("../assets/images/onboarding-2.png"),
    highlight: "Wise",
    rest: " Up",
    segments: [
      { t: "Learn & Get Smart About Money" },
     
    ],
  },
  {
    id: "3",
    type: "slide",
    image: require("../assets/images/onboarding-3.png"),
    highlight: "Wealth",
    rest: " Up",
    segments: [
      { t: " Build Wealth Confidently &\n Be Boundless " },
    ],
  },
];

const Description = ({ segments }: { segments: Seg[] }) => (
  <Text
    style={{
      textAlign: "center",
      fontSize: sx(15), // increased from 13
      lineHeight: sy(24),
      marginTop: -15, // moves it up, adjust this number as needed
    }}
  >
    {segments.map((seg, i) => (
      <Text
        key={i}
        style={{
          color: "#323232",
          fontWeight: seg.b ? "800" : "400",
        }}
      >
        {seg.t}
      </Text>
    ))}
  </Text>
);
const GradientCard = ({
  children,
  height,
}: {
  children: React.ReactNode;
  height: number;
}) => (
  <LinearGradient
    colors={["#FFCF65", "rgba(255,193,7,0)", "rgba(102,102,102,0)"]}
    locations={[0, 0.0818, 1]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={{
      position: "absolute",
      width: sx(346),
      height,
      top: sy(390),
      left: sx(28),
      borderRadius: 22,
      padding: 2,
    }}
  >
    <View
      style={{
        flex: 1,
        borderRadius: 20,
        backgroundColor: CREAM,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sx(20),
        gap: sy(10),
      }}
    >
      {children}
    </View>
  </LinearGradient>
);

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { setCredentials } = require("../src/store/slices/authSlice");

  const goTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ animated: true, index });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goTo(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    dispatch(completeOnboarding());
    router.replace("/(auth)/login");
  };

  const handleSkipToHome = () => {
    dispatch(completeOnboarding());
    // Directly set mock credentials to bypass login
    dispatch(
      setCredentials({ user: { name: "Developer Mode" }, token: "dev-token" }),
    );
    router.replace("/(tabs)");
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentIndex(index);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentIndex(index);
  };

  const renderSplash = () => (
    <View
      style={{ width: SCREEN_W, height: SCREEN_H, backgroundColor: PRIMARY }}
    >
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Logo image */}
      <Image
        source={require("../assets/images/logo1.png")}
        style={{
          position: "absolute",
          width: sx(281),
          height: sy(250),
          top: sy(180),
          left: sx(61),
        }}
        resizeMode="contain"
      />

      {/* Tagline text under logo */}
      <Text
        style={{
          position: "absolute",
          top: sy(380),
          left: sx(28),
          right: sx(28),
          fontSize: sx(15),
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: sy(22),
        }}
      >
        <Text style={{ fontWeight: "800" }}>Build Wealth...The Smart Way</Text>
      </Text>

      {/* Skip Button (Temporary for development) */}
      <TouchableOpacity
        onPress={handleSkipToHome}
        style={{
          position: "absolute",
          top: sy(55),
          right: sx(28),
          zIndex: 100,
          backgroundColor: "rgba(255,255,255,0.2)",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: sx(13) }}>
          Skip to Home
        </Text>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.85}
        style={{
          position: "absolute",
          width: sx(346),
          height: sy(50),
          top: sy(750),
          left: sx(28),
          borderRadius: 15,
          backgroundColor: "#FFFFFF",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 9,
          paddingHorizontal: 21,
        }}
      >
        <Text style={{ color: DARK, fontWeight: "700", fontSize: sx(16) }}>
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSlide = (item: SlideData) => {
    if (!item.image) return null;
    const slideIndex = parseInt(item.id);
    const isLast = item.id === "3";

    return (
      <View
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          backgroundColor: "#FFFFFF",
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

        {/* Skip */}
        <TouchableOpacity
          onPress={handleFinish}
          style={{
            position: "absolute",
            top: sy(55),
            right: sx(28),
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: "rgba(0, 0, 0, 0.75)",
              fontSize: sx(15),
              fontWeight: "500",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>

        {/* Oval background */}
        <View
          style={{
            position: "absolute",
            width: sx(281),
            height: sy(250),
            top: sy(250),
            left: sx(61),
            borderRadius: 10000,
            backgroundColor: CIRCLE_BG,
          }}
        />

        {/* Slide image */}
        <Image
          source={item.image}
          style={{
            position: "absolute",
            width: sx(281),
            height: sy(280),
            top: sy(109),
            left: sx(61),
          }}
          resizeMode="contain"
        />

        {/* Card container */}
        <GradientCard height={sy(210)}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: sx(6),
            }}
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  height: sy(4),
                  top: -40,
                  borderRadius: 4,
                  width: i === slideIndex ? sx(28) : sx(8),
                  backgroundColor: i === slideIndex ? PRIMARY : "#C5C5C5",
                }}
              />
            ))}
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: sx(34),
              top: -25,
              fontWeight: "800",
              textAlign: "center",
              color: DARK,
            }}
          >
            <Text style={{ color: PRIMARY }}>{item.highlight}</Text>
            <Text style={{ fontWeight: "400" }}>{item.rest}</Text>
          </Text>

          {/* Description */}
          {item.segments && <Description segments={item.segments} />}
        </GradientCard>

        {/* Next / Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={{
            position: "absolute",
            width: sx(346),
            height: sy(50),
            top: sy(750),
            left: sx(28),
            borderRadius: 15,
            backgroundColor: PRIMARY,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            paddingVertical: 9,
            paddingHorizontal: 21,
          }}
        >
          <Text
            style={{ color: "#FFFFFF", fontWeight: "700", fontSize: sx(16) }}
          >
            {isLast ? "Get Started" : "Next  →"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: SlideData }) => {
    if (item.type === "splash") return renderSplash();
    return renderSlide(item);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: currentIndex === 0 ? PRIMARY : "#FFFFFF",
      }}
      edges={["bottom"]}
    >
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}
