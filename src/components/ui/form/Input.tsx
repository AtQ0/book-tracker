import React, { forwardRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// All standard HTML <input> props, but without the built-in ref
type InputProps = React.ComponentPropsWithoutRef<"input">;

// Forward a typed ref (HTMLInputElement) along with the standard input props
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={twMerge(
        clsx(
          "rounded-md border-kobicha border-1 px-2 bg-platinum h-[2.5rem] w-[18rem]",
          "focus:outline-none focus:ring-1 focus:ring-copper focus:border-copper",
          "disabled:opacity-50",
          className
        )
      )}
      {...props}
    />
  );
});

// Set display name for clearer debugging in React DevTools
Input.displayName = "Input";

export default Input;
