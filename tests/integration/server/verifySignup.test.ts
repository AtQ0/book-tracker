import { verifySignupCode } from "@/server/auth/verifySignup";
import { prisma } from "@/lib/db";
import argon2 from "argon2";

// Shape of the fake transaction client passed into prisma.$transaction
type MockTx = {
  user: { update: jest.Mock };
  verificationCode: { update: jest.Mock };
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
        verificationCode: { update: jest.fn() },
      };
      return cb(tx);
    }),
  },
}));

// Mock argon2.verify (PIN validation)
jest.mock("argon2", () => ({
  verify: jest.fn(),
}));

// TS cast: tell TypeScript that the mocked prisma object has jest.Mock methods
const mockedPrisma = prisma as unknown as {
  verificationCode: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};

// TS-only cast so argon2.verify is typed as jest.Mock
const mockedArgon2 = argon2 as unknown as {
  verify: jest.Mock;
};
