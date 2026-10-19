import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { FaceFramingBrackets } from "@/src/components/common";

interface Step5FaceLiveProps {
  onScanComplete: (photoUri?: string, base64?: string) => void;
  onBack?: () => void;
}

const { width, height } = Dimensions.get("window");

export const Step5FaceLive: React.FC<Step5FaceLiveProps> = ({
  onScanComplete,
  onBack,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [progressText, setProgressText] = useState(0);
  const progressWidth = useSharedValue(0);
  const cameraRef = useRef<any>(null);

  const finishScan = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.2,
          base64: true,
        });
        if (photo?.uri) {
          try {
            const manipulated = await manipulateAsync(
              photo.uri,
              [{ resize: { width: 320 } }],
              { compress: 0.3, format: SaveFormat.JPEG, base64: true }
            );
            if (manipulated?.uri && manipulated?.base64) {
              onScanComplete(manipulated.uri, manipulated.base64);
              return;
            }
          } catch (manipErr) {
            console.log("Selfie manipulation error, using fallback:", manipErr);
          }
          if (photo.base64) {
            onScanComplete(photo.uri, photo.base64);
            return;
          }
        }
      } catch (err) {
        console.log("Selfie capture err:", err);
      }
    }
    onScanComplete();
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    progressWidth.value = withTiming(
      100,
      {
        duration: 3800,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishScan)();
        }
      }
    );

    const interval = setInterval(() => {
      setProgressText((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [permission?.granted]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", position: "relative" }}>
      {/* Live Front Camera or High-Fidelity Portrait Fallback */}
      {permission?.granted ? (
        <CameraView
          ref={cameraRef}
          facing="front"
          style={{ width: "100%", height: "100%", position: "absolute" }}
        />
      ) : (
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
          }}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode="cover"
        />
      )}

      {/* Subtle back navigation */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 20,
          }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Top Gradient Overlay matching Image 2 */}
      <LinearGradient
        colors={["rgba(15, 30, 35, 0.85)", "rgba(15, 30, 35, 0.45)", "transparent"]}
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 48,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: "white",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          Face Recognition
        </Text>
        <Text
          style={{
            fontSize: 14.5,
            color: "#E2E8F0",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          Please look into the camera and hold still
        </Text>
      </LinearGradient>

      {/* Center Face Framing Corner Brackets exactly matching Image 2 */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <FaceFramingBrackets width={260} height={300} />
      </View>

      {/* Bottom Gradient Overlay & Progress exactly matching Image 2 */}
      <LinearGradient
        colors={["transparent", "rgba(15, 30, 35, 0.65)", "rgba(15, 30, 35, 0.92)"]}
        style={{
          paddingTop: 48,
          paddingHorizontal: 24,
          paddingBottom: 44,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "500",
            textAlign: "center",
            lineHeight: 30,
            marginBottom: 40,
          }}
        >
          Keep you hand steady,{"\n"}you are almost there!
        </Text>

        <Text
          style={{
            color: "white",
            fontSize: 16.5,
            fontWeight: "500",
            marginBottom: 14,
          }}
        >
          {Math.min(progressText, 100)}% Recognition
        </Text>

        {/* Progress Bar Wrapper with Neon Glow Effect matching Image 2 */}
        <View style={{ width: "100%", position: "relative" }}>
          {/* Track background */}
          <View
            style={{
              width: "100%",
              height: 10,
              backgroundColor: "#E2E8F0",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={[
                {
                  height: "100%",
                  backgroundColor: "#2CC0C5",
                  borderRadius: 5,
                },
                animatedProgressStyle,
              ]}
            />
          </View>

          {/* Intense Downward Neon Cyan Glow Aura underneath active fill */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#2CC0C5",
                shadowColor: "#2CC0C5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 18,
                elevation: 15,
                zIndex: -1,
              },
              animatedProgressStyle,
            ]}
          />
        </View>
      </LinearGradient>
    </View>
  );
};
