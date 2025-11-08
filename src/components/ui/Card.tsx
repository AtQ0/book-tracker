import { twMerge } from "tailwind-merge";
import BackButton from "../BackButton";

// Generic prop type allowing polymorphic "as" (div, article, section, etc.)
type AsProp<T extends React.ElementType> = {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

// Custom props that belong only to Card (c)
type CardOwnProps = {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "secondary" | "elevated" | "outline";
  showBackButton?: boolean;
  children?: React.ReactNode;
};

const PAD = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
} as const;

const VAR = {
  default: "bg-baby-powder border-2 border-alabaster",
  secondary: "bg-cosmic-latte border-1 border-peach-yellow",
  elevated: "bg-baby-powder shadow-md",
  outline: "bg-white border border-alabaster",
} as const;

export default function Card<T extends React.ElementType = "div">({
  as,
  className,
  padding = "md",
  variant = "default",
  showBackButton,
  children,
  ...rest
}: AsProp<T> & CardOwnProps) {
  const Tag = (as || "div") as React.ElementType;

  return (
    <Tag
      className={twMerge(
        "rounded-xl select-none",
        VAR[variant],
        PAD[padding],
        className
      )}
      {...rest}
    >
      {showBackButton && <BackButton />}
      {children}
    </Tag>
  );
}
