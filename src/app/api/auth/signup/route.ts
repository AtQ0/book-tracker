import { NextResponse } from "next/server";
import { SignupSchema } from "@/lib/validations/auth";
import { normalizeEmail, normalizeName } from "@/lib/auth-helpers";
import { runSignup } from "@/server/auth/signup";
import { SendSignupEmail } from "@/server/mail/sendSignupEmail";
import {
  CODE_TTL_MS,
  RESEND_COOLDOWN_MS,
  ARGON2_OPTS,
} from "@/server/auth/config";
export { json, problem } from "@/server/http";

export const runtime = "nodejs";
