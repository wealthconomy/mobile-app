import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Linking } from "react-native";
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
import * as ImagePicker from "expo-image-picker";
import { suspendAppLock } from "@/src/store/slices/appStatusSlice";
import { FaceFramingBrackets, KycButton } from "@/src/components/common";
import { ALLOW_KYC_PLACEHOLDERS } from "@/src/constants/kycDev";

interface Step2ScanIdProps {
  onStartScanning: (photoUri: string) => void;
  onBack?: () => void;
}

const THEME_TEAL = "#155D5F";

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
    suspendAppLock(true);
    try {
      if (!permission?.granted) {
        let currentPerm = permission;
        if (!currentPerm?.granted && currentPerm?.canAskAgain) {
          currentPerm = await requestPermission();
        }
        if (!currentPerm?.granted) {
          Alert.alert(
            "Camera Access Needed",
            "Camera access is needed to capture your ID. Please open settings and enable camera access.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.6,
          });
          if (photo?.uri) {
            let finalUri = photo.uri;
            try {
              const manipulated = await manipulateAsync(
                photo.uri,
                [{ resize: { width: 1000 } }],
                { compress: 0.7, format: SaveFormat.JPEG }
              );
              if (manipulated?.uri) {
                finalUri = manipulated.uri;
              }
            } catch {
              // Ignore manipulation error and use raw photo
            }

            // Must be a non-empty, local file URI (never http/https)
            if (
              finalUri &&
              typeof finalUri === "string" &&
              finalUri.trim().length > 0 &&
              !finalUri.startsWith("http://") &&
              !finalUri.startsWith("https://")
            ) {
              setCapturedUri(finalUri);
              setTimeout(() => {
                onStartScanning(finalUri);
              }, 800);
              return;
            }
          }
        } catch {
          // Camera capture error handled by failure alert below
        }
      }

      if (__DEV__ && ALLOW_KYC_PLACEHOLDERS) {
        onStartScanning("file:///mock_id_card.jpg");
        return;
      }

      Alert.alert(
        "Capture Failed",
        "We couldn't capture the photo. Please try again."
      );
    } finally {
      suspendAppLock(false);
    }
  };

  const handlePickFromGallery = async () => {
    suspendAppLock(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const pickedUri = result.assets[0].uri;
        let finalUri = pickedUri;
        try {
          const manipulated = await manipulateAsync(
            pickedUri,
            [{ resize: { width: 1000 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
          );
          if (manipulated?.uri) {
            finalUri = manipulated.uri;
          }
        } catch {
          finalUri = pickedUri;
        }

        if (
          finalUri &&
          typeof finalUri === "string" &&
          finalUri.trim().length > 0 &&
          !finalUri.startsWith("http://") &&
          !finalUri.startsWith("https://")
        ) {
          setCapturedUri(finalUri);
          setTimeout(() => {
            onStartScanning(finalUri);
          }, 600);
          return;
        }
      }
    } catch {
      // Pick gallery cancelled or failed
    } finally {
      suspendAppLock(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 22, paddingTop: 16 }}>
      {/* Main Center Content */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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

        {/* Scan Card Outer Frame */}
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
          {/* Live camera feed */}
          {permission?.granted && !capturedUri && (
            <CameraView
              ref={cameraRef}
              facing="back"
              style={{ width: "100%", height: "100%", position: "absolute" }}
            />
          )}

          {!permission?.granted && !capturedUri && (
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#C4C9D4",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <Ionicons name="camera-outline" size={44} color="#155D5F" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#155D5F",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                Camera access is needed to capture your ID
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#475569",
                  marginTop: 6,
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                Please allow camera access to take a photo of your government ID document.
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
                  marginTop: 16,
                  backgroundColor: "#155D5F",
                  paddingHorizontal: 22,
                  paddingVertical: 12,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
                  {permission?.canAskAgain ? "Enable Camera" : "Open Settings"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {capturedUri ? (
            <Image
              source={{ uri: capturedUri }}
              style={{ width: "100%", height: "100%", position: "absolute" }}
              resizeMode="cover"
            />
          ) : null}

          {/* Center White Brackets Framing Viewport */}
          <FaceFramingBrackets
            width={290}
            height={260}
            bracketWidth={32}
            bracketHeight={32}
            strokeWidth={5}
            containerStyle={{ overflow: "hidden" }}
          >
            {/* Animated Cyan Scan Line */}
            {!capturedUri && permission?.granted && (
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

      {/* Start Scanning Button */}
      <KycButton
        title={capturedUri ? "ID Captured!" : "Take Photo of ID"}
        onPress={handleCapture}
        style={{ marginBottom: 12 }}
      />

      {/* Option to upload from Photo Gallery */}
      <TouchableOpacity
        onPress={handlePickFromGallery}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          gap: 6,
          marginBottom: 24,
        }}
      >
        <Ionicons name="images-outline" size={18} color={THEME_TEAL} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: THEME_TEAL }}>
          Upload ID from Gallery
        </Text>
      </TouchableOpacity>
    </View>
  );
};
