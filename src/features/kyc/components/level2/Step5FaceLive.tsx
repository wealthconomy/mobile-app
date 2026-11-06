import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";
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
import { suspendAppLock } from "@/src/store/slices/appStatusSlice";
import { ALLOW_KYC_PLACEHOLDERS } from "@/src/constants/kycDev";

interface Step5FaceLiveProps {
  onScanComplete: (photoUri: string, base64: string) => void;
  onBack?: () => void;
}

export const Step5FaceLive: React.FC<Step5FaceLiveProps> = ({
  onScanComplete,
  onBack,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [progressText, setProgressText] = useState(0);
  const progressWidth = useSharedValue(0);
  const cameraRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission?.granted]);

  const resetScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    progressWidth.value = 0;
    setProgressText(0);
    setIsScanning(false);
    setIsCapturing(false);
  };

  const finishScan = async () => {
    setIsCapturing(true);
    try {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.3,
          });
          if (photo?.uri) {
            let finalUri = photo.uri;
            let finalBase64: string | undefined;
            try {
              // Highly lightweight compression (320px width, 0.25 quality) -> ~15-20KB base64 payload
              const manipulated = await manipulateAsync(
                photo.uri,
                [{ resize: { width: 320 } }],
                { compress: 0.25, format: SaveFormat.JPEG, base64: true }
              );
              if (manipulated?.uri) {
                finalUri = manipulated.uri;
              }
              if (manipulated?.base64) {
                finalBase64 = manipulated.base64;
              }
            } catch {
              // fallback to raw photo uri
            }

            if (
              finalUri &&
              typeof finalUri === "string" &&
              finalUri.trim().length > 0 &&
              !finalUri.startsWith("http://") &&
              !finalUri.startsWith("https://") &&
              finalBase64 &&
              finalBase64.trim().length > 0
            ) {
              onScanComplete(finalUri, finalBase64);
              return;
            }
          }
        } catch {
          // selfie capture failed
        }
      }

      if (__DEV__ && ALLOW_KYC_PLACEHOLDERS) {
        onScanComplete("file:///mock_face_selfie.jpg", "mock_base64_string");
        return;
      }

      resetScan();
      Alert.alert(
        "Capture Failed",
        "We couldn't capture your face. Please try again."
      );
    } finally {
      suspendAppLock(false);
    }
  };

  const handleStartScan = async () => {
    if (isScanning || isCapturing) return;

    if (!permission?.granted) {
      let currentPerm = permission;
      if (!currentPerm?.granted && currentPerm?.canAskAgain) {
        currentPerm = await requestPermission();
      }
      if (!currentPerm?.granted) {
        Alert.alert(
          "Camera Access Needed",
          "Camera access is needed for face verification. Please open settings and enable camera access.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    suspendAppLock(true);
    setIsScanning(true);
    setProgressText(0);
    progressWidth.value = 0;

    progressWidth.value = withTiming(
      100,
      {
        duration: 2500,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishScan)();
        }
      }
    );

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgressText((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 100;
        }
        return prev + 4;
      });
    }, 100);
  };

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", position: "relative" }}>
      {/* Live Front Camera */}
      {permission?.granted ? (
        <CameraView
          ref={cameraRef}
          facing="front"
          style={{ width: "100%", height: "100%", position: "absolute" }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#0F172A",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            position: "absolute",
          }}
        >
          <Ionicons name="camera-outline" size={48} color="#2CC0C5" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "white",
              marginTop: 14,
              textAlign: "center",
            }}
          >
            Camera Access Needed
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#94A3B8",
              marginTop: 6,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Camera access is needed to capture your face for live verification.
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (permission?.canAskAgain) {
                requestPermission();
              } else {
                Linking.openSettings();
              }
            }}
            activeOpacity={0.8}
            style={{
              marginTop: 18,
              backgroundColor: "#2CC0C5",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#0F172A", fontWeight: "700", fontSize: 14 }}>
              {permission?.canAskAgain ? "Enable Camera" : "Open Settings"}
            </Text>
          </TouchableOpacity>
        </View>
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
          {isScanning
            ? "Hold still, scanning face..."
            : "Please look into the camera and position your face"}
        </Text>
      </LinearGradient>

      {/* Center Face Framing Corner Brackets */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <FaceFramingBrackets width={260} height={300} />
      </View>

      {/* Bottom Gradient Overlay & Controls */}
      <LinearGradient
        colors={["transparent", "rgba(15, 30, 35, 0.65)", "rgba(15, 30, 35, 0.94)"]}
        style={{
          paddingTop: 36,
          paddingHorizontal: 24,
          paddingBottom: 44,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {isScanning ? (
          <>
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
              Keep your hand steady,{"\n"}you are almost there!
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
          </>
        ) : (
          <>
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "500",
                textAlign: "center",
                lineHeight: 26,
                marginBottom: 24,
              }}
            >
              Align your face within the brackets{"\n"}and tap when ready
            </Text>

            {/* Biometric Shutter Button */}
            <TouchableOpacity
              onPress={handleStartScan}
              disabled={isCapturing}
              activeOpacity={0.8}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                borderWidth: 4,
                borderColor: "rgba(255, 255, 255, 0.9)",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(44, 192, 197, 0.2)",
                shadowColor: "#2CC0C5",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: "#2CC0C5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="camera" size={30} color="white" />
              </View>
            </TouchableOpacity>

            <Text
              style={{
                color: "#94A3B8",
                fontSize: 13,
                fontWeight: "500",
                marginTop: 14,
              }}
            >
              Tap to capture face
            </Text>
          </>
        )}
      </LinearGradient>
    </View>
  );
};
