// tests\integration\server\verifySignup.test.ts
import { verifySignupCode } from "@/server/auth/verifySignup";
import { prisma } from "@/lib/db";
import argon2 from "argon2";

// Shape of the fake transaction client passed into prisma.$transaction
type MockTx = {
  user: { update: jest.Mock };
  verificationCode: {
    update: jest.Mock;
    deleteMany: jest.Mock;
    create: jest.Mock;
  };
};

// Type of the callback that prisma.$transaction receives
type TransactionCallback = (tx: MockTx) => Promise<unknown> | unknown;

// Replace the imported prisma client with a mock version
jest.mock("@/lib/db", () => ({
  prisma: {
    // Mock the prisma.verificationCode.findUnique
    verificationCode: {
      findUnique: jest.fn(),
    },
    // Mock prisma.$transaction and provide a fake transaction client (tx)
    $transaction: jest.fn().mockImplementation((cb: TransactionCallback) => {
      const tx: MockTx = {
        user: { update: jest.fn() },
        verificationCode: {
          update: jest.fn(),
          deleteMany: jest.fn(),
          create: jest.fn().mockResolvedValue({ id: "set-password-code-id" }),
        },
      };
      return cb(tx);
    }),
  },
}));

// Mock argon2.verify (PIN validation)
jest.mock("argon2", () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

// TS cast: tell TypeScript that the mocked prisma object has jest.Mock methods
const mockedPrisma = prisma as unknown as {
  verificationCode: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};

// TS-only cast so argon2.verify is typed as jest.Mock
const mockedArgon2 = argon2 as unknown as {
  verify: jest.Mock;
  hash: jest.Mock;
};

describe("verifySignupCode", () => {
  // Base happy-path verificationCode row (valid, unexpired, unused, user unverified)
  const baseRecord = {
    id: "code-id",
    codeHash: "hash",
    purpose: "SIGNUP_VERIFY_EMAIL" as const,
    expiresAt: new Date(Date.now() + 60_000), // Not expired yet
    consumedAt: null as Date | null, // Not consumed yet
    user: {
      id: "user-id",
      emailVerified: null as Date | null, // Email not verified yet
    },
  };

  // resets/wipes the call history of all jest mocks in the test file
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("happy path", () => {
    it("return ok and updates upser and verificationCode when everything is valid", async () => {
      // Mock DB lookup to return a (valid) verificationCode record
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
      });

      // Mock argon2.verify to return true (code matches stored hash)
      mockedArgon2.verify.mockResolvedValueOnce(true);

      // Mock argon2.hash to return a hash for dummy set-password code
      mockedArgon2.hash.mockResolvedValueOnce("dummy-hash");

      // Call verifySignupCode with valid data to trigger the happy path
      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({
        kind: "ok",
        setPasswordCodeId: "set-password-code-id",
      });
      expect(mockedArgon2.verify).toHaveBeenCalledTimes(1);
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        baseRecord.codeHash,
        "123456",
      );
    });
  });

  describe("required fields", () => {
    it("returns not-found and does not call argon2 or transaction when no record exists", async () => {
      // Mock DB lookup to return no record (null)
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce(null);

      const result = await verifySignupCode({
        verificationCodeId: "missing-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({ kind: "not-found" });
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("type and format validation", () => {
    it("returns invalid when argon2 verify fails for the provided code", async () => {
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
      });

      mockedArgon2.verify.mockResolvedValueOnce(false);

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "999999",
      });

      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        baseRecord.codeHash,
        "999999",
      );
      expect(result).toEqual({ kind: "invalid" });
      expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("boundary validation", () => {
    it("returns not-found when purpose is not SIGNUP_VERIFY_EMAIL", async () => {
      // Mock DB lookup to return a verificationCode record, with altered pupose
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
        purpose: "RESET_PASSWORD",
      });

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({ kind: "not-found" });
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns already-verified when user emailVerified is already set", async () => {
      // Mock DB lookup to return a verificationCode record, with emailVerified altered
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
        user: {
          ...baseRecord.user,
          emailVerified: new Date(),
        },
      });

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({ kind: "already-verified" });
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns invalid when code has already been consumed", async () => {
      // Mock DB lookup to return a verificationCode record, with consumedAt altered
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
        consumedAt: new Date(),
      });

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({ kind: "invalid" });
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns expired when expiresAt is in the past", async () => {
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
        expiresAt: new Date(Date.now() - 1_000),
      });

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({ kind: "expired" });
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("strictness", () => {
    it("ignores extra properties on params", async () => {
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
      });
      mockedArgon2.verify.mockResolvedValueOnce(true);
      mockedArgon2.hash.mockResolvedValueOnce("dummy-hash");

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
        // @ts-expect-error intentional extra field
        extra: "ignored",
      });

      expect(result).toEqual({
        kind: "ok",
        setPasswordCodeId: "set-password-code-id",
      });
    });
  });

  describe("interaction", () => {
    it("uses a transaction and updates user and verificationCode correctly", async () => {
      mockedPrisma.verificationCode.findUnique.mockResolvedValueOnce({
        ...baseRecord,
      });
      mockedArgon2.verify.mockResolvedValueOnce(true);
      mockedArgon2.hash.mockResolvedValueOnce("dummy-hash");

      let capturedTx: MockTx | null = null;

      // Override $transaction for this test so we can inspect its tx object
      mockedPrisma.$transaction.mockImplementationOnce(
        async (cb: TransactionCallback) => {
          const tx: MockTx = {
            user: { update: jest.fn() },
            verificationCode: {
              update: jest.fn(),
              deleteMany: jest.fn(),
              create: jest
                .fn()
                .mockResolvedValue({ id: "set-password-code-id" }),
            },
          };
          capturedTx = tx;
          return cb(tx);
        },
      );

      const result = await verifySignupCode({
        verificationCodeId: "code-id",
        verificationCode: "123456",
      });

      expect(result).toEqual({
        kind: "ok",
        setPasswordCodeId: "set-password-code-id",
      });
      expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(capturedTx).not.toBeNull();

      // Non null form of capturedTx so its nested properties can be accessed safely
      const tx = capturedTx!;
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: baseRecord.user.id },
        data: { emailVerified: expect.any(Date) },
      });

      expect(tx.verificationCode.update).toHaveBeenCalledWith({
        where: { id: baseRecord.id },
        data: { consumedAt: expect.any(Date) },
      });
    });
  });
});
