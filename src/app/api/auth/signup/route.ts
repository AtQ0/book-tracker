import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { runSignup } from "@/server/auth/signup";
import { normalizeEmail, normalizeName } from "@/lib/auth-helpers";
import { SendSignupEmail } from "@/server/mail/sendSignupEmail";
import { SignupSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 min
const RESEND_COOLDOWN_MS = 60 * 1000; // 60

// Argon2 recommended hashing config (see doc.)
const ARGON2_OPTS = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 2 ** 16, // ~64 MB
  parallelism: 1,
};

// Helper to send JSON responses with no caching
function json(body: unknown, status: number) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function problem(
  status: number,
  title: string,
  detail?: string,
  extra?: Record<string, unknown>
);
