// Prisma client singleton
import { PrismaClient } from "@prisma/client";

// Type-annotate the `prisma` key on existing global object for storing a PrismaClient instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// reuse existing prisma client or create new one
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"], // log in console any wrongs during connection, queries, disconnection
  });

// Cache the PrismaClient instance globally in dev/runtime to prevent new instances on hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
