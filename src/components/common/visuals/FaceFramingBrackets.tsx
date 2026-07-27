import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";

export interface FaceFramingBracketsProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  bracketWidth?: number;
  bracketHeight?: number;
  strokeWidth?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FaceFramingBrackets: React.FC<FaceFramingBracketsProps> = ({
  children,
  width = 260,
  height = 300,
  bracketWidth = 38,
  bracketHeight = 38,
  strokeWidth = 4,
  containerStyle,
}) => {
  return (
    <View
      style={[
        {
          width,
          height,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
        },
        containerStyle,
      ]}
    >
      {/* Top Left Bracket */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: bracketWidth,
          height: bracketHeight,
          borderTopWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderColor: "white",
          borderTopLeftRadius: 4,
        }}
      />
      {/* Top Right Bracket */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: bracketWidth,
          height: bracketHeight,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: "white",
          borderTopRightRadius: 4,
        }}
      />
      {/* Bottom Left Bracket */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: bracketWidth,
          height: bracketHeight,
          borderBottomWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderColor: "white",
          borderBottomLeftRadius: 4,
        }}
      />
      {/* Bottom Right Bracket */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: bracketWidth,
          height: bracketHeight,
          borderBottomWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: "white",
          borderBottomRightRadius: 4,
        }}
      />
      {children}
    </View>
  );
};
