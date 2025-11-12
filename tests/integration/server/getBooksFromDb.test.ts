/**
 * @jest-environment node
 */

// ---- Mocks -----

// Mock the Prisma client module (db.ts) to stub out real DB calls during tests
jest.mock("@/lib/db", () => ({
  // Mock the Prisma client instance exporten from src/lib/db
  prisma: {
    book: {
      // Mock findMany go act like Prisma, but without hitting a real DB
      findMany: jest.fn(async () => []),
    },
  },
}));

import { prisma } from "@/lib/db";
import { getBooksFromDb } from "@/server/books";

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("getBooksFromDb => Prisma args", () => {
  it("default (undefined) => orders by createdAt desc + selects expected fields", async () => {
    // Trigger one Prisma findMany()
    await getBooksFromDb(undefined);

    // check that finMany has been called once
    expect(prisma.book.findMany as jest.Mock).toHaveBeenCalledTimes(1);

    // Retrieve first argument from the first call to the mocked findMany() function
    const arg = (prisma.book.findMany as jest.Mock).mock.calls[0][0];

    expect(arg.orderBy).toEqual([{ createdAt: "desc" }]);
    expect(arg.select).toEqual(
      expect.objectContaining({
        id: true,
        name: true,
        description: true,
        genre: true,
        coverUrl: true,
        averageRating: true,
        haveRead: true,
        currentlyReading: true,
        wantToRead: true,
      })
    );
  });

  // Ensures each sort key produces the correct Prisma `orderBy` array
  it.each([
    ["sort=name_desc", "name_desc", [{ name: "desc" }, { id: "asc" }]],
    ["sort=rating", "rating", [{ averageRating: "desc" }, { id: "asc" }]],
    ["sort=want", "want", [{ wantToRead: "desc" }, { id: "asc" }]],
    ["sort=read", "read", [{ haveRead: "desc" }, { id: "asc" }]],
  ] as const)(
    "%s builds expected orderBy",
    async (_label, key, expectedOrder) => {
      await getBooksFromDb(key);
      const arg = (prisma.book.findMany as jest.Mock).mock.calls[0][0];
      expect(arg.orderBy).toEqual(expectedOrder);
    }
  );
});
