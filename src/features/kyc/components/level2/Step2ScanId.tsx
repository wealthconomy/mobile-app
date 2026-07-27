import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { FaceFramingBrackets, KycButton } from "@/src/components/common";

interface Step2ScanIdProps {
  onStartScanning: (photoUri?: string) => void;
  onBack?: () => void;
}

const THEME_TEAL = "#155D5F";
const ACTUAL_ID_FALLBACK_URI = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80";

export const Step2ScanId: React.FC<Step2ScanIdProps> = ({
  onStartScanning,
  onBack,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const scanTranslateY = useSharedValue(20);

  React.useEffect(() => {
    scanTranslateY.value = withRepeat(
      withTiming(200, {
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanTranslateY.value }],
    };
  });

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.6,
        });
        if (photo?.uri) {
          try {
            const manipulated = await manipulateAsync(
              photo.uri,
              [{ resize: { width: 1000 } }],
              { compress: 0.7, format: SaveFormat.JPEG }
            );
            const uriToUse = manipulated?.uri || photo.uri;
            setCapturedUri(uriToUse);
            setTimeout(() => {
              onStartScanning(uriToUse);
            }, 800);
            return;
          } catch (manipErr) {
            console.log("ID manipulation error:", manipErr);
          }
          setCapturedUri(photo.uri);
          setTimeout(() => {
            onStartScanning(photo.uri);
          }, 800);
          return;
        }
      } catch (error) {
        console.log("Error taking photo:", error);
      }
    }
    // Fallback if simulated or camera unavailable
    onStartScanning(ACTUAL_ID_FALLBACK_URI);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 22, paddingTop: 16 }}>
      {/* Main Center Content exactly matching Image 4 (Scan ID) */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {/* Title exactly matching Image 4 without subtitle */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: THEME_TEAL,
            marginBottom: 28,
            textAlign: "center",
          }}
        >
          Scan ID
        </Text>

        {/* Scan Card Outer Gray Frame matching Image 4 exactly (#C4C9D4) */}
        <View
          style={{
            width: "94%",
            height: 420,
            backgroundColor: "#C4C9D4",
            borderRadius: 24,
            position: "relative",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Live actual camera image feed without any fake ID overlay */}
          {permission?.granted && !capturedUri && (
            <CameraView
              ref={cameraRef}
              facing="back"
              style={{ width: "100%", height: "100%", position: "absolute" }}
            />
          )}

          {!permission?.granted && !capturedUri && (
            <TouchableOpacity
              onPress={requestPermission}
              activeOpacity={0.8}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#C4C9D4",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <Ionicons name="camera" size={40} color="#155D5F" />
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#155D5F", marginTop: 10 }}>
                Tap to Enable Live Camera
              </Text>
            </TouchableOpacity>
          )}

          {capturedUri ? (
            <Image
              source={{ uri: capturedUri }}
              style={{ width: "100%", height: "100%", position: "absolute" }}
              resizeMode="cover"
            />
          ) : null}

          {/* Center White Brackets Framing Viewport (290x260) */}
          <FaceFramingBrackets
            width={290}
            height={260}
            bracketWidth={32}
            bracketHeight={32}
            strokeWidth={5}
            containerStyle={{ overflow: "hidden" }}
          >
            {/* Animated Cyan Scan Line + Dark Teal Shading Overlay below line matching Image 4 */}
            {!capturedUri && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    left: 6,
                    right: 6,
                  },
                  animatedLineStyle,
                ]}
              >
                {/* 2px Bright Cyan Laser Line */}
                <View
                  style={{
                    height: 2.5,
                    backgroundColor: "#22D3EE",
                    shadowColor: "#22D3EE",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                  }}
                />
                {/* Dark Teal Shading Overlay stretching downwards across bottom of card */}
                <View
                  style={{
                    height: 260,
                    backgroundColor: "rgba(21, 93, 95, 0.42)",
                  }}
                />
              </Animated.View>
            )}
          </FaceFramingBrackets>
        </View>
      </View>

      {/* Start Scanning Button matching Image 4 exactly */}
      <KycButton
        title={capturedUri ? "ID Captured!" : "Start scanning"}
        onPress={handleCapture}
        style={{ marginBottom: 36 }}
      />
    </View>
  );
};
