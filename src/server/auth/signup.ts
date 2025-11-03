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
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  // Block verified accounts
  if (existing?.emailVerified) {
    return {
      kind: "conflict" as const,
      field: "email",
      message: "That email is already registered",
    };
  }

  // Reuse unverified user or create new
  const user =
    existing ??
    (await prisma.user.create({
      data: { email, name },
      select: { id: true },
    }));

  // 2) Replace any old verification codes/sessions with a fresh one (atomic)
  const { code, token, expiresAt, codeId } = await prisma.$transaction(
    async (tx) => {
      await tx.verificationSession.deleteMany({ where: { userId: user.id } });
      await tx.verificationCode.deleteMany({
        where: { userId: user.id, purpose: "SIGNUP_VERIFY_EMAIL" },
      });
    }
  );
}
