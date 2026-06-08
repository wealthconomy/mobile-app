/**
 * PortfolioPreferenceMenu
 * A reusable ⋮ ellipsis menu that lets the user choose
 * "Interest Based" or "Impact Wealth" for a specific portfolio.
 *
 * Dispatches to the portfolioPreference Redux slice.
 */
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  PortfolioType,
  WealthPreference,
  setPortfolioPreference,
} from "@/src/store/slices/portfolioPreferenceSlice";

interface PortfolioPreferenceMenuProps {
  portfolioType: PortfolioType;
  iconColor?: string;
}

const OPTIONS: WealthPreference[] = ["Interest Based", "Impact Wealth", "Mixed"];

export const PortfolioPreferenceMenu = ({
  portfolioType,
  iconColor = "#323232",
}: PortfolioPreferenceMenuProps) => {
  const dispatch = useDispatch();
  const current = useSelector(
    (state: RootState) => state.portfolioPreference[portfolioType]
  );

  const [visible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<View>(null);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPos({ top: y + height + 4, right: 12 });
      setVisible(true);
    });
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleSelect = (value: WealthPreference) => {
    dispatch(setPortfolioPreference({ type: portfolioType, value }));
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef as any}
        onPress={openMenu}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={iconColor} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: "absolute",
            top: menuPos.top,
            right: menuPos.right,
            backgroundColor: "white",
            borderRadius: 14,
            paddingVertical: 6,
            minWidth: 200,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 12,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            transformOrigin: "top right",
          }}
        >
          {/* Label */}
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: "#9CA3AF",
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Wealth Preference
          </Text>

          {OPTIONS.map((option, i) => {
            const isActive = current === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => handleSelect(option)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderTopWidth: i === 0 ? 0.5 : 0,
                  borderTopColor: "#F3F4F6",
                  backgroundColor: isActive ? "#F0FFF4" : "transparent",
                }}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 16, marginRight: 10 }}>
                    {option === "Interest Based" ? "📈" : option === "Impact Wealth" ? "🌱" : "⚖️"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? "700" : "500",
                      color: isActive ? "#155D5F" : "#1A1A1A",
                    }}
                  >
                    {option}
                  </Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={18} color="#155D5F" />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Current preference indicator */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 6,
              marginBottom: 10,
              backgroundColor: "#F3F4F6",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: "#6B7280", textAlign: "center" }}>
              Currently:{" "}
              <Text style={{ fontWeight: "700", color: "#155D5F" }}>
                {current}
              </Text>
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};
