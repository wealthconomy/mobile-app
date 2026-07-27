import React from "react";
import { View, Text } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Polygon, Circle } from "react-native-svg";

export const Level3Badge: React.FC = () => {
  return (
    <View style={{ width: 100, height: 120, alignItems: "center", justifyContent: "center" }}>
      <Svg width="100" height="120" viewBox="0 0 100 120" fill="none">
        <Defs>
          <LinearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3B82F6" />
            <Stop offset="1" stopColor="#2563EB" />
          </LinearGradient>
          <LinearGradient id="medalGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F9A03F" />
            <Stop offset="1" stopColor="#E27D22" />
          </LinearGradient>
        </Defs>

        {/* Ribbon Left */}
        <Polygon points="10,0 45,60 0,60" fill="#1D4ED8" />
        {/* Ribbon Right */}
        <Polygon points="90,0 100,60 55,60" fill="#1D4ED8" />
        {/* Ribbon Center */}
        <Polygon points="25,0 75,0 50,60" fill="url(#ribbonGrad)" />

        {/* Medal Ring */}
        <Circle cx="50" cy="75" r="32" fill="#B65D13" />
        
        {/* Medal Inner */}
        <Circle cx="50" cy="75" r="27" fill="url(#medalGrad)" />
      </Svg>
      <View style={{ position: "absolute", top: 55, width: "100%", alignItems: "center" }}>
         <Text style={{ fontSize: 32, fontWeight: "900", color: "#B65D13" }}>3</Text>
      </View>
    </View>
  );
};
