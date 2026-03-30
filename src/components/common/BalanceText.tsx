import { Text, TextStyle, View } from "react-native";

interface BalanceTextProps {
  amount: string | number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  style?: TextStyle;
}

export const BalanceText = ({
  amount,
  fontSize = 32,
  color = "white",
  bold = true,
  style,
}: BalanceTextProps) => {
  const amountStr =
    typeof amount === "number"
      ? amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : amount;

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
            fontSize: fontSize * 0.6, // Smaller kobo (60%)
            color,
            opacity: 0.5, // Even lighter kobo (50% opacity)
            fontWeight: "400", // Explicitly lighter weight
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
