import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
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
  scrollRef?: React.RefObject<ScrollView | null> | React.RefObject<ScrollView>;
}

/**
 * iOS-specific wrapper.
 * Passes through directly to `KeyboardAvoidingView` with `behavior="padding"`
 * by default and preserves identical props and styling, guaranteeing iPhone behavior
 * and appearance remain exactly as they are today.
 */
function KeyboardAwareScreenIOS(props: KeyboardAwareScreenProps) {
  const {
    children,
    style,
    contentStyle,
    contentContainerStyle,
    enabled = true,
    extraOffset = 0,
    behavior = "padding",
    keyboardVerticalOffset = 0,
    scrollRef,
    ...rest
  } = props;

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

/**
 * Android-specific wrapper.
 * Measures container in screen coordinates upon keyboard show and calculates
 * paddingBottom = max(0, containerBottomY - keyboardTopY + extraOffset).
 * If a scrollRef is provided and a TextInput is currently focused, measures
 * that input relative to the scroll content and scrolls it so the field ends
 * up about 24dp above the visible bottom edge.
 */
function KeyboardAwareScreenAndroid(props: KeyboardAwareScreenProps) {
  const {
    children,
    style,
    contentStyle,
    contentContainerStyle,
    enabled = true,
    extraOffset = 0,
    behavior = "padding",
    keyboardVerticalOffset = 0,
    scrollRef,
    ...rest
  } = props;

  const { keyboardTopY, isKeyboardVisible } = useKeyboardOverlap();
  const [paddingBottom, setPaddingBottom] = useState(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (!enabled) {
      setPaddingBottom(0);
      return;
    }

    if (!isKeyboardVisible || keyboardTopY <= 0) {
      setPaddingBottom(0);
      return;
    }

    let isMounted = true;
    let raf1Id: number | null = null;
    let raf2Id: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const measureAndAdjust = () => {
      if (!isMounted) return;
      containerRef.current?.measureInWindow((containerX, containerY, width, height) => {
        if (!isMounted) return;
        const containerBottomY = containerY + height;
        const overlap = Math.max(0, containerBottomY - keyboardTopY);
        const finalPadding = overlap > 0 ? overlap + (extraOffset || 0) : 0;
        setPaddingBottom(finalPadding);

        // Scroll the focused field into view if scrollRef is provided
        if (scrollRef?.current) {
          try {
            const focusedInput = TextInput.State?.currentlyFocusedInput
              ? TextInput.State.currentlyFocusedInput()
              : null;

            if (focusedInput) {
              const innerView = (scrollRef.current as any).getInnerViewRef
                ? (scrollRef.current as any).getInnerViewRef()
                : scrollRef.current;

              if (innerView && typeof (focusedInput as any).measureLayout === "function") {
                (focusedInput as any).measureLayout(
                  innerView,
                  (left: number, top: number, inputWidth: number, inputHeight: number) => {
                    if (!isMounted) return;
                    // Visible height of the container above the keyboard
                    const visibleHeight = Math.max(0, keyboardTopY - containerY);
                    // Field ends up about 24dp above the visible bottom edge
                    const targetScrollY = Math.max(0, top + inputHeight + 24 - visibleHeight);
                    scrollRef.current?.scrollTo({ y: targetScrollY, animated: true });
                  },
                  () => {
                    // Fail silently
                  }
                );
              }
            }
          } catch {
            // Ignore if API unavailable
          }
        }
      });
    };

    // Pass 1: two requestAnimationFrame passes to measure as soon as layout updates
    raf1Id = requestAnimationFrame(() => {
      raf2Id = requestAnimationFrame(() => {
        measureAndAdjust();
      });
    });

    // Pass 2: one additional measurement after about 150 ms in case layout shifted or overlap changed
    timeoutId = setTimeout(() => {
      measureAndAdjust();
    }, 150);

    return () => {
      isMounted = false;
      if (raf1Id !== null) cancelAnimationFrame(raf1Id);
      if (raf2Id !== null) cancelAnimationFrame(raf2Id);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [isKeyboardVisible, keyboardTopY, enabled, extraOffset, scrollRef]);

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

/**
 * Universal keyboard-avoiding wrapper.
 * Splits into iOS and Android implementations to avoid conditional hook calls.
 */
export function KeyboardAwareScreen(props: KeyboardAwareScreenProps) {
  if (Platform.OS === "ios") {
    return <KeyboardAwareScreenIOS {...props} />;
  }
  return <KeyboardAwareScreenAndroid {...props} />;
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
  },
});

export default KeyboardAwareScreen;
