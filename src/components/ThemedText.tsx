import { styled } from "nativewind";
import { Text, TextProps } from "react-native";

const StyledText = styled(Text);

export interface ThemedTextProps extends TextProps {
  className?: string;
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
}

export const ThemedText = ({
  className,
  variant = "body",
  ...props
}: ThemedTextProps) => {
  const variantStyles = {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-semibold",
    h3: "text-xl font-medium",
    body: "text-base",
    caption: "text-sm text-gray-500",
  };

  return (
    <Text
      className={`${variantStyles[variant]} ${className || ""}`}
      {...props}
    />
  );
};
