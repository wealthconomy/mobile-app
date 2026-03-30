import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  className?: string;
  textClassName?: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export const ThemedButton = ({
  title,
  className,
  textClassName,
  variant = "primary",
  loading = false,
  disabled,
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
      className={`p-4 rounded-xl items-center justify-center ${variantStyles[variant]} ${className || ""} ${disabled || loading ? "opacity-70" : ""}`}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#155D5F" : "white"}
        />
      ) : (
        <Text
          className={`font-semibold text-base ${textStyles[variant]} ${textClassName || ""}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
