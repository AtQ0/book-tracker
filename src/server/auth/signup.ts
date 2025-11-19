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
    codeId: string;
  }) => Promise<void>;
};

// runSignup return must be exactly one of these shapes
export type SignupResult =
  | { kind: "ok"; expiresAt: Date; session: string }
  | { kind: "conflict"; field: "email"; message: string }
  | { kind: "cooldown" }
  | { kind: "mail-failed" };

export async function runSignup(
  { email, name }: { email: string; name: string },
  { ttlMs, cooldownMs, argon2Opts, sendMail }: SignupDeps
): //Bind the return with the shape SignupResult
Promise<SignupResult> {
  // 1) reuse/unverified user or create
  const existing = await prisma.user.findUnique({
    where: { email },
    // if email exists include these fields in the result
    select: { id: true, emailVerified: true },
  });

  // Stop verified accounts (409 Conflict)
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

  // Cooldown check (429 Too Many Requests), stop if a recent code was just created
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
    // Remove old verification code for a specific user
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

  //3 send mail: rollback on failure (502 Bad Gateway)
  try {
    await sendMail({
      to: email,
      name,
      code,
      ttlMin: Math.floor(ttlMs / 60000), // convert ms to minutes
      codeId, // pass through session code so mail can build verify link
    });
  } catch {
    await prisma.verificationCode
      .delete({ where: { id: codeId } })
      .catch(() => {});
    return { kind: "mail-failed" as const };
  }

  // Success (201 Created)
  return { kind: "ok" as const, expiresAt, session: codeId };
}
