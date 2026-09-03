import React, { useEffect, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const KEYBOARD_ACCESSORY_ID = "defaultKeyboardDoneAccessory";

interface KeyboardDoneAccessoryProps {
  nativeID?: string;
  onDone?: () => void;
  title?: string;
}

export const KeyboardDoneAccessory: React.FC<KeyboardDoneAccessoryProps> = ({
  nativeID = KEYBOARD_ACCESSORY_ID,
  onDone,
  title = "Done",
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleDone = () => {
    Keyboard.dismiss();
    if (onDone) onDone();
  };

  if (Platform.OS === "ios") {
    return (
      <InputAccessoryView nativeID={nativeID}>
        <View style={styles.accessoryContainer}>
          <View style={styles.leftSpacer} />
          <TouchableOpacity
            onPress={handleDone}
            style={styles.doneButton}
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={16} color="#0B575B" style={{ marginRight: 2 }} />
            <Text style={styles.doneText}>{title}</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    );
  }

  // On Android, render sticky accessory bar if keyboard is visible
  if (!isKeyboardVisible) return null;

  return (
    <View style={styles.androidAccessoryContainer}>
      <View style={styles.leftSpacer} />
      <TouchableOpacity
        onPress={handleDone}
        style={styles.doneButton}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-down" size={16} color="#0B575B" style={{ marginRight: 2 }} />
        <Text style={styles.doneText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  accessoryContainer: {
    height: 38,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  androidAccessoryContainer: {
    height: 38,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  leftSpacer: {
    flex: 1,
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  doneText: {
    color: "#0B575B",
    fontSize: 13,
    fontWeight: "700",
  },
});
