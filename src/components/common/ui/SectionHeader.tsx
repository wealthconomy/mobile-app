import React from "react";
import { View, Text, StyleProp, TextStyle, ViewStyle } from "react-native";

export const THEME_TEAL = "#155D5F";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

export type KycSectionHeaderProps = SectionHeaderProps;

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[{ alignItems: "center", marginBottom: subtitle ? 24 : 16 }, containerStyle]}>
      <Text
        style={[
          {
            fontSize: 26,
            fontWeight: "700",
            color: THEME_TEAL,
            marginBottom: subtitle ? 6 : 0,
            textAlign: "center",
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            {
              fontSize: 14,
              color: "#8E9BAE",
              textAlign: "center",
              lineHeight: 20,
            },
            subtitleStyle,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

export const KycSectionHeader = SectionHeader;
