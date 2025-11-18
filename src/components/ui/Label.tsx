import React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

// All standard HTML <label> props, but without the built-in ref
type LabelProps = React.ComponentPropsWithoutRef<"label">;

export default function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={twMerge(clsx("text-sm text-licorice", className))}
      {...props}
    />
  );
}
