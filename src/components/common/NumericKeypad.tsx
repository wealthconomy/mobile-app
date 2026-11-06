import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NumericKeypadProps {
  onPressDigit: (digit: string) => void;
  onPressDelete: () => void;
  onPressBiometric?: () => void;
  showBiometric?: boolean;
  disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onPressDigit,
  onPressDelete,
  onPressBiometric,
  showBiometric = false,
  disabled = false,
}) => {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [showBiometric ? "bio" : "", "0", "del"],
  ];

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, colIndex) => {
            if (key === "") {
              return <View key={colIndex} style={styles.keyPlaceholder} />;
            }

            if (key === "bio") {
              return (
                <TouchableOpacity
                  key={colIndex}
                  onPress={onPressBiometric}
                  disabled={disabled || !onPressBiometric}
                  style={styles.keyButton}
                  activeOpacity={0.6}
                >
                  <Ionicons name="scan-outline" size={26} color="#155D5F" />
                </TouchableOpacity>
              );
            }

            if (key === "del") {
              return (
                <TouchableOpacity
                  key={colIndex}
                  onPress={onPressDelete}
                  disabled={disabled}
                  style={styles.keyButton}
                  activeOpacity={0.6}
                >
                  <Ionicons name="backspace-outline" size={26} color="#323232" />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={colIndex}
                onPress={() => onPressDigit(key)}
                disabled={disabled}
                style={styles.keyButton}
                activeOpacity={0.6}
              >
                <Text style={styles.digitText}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  keyPlaceholder: {
    width: 72,
    height: 72,
  },
  digitText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
});
