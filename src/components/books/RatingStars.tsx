"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  value: number; // 0..max
  max?: number; // default 5
  size?: number; // px
  className?: string;
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
}: Props) {
  const safe = clamp(value, 0, max);

  return (
    <div className={twMerge("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = clamp(safe - i, 0, 1); // 0..1 for this star
        const pct = `${fill * 100}%`;

        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            {/* empty star */}
            <StarIcon size={size} className="text-stone-300" />

            {/* filled star clipped to percentage */}
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
