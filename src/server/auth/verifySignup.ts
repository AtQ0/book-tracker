import { prisma } from "@/lib/db";
import argon2 from "argon2";

export type VerifySignupResult =
  | { kind: "ok" }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "not-found" }
  | { kind: "already-verified" };

export async function verifySignupCode(params: {
  verificationCodeId: string;
  verificationCode: string;
}): Promise<VerifySignupResult> {
  // Look up the verificationCode record in the database using the ID
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

  // If no record exists or the purpose is not signup verification, stop
  if (!record || record.purpose !== "SIGNUP_VERIFY_EMAIL") {
    return { kind: "not-found" };
  }

  // If the user is already verified, no need to continue
  if (record.user.emailVerified) {
    return { kind: "already-verified" };
  }

  // If this code was already used, block reuse
  if (record.consumedAt) {
    return { kind: "invalid" };
  }

  // If the code has expired, stop
  if (record.expiresAt.getTime() <= Date.now()) {
    return { kind: "expired" };
  }

  // Compare the user's six digit code with the stored hash
  const ok = await argon2.verify(record.codeHash, params.verificationCode);

  // If the 6 digit code is wrong, reject
  if (!ok) {
    return { kind: "invalid" };
  }

  // Atomically mark the user as verified and this code as consumed
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      // wait tx.user.update returns a response like a fetch and throws if it fails
      where: { id: record.user.id },
      data: { emailVerified: new Date() },
    });

    await tx.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
  });

  // Everything succeeded
  return { kind: "ok" };
}
