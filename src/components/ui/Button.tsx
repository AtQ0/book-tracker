import React, { forwardRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// All standard HTML <button> props & additional, but without the built-in ref
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

// Forward a typed ref (HTMLButtonElement) along with the standard button props
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    children,
    isLoading = false,
    disabled,
    variant = "primary",
    type = "button",
    ...props
  },
  ref,
) {
  // Set styles for the button
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-medium transition cursor-pointer";
  const states =
    "focus:outline-none focus:ring-2 focus:ring-russet disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-russet px-5 py-3 text-white text-xl hover:opacity-90",
    secondary:
      "flex-1 bg-golden-brown text-white text-lg hover:opacity-90 py-2 max-[499px]:px-3 max-[499px]:py-2 max-[499px]:text-sm",
    ghost: "bg-transparent text-licorice hover:bg-black/5",
  } as const; // Freeze keys and values as literal types

  return (
    <button
      ref={ref}
      type={type}
      className={twMerge(clsx(base, states, variants[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
});

// Set display name for clearer debugging in React DevTools
Button.displayName = "Button";

export default Button;
