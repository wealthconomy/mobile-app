import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useKeyboardOverlap } from "@/src/hooks/useKeyboardOverlap";

export interface KeyboardAwareScreenProps
  extends Omit<KeyboardAvoidingViewProps, "style"> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  enabled?: boolean;
  extraOffset?: number;
}

/**
 * Universal keyboard-avoiding wrapper.
 *
 * - iOS: Passes through directly to `KeyboardAvoidingView` with `behavior="padding"`
 *   by default and preserves identical props and styling, guaranteeing iPhone behavior
 *   and appearance remain exactly as they are today.
 * - Android: Renders a `View` (`{ flex: 1 }` by default or passes custom `style`).
 *   When the soft keyboard appears (especially under Android 15 / API 36 Edge-to-Edge
 *   where window resizing is no longer enforced by the OS), it measures the container
 *   in screen coordinates after a short 65ms settle. If the container bottom overlaps
 *   the keyboard top edge, `paddingBottom` is dynamically applied. If the window has
 *   already resized or the container is fully visible, overlap evaluates to 0.
 *   On keyboard hide, padding immediately resets to 0.
 *   Works reliably even inside native `Modal` components.
 */
export function KeyboardAwareScreen(props: KeyboardAwareScreenProps) {
  const {
    children,
    style,
    contentStyle,
    contentContainerStyle,
    enabled = true,
    extraOffset = 0,
    behavior = "padding",
    keyboardVerticalOffset = 0,
    ...rest
  } = props;

  // iOS: Preserve 100% identical KeyboardAvoidingView implementation
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        behavior={behavior}
        enabled={enabled}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={style}
        contentContainerStyle={contentContainerStyle}
        {...rest}
      >
        {contentStyle ? <View style={contentStyle}>{children}</View> : children}
      </KeyboardAvoidingView>
    );
  }

  // Android: Window coordinate measurement & dynamic lift
  const { keyboardTopY, isKeyboardVisible } = useKeyboardOverlap();
  const [paddingBottom, setPaddingBottom] = useState(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) {
      return;
    }

    if (!isKeyboardVisible || keyboardTopY <= 0) {
      setPaddingBottom(0);
      return;
    }

    let isMounted = true;
    // Settle 65ms (~2-3 animation frames) to ensure keyboard layout has stabilized
    const timer = setTimeout(() => {
      if (!isMounted) return;
      containerRef.current?.measureInWindow((x, y, width, height) => {
        if (!isMounted) return;
        const containerBottomY = y + height;
        const overlap = Math.max(0, containerBottomY - keyboardTopY);
        const finalPadding = overlap > 0 ? overlap + (extraOffset || 0) : 0;
        setPaddingBottom(finalPadding);
      });
    }, 65);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isKeyboardVisible, keyboardTopY, enabled, extraOffset]);

  const resolvedStyle = style !== undefined ? style : styles.defaultContainer;

  return (
    <View
      ref={containerRef}
      collapsable={false}
      style={[
        resolvedStyle,
        enabled && paddingBottom > 0 ? { paddingBottom } : null,
      ]}
      {...rest}
    >
      {contentStyle ? <View style={contentStyle}>{children}</View> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
  },
});

export default KeyboardAwareScreen;
