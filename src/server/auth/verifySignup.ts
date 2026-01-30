import { prisma } from "@/lib/db";
import argon2 from "argon2";
import { randomInt } from "crypto";
import { ARGON2_OPTS } from "@/server/auth/config";

export type VerifySignupResult =
  | { kind: "ok"; setPasswordCodeId: string }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "not-found" }
  | { kind: "already-verified" };

export async function verifySignupCode(params: {
  verificationCodeId: string;
  verificationCode: string;
}): Promise<VerifySignupResult> {
  // Look up the verificationCode record
  const record = await prisma.verificationCode.findUnique({
    where: { id: params.verificationCodeId },
    select: {
      id: true,
      codeHash: true,
      purpose: true,
      expiresAt: true,
      consumedAt: true,
      user: {
        select: { id: true, emailVerified: true },
      },
    },
  });

  // If no record exists or purpose is wrong
  if (!record || record.purpose !== "SIGNUP_VERIFY_EMAIL") {
    return { kind: "not-found" };
  }

  // If the user is already verified
  if (record.user.emailVerified) {
    return { kind: "already-verified" };
  }

  // If this code was already used
  if (record.consumedAt) {
    return { kind: "invalid" };
  }

  // If expired
  if (record.expiresAt.getTime() <= Date.now()) {
    return { kind: "expired" };
  }

  // Compare 6 digit code
  const ok = await argon2.verify(record.codeHash, params.verificationCode);
  if (!ok) {
    return { kind: "invalid" };
  }

  // Consume verify code + verify email + create set-password code (atomic)
  const setPasswordCodeId = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.user.id },
      data: { emailVerified: new Date() },
    });

    await tx.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    // Remove any older set-password codes for this user
    await tx.verificationCode.deleteMany({
      where: { userId: record.user.id, purpose: "SIGNUP_SET_PASSWORD" },
    });

    // Create a set-password code (Don't need to ever show this "code" to the user,
    // only need a short-lived id to authorize setting the password).
    const dummy = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const hash = await argon2.hash(dummy, ARGON2_OPTS);

    const created = await tx.verificationCode.create({
      data: {
        userId: record.user.id,
        codeHash: hash,
        purpose: "SIGNUP_SET_PASSWORD",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
      select: { id: true },
    });

    return created.id;
  });

  return { kind: "ok", setPasswordCodeId };
}
