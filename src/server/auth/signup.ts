import { prisma } from "@/lib/db";
import argon2 from "argon2";
import { randomInt, randomUUID } from "crypto";

export type SignupDeps = {
  ttlMs: number;
  argon2Opts: Parameters<typeof argon2.hash>[1];
  sendMail: (args: {
    to: string;
    name: string;
    code: string;
    ttlMin: number;
  }) => Promise<void>;
};

export async function runSignup(
  { email, name }: { email: string; name: string },
  { ttlMs, argon2Opts, sendMail }: SignupDeps
) {
  // 1) reuse/unverified user or create
}
