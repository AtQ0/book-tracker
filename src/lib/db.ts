// Prisma client singleton
import { PrismaClient } from "@prisma/client";

// Extend javascripts global object with the prisma property containing the PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// store prisma client in an additional constant to ensure we use same instance, without creating duplicates
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // log in console any wrongs during connection, queries, disconnection
  });

// Safeguard to update the global object prisma property with PrismaClient, in case we had to craete new instance
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
