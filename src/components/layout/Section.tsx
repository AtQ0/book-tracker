import React from "react";
import { twMerge } from "tailwind-merge";

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  variant?: "default" | "dense" | "loose" | "bleed";
};

const VARIANTS = {
  default: "py-8 md:py-10",
  dense: "py-6 md:py-8",
  loose: "py-10 md:py-14",
  bleed: "",
} as const;

export default function Section({
  className,
  variant = "default",
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={twMerge(VARIANTS[variant], className)} {...rest}>
      {children}
    </section>
  );
}
