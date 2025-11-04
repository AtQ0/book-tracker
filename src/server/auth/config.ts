import argon2 from "argon2";

// Argon2 recommended hashing config (see doc.)
export const ARGON2_OPTS = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 2 ** 16, // ~64 MB
  parallelism: 1,
};

// Durations (ms)
export const CODE_TTL_MS = 10 * 60 * 1000; // 10 min
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60
