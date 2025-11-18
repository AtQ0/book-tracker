import React from "react";
import { twMerge } from "tailwind-merge";

// All standard HTML <section> props & additional, but without the built-in ref
type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  variant?: "default" | "dense" | "loose" | "bleed";
};

// No forwardRef needed since this layout component doesn’t expose or manipulate the underlying DOM node

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
