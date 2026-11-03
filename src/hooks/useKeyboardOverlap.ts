import { useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, KeyboardEvent, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface KeyboardOverlapInfo {
  keyboardHeight: number;
  keyboardTopY: number;
  reportedScreenY: number;
  isKeyboardVisible: boolean;
  shrank?: boolean;
}

/**
 * Android-only keyboard overlap tracking hook.
 *
 * Listens to `keyboardDidShow` and `keyboardDidHide` events to provide the
 * keyboard's height, reported screenY, and corrected keyboardTopY.
 * Detects whether the window actually shrank (Android <= 14 adjustResize)
 * or remained full-screen under edge-to-edge (Android 15+ / API 35+).
 *
 * On iOS, this is a no-op that returns zero/false values so iPhone
 * behavior and look remain completely unchanged.
 */
export function useKeyboardOverlap(): KeyboardOverlapInfo {
  const insets = useSafeAreaInsets();
  const insetsBottomRef = useRef(insets.bottom);
  insetsBottomRef.current = insets.bottom;

  const [keyboardInfo, setKeyboardInfo] = useState<KeyboardOverlapInfo>({
    keyboardHeight: 0,
    keyboardTopY: 0,
    reportedScreenY: 0,
    isKeyboardVisible: false,
    shrank: false,
  });

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const showSub = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
      const keyboardHeight = e.endCoordinates.height;
      const reportedScreenY = e.endCoordinates.screenY;
      const screenHeight = Dimensions.get("screen").height;
      const windowHeight = Dimensions.get("window").height;

      // On Android <= 14 with adjustResize, the window physically shrinks and reportedScreenY < screenHeight - 100.
      // On Android 15+ (API 35+) with edge-to-edge, the window does NOT shrink, so reportedScreenY == screenHeight.
      const shrank = reportedScreenY < screenHeight - 100;

      // System navigation bar inset: useSafeAreaInsets().bottom accurately queries WindowInsets.Type.navigationBars()
      // Fallback to screen vs window height difference if insets.bottom is 0
      const bottomInset = insetsBottomRef.current || Math.max(0, screenHeight - windowHeight);

      // When the window did not shrink, reportedScreenY is the screen bottom instead of keyboard top.
      // Corrected top edge is screenHeight - (keyboardHeight + bottomInset).
      const correctedTopY = screenHeight - (keyboardHeight + bottomInset);
      const keyboardTopY = shrank ? reportedScreenY : correctedTopY;

      setKeyboardInfo({
        keyboardHeight,
        keyboardTopY,
        reportedScreenY,
        isKeyboardVisible: true,
        shrank,
      });
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardInfo({
        keyboardHeight: 0,
        keyboardTopY: 0,
        reportedScreenY: 0,
        isKeyboardVisible: false,
        shrank: false,
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
