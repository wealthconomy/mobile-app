import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { BiometricTargetRings, KycSectionHeader, KycButton } from "@/src/components/common";

interface Step4FaceIntroProps {
  onStartScanning: () => void;
  onBack?: () => void;
}

export const Step4FaceIntro: React.FC<Step4FaceIntroProps> = ({
  onStartScanning,
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 22,
        paddingTop: 16,
      }}
    >
      {/* Main Center Content exactly matching Image 3 (Face Recognition) */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {/* 5-Layer Concentric Teal Rings Target with Shimmer & Brackets */}
        <BiometricTargetRings showShimmer={true}>
          {/* Smiling Face SVG Icon */}
          <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            {/* Left Eye */}
            <Circle cx="8" cy="9.5" r="1.4" fill="white" />
            {/* Right Eye */}
            <Circle cx="16" cy="9.5" r="1.4" fill="white" />
            {/* Smile */}
            <Path
              d="M8 15 C10.2 17.6 13.8 17.6 16 15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </BiometricTargetRings>

        {/* Title & Subtitle exactly matching Image 3 */}
        <KycSectionHeader
          title="Face Recognition"
          subtitle="Scan your face to verify your identity"
          subtitleStyle={{ lineHeight: 22 }}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Start Scanning Button exactly matching Image 3 */}
      <KycButton
        title="Start scanning"
        onPress={onStartScanning}
        style={{ marginBottom: 36 }}
      />
    </View>
  );
};

