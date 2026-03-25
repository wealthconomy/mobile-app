import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

export interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
  variant?: "primary" | "secondary" | "outline";
}

export const ThemedButton = ({
  title,
  className,
  textClassName,
  variant = "primary",
  ...props
}: ThemedButtonProps) => {
  const variantStyles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-primary bg-transparent",
  };

  const textStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-primary",
  };

  return (
    <TouchableOpacity
      className={`p-4 rounded-xl items-center justify-center ${variantStyles[variant]} ${className || ""}`}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        className={`font-semibold text-base ${textStyles[variant]} ${textClassName || ""}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
