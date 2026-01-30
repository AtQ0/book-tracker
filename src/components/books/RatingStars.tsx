"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  value: number;
  max?: number;
  size?: number;
  className?: string;

  // If provided, stars become clickable (1..max)
  onChange?: (next: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function StarIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function RatingStars({
  value,
  max = 5,
  size = 22,
  className,
  onChange,
  disabled,
  ariaLabel = "Rating",
}: Props) {
  const [hover, setHover] = React.useState<number | null>(null);

  // Display mode (supports fractional fill)
  if (!onChange) {
    const safe = clamp(value, 0, max);

    return (
      <div className={twMerge("inline-flex items-center gap-1", className)}>
        {Array.from({ length: max }).map((_, i) => {
          const fill = clamp(safe - i, 0, 1);
          const pct = `${fill * 100}%`;

          return (
            <span
              key={i}
              className="relative inline-block"
              style={{ width: size, height: size }}
            >
              <StarIcon size={size} className="text-stone-300" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: pct }}
              >
                <StarIcon size={size} className="text-yellow-400" />
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  // Interactive mode (integer)
  const safeValue = clamp(Math.round(value), 0, max);
  const shown = hover ?? safeValue;

  return (
    <div
      className={twMerge("inline-flex items-center gap-1", className)}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {Array.from({ length: max }).map((_, i) => {
        const rating = i + 1;
        const filled = rating <= shown;

        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={rating === safeValue}
            aria-label={`${rating} out of ${max}`}
            disabled={!!disabled}
            onMouseEnter={() => setHover(rating)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(rating)}
            onBlur={() => setHover(null)}
            onClick={() => onChange(rating)}
            className="leading-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StarIcon
              size={size}
              className={filled ? "text-yellow-400" : "text-stone-300"}
            />
          </button>
        );
      })}
    </div>
  );
}
