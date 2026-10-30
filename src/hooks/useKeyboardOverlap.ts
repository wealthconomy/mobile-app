import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

export interface KeyboardOverlapInfo {
  keyboardHeight: number;
  keyboardTopY: number;
  isKeyboardVisible: boolean;
}

/**
 * Android-only keyboard overlap tracking hook.
 *
 * Listens to `keyboardDidShow` and `keyboardDidHide` events to provide the
 * keyboard's height and top edge (`screenY`) in screen coordinates.
 * On iOS, this is a no-op that returns zero/false values so iPhone
 * behavior and look remain completely unchanged.
 */
export function useKeyboardOverlap(): KeyboardOverlapInfo {
  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardOverlapInfo>({
    keyboardHeight: 0,
    keyboardTopY: 0,
    isKeyboardVisible: false,
  });

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const showSub = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
      setKeyboardInfo({
        keyboardHeight: e.endCoordinates.height,
        keyboardTopY: e.endCoordinates.screenY,
        isKeyboardVisible: true,
      });
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardInfo({
        keyboardHeight: 0,
        keyboardTopY: 0,
        isKeyboardVisible: false,
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardInfo;
}

export default useKeyboardOverlap;
