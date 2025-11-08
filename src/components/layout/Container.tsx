import { twMerge } from "tailwind-merge";

type ContainerProps = React.ComponentPropsWithRef<"div"> & {
  width?: "default" | "wide" | "narrow";
};

const WIDTHS = {
  default: "max-w-5xl",
  wide: "max-w-7xl",
  narrow: "max-w-3xl",
} as const;

export default function Container({
  className,
  width = "default",
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={twMerge("mx-auto w-full px-6", WIDTHS[width], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
