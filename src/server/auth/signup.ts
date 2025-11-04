import { prisma } from "@/lib/db";
import argon2 from "argon2";
import { randomInt } from "crypto";

export type SignupDeps = {
  ttlMs: number;
  cooldownMs?: number;
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
  { ttlMs, cooldownMs, argon2Opts, sendMail }: SignupDeps
) {
  // 1) reuse/unverified user or create
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  // Stop verified accounts
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

  // Cooldown, stop if a recent code was just created
  if (cooldownMs && cooldownMs > 0) {
    const recent = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        purpose: "SIGNUP_VERIFY_EMAIL",
        createdAt: { gte: new Date(Date.now() - cooldownMs) },
      },
      select: { id: true },
    });
    if (recent) {
      return { kind: "cooldown" as const };
    }
  }

  // 2) Replace any old verification codes/sessions with a fresh one (atomic)
  const { code, expiresAt, codeId } = await prisma.$transaction(async (tx) => {
    await tx.verificationCode.deleteMany({
      where: { userId: user.id, purpose: "SIGNUP_VERIFY_EMAIL" },
    });

    const fresh = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const hash = await argon2.hash(fresh, argon2Opts);
    const expires = new Date(Date.now() + ttlMs);

    // Send request to create a verification code, ask to get its id in return
    const created = await tx.verificationCode.create({
      data: {
        userId: user.id,
        codeHash: hash,
        purpose: "SIGNUP_VERIFY_EMAIL",
        expiresAt: expires,
      },
      select: { id: true },
    });

    return { code: fresh, expiresAt: expires, codeId: created.id };
  });

  //3 send mail (rollback on failure)
  try {
    await sendMail({
      to: email,
      name,
      code,
      ttlMin: Math.round(ttlMs / 60000),
    });
  } catch {
    await prisma.verificationCode
      .delete({ where: { id: codeId } })
      .catch(() => {});
    return { kind: "mail-failed" as const };
  }

  return { kind: "ok" as const, expiresAt };
}
