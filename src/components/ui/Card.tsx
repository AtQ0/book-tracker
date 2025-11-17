import { twMerge } from "tailwind-merge";
import BackButton from "../BackButton";

// Polymorphic props for any React.ElementType (div, article, section, etc.), minus ref and any existing `as`
type AsProp<T extends React.ElementType> = {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

// Custom props that belong only to Card
type CardOwnProps = {
  padding?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  variant?: "default" | "secondary" | "elevated" | "outline";
  showBackButton?: boolean;
  children?: React.ReactNode;
};

// Combine polymorphic element props with Card’s own custom props
export type CardProps<T extends React.ElementType = "div"> = AsProp<T> &
  CardOwnProps;

const PAD = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
  xl: "p-9",
  "2xl": "p-11",
  "3xl": "p-14",
  "4xl": "p-16 max-xs:px-5 max-xs:pb-10",
  "5xl": "p-20",
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
}: CardProps<T>) {
  // Park as value or div in an uppercase variable as JSX reads them as variables
  const Tag = (as || "div") as React.ElementType;

  return (
    <Tag
      className={twMerge(
        "rounded-xl select-none relative",
        VAR[variant],
        PAD[padding],
        className
      )}
      {...rest}
    >
      {showBackButton && <BackButton />}
      {}
      {children}
    </Tag>
  );
}
