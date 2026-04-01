import { Text, TextStyle, View } from "react-native";

interface BalanceTextProps {
  amount: string | number;
  decimal?: string;
  visible?: boolean;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  style?: TextStyle;
}

export const BalanceText = ({
  amount,
  decimal,
  visible = true,
  fontSize = 32,
  color = "white",
  bold = true,
  style,
}: BalanceTextProps) => {
  // When hidden, show bullet placeholder
  if (!visible) {
    return (
      <Text
        style={[
          {
            fontSize,
            color,
            fontWeight: bold ? "bold" : "normal",
          },
          style,
        ]}
      >
        ••••••
      </Text>
    );
  }

  const amountStr =
    typeof amount === "number"
      ? amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : amount;

  // If a separate decimal prop is provided, render it smaller
  if (decimal) {
    return (
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={[
            {
              fontSize,
              color,
              fontWeight: bold ? "bold" : "normal",
            },
            style,
          ]}
        >
          {amountStr}
        </Text>
        <Text
          style={[
            {
              fontSize: fontSize * 0.6,
              color,
              opacity: 0.5,
              fontWeight: "400",
              marginLeft: 1,
            },
            style,
          ]}
        >
          {decimal}
        </Text>
      </View>
    );
  }

  if (!amountStr.includes(".") || amountStr.includes("•")) {
    return (
      <Text
        style={[
          {
            fontSize,
            color,
            fontWeight: bold ? "bold" : "normal",
          },
          style,
        ]}
      >
        {amountStr}
      </Text>
    );
  }

  const [naira, kobo] = amountStr.split(".");

  return (
    <View className="flex-row items-baseline">
      <Text
        style={[
          {
            fontSize,
            color,
            fontWeight: bold ? "bold" : "normal",
          },
          style,
        ]}
      >
        {naira}
      </Text>
      <Text
        style={[
          {
            fontSize: fontSize * 0.6,
            color,
            opacity: 0.5,
            fontWeight: "400",
            marginLeft: 1,
            marginBottom: fontSize * 0.05,
          },
          style,
        ]}
      >
        .{kobo}
      </Text>
    </View>
  );
};
