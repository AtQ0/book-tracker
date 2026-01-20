import { prisma } from "@/lib/db";
import argon2 from "argon2";
import { ARGON2_OPTS } from "@/server/auth/config";

type Params = {
  verificationCodeId: string;
  password: string;
};

export type SetPasswordResult =
  | { kind: "ok" }
  | { kind: "not-found" }
  | { kind: "wrong-purpose" }
  | { kind: "expired" }
  | { kind: "already-consumed" }
  | { kind: "email-not-verified" }
  | { kind: "password-already-set" };

export async function setPasswordFromVerifiedSignupCode(
  params: Params,
): Promise<SetPasswordResult> {
  // 1) Load verification code + user
  const code = await prisma.verificationCode.findUnique({
    where: { id: params.verificationCodeId },
    include: { user: true },
  });

  // 2) Guards
  if (!code) return { kind: "not-found" };

  if (code.purpose !== "SIGNUP_SET_PASSWORD") {
    return { kind: "wrong-purpose" };
  }

  if (code.consumedAt) {
    return { kind: "already-consumed" };
  }

  if (code.expiresAt.getTime() <= Date.now()) {
    return { kind: "expired" };
  }

  if (!code.user.emailVerified) {
    return { kind: "email-not-verified" };
  }

  if (code.user.passwordHash) {
    return { kind: "password-already-set" };
  }

  // 3) Hash password
  const passwordHash = await argon2.hash(params.password, ARGON2_OPTS);

  // 4) Atomically set password + consume code
  await prisma.$transaction([
    prisma.user.update({
      where: { id: code.userId },
      data: { passwordHash },
    }),
    prisma.verificationCode.update({
      where: { id: code.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  return { kind: "ok" };
}
