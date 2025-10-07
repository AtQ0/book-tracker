// Prisma client singleton
import { PrismaClient } from "@prisma/client";

// Create a single global connection to db
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// reuse existing prisma client or create new
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

// prevent multiple instance in dev
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
