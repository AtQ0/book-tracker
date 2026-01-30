import "server-only";

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { sortFieldMap, type BookDTO } from "@/lib/validations/book";
import type { ShelfStatus } from "@/lib/validations/shelf";

function statusToField(
  status: ShelfStatus,
): "haveRead" | "currentlyReading" | "wantToRead" {
  if (status === "haveRead") return "haveRead";
  if (status === "currentlyReading") return "currentlyReading";
  return "wantToRead";
}

export async function getBooksFromDb(
  sort?: keyof typeof sortFieldMap,
): Promise<BookDTO[]> {
  let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  if (sort) {
    const { field, direction } = sortFieldMap[sort];
    orderBy = [{ [field]: direction }, { id: "asc" }];
  }

  const rows = await prisma.book.findMany({
    orderBy,
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  return rows.map((b) => ({
    ...b,
    userRating: null,
    userShelfStatus: null,
  }));
}

export async function getBooksFromDbForUser(params: {
  sort?: keyof typeof sortFieldMap;
  userId: string;
}): Promise<BookDTO[]> {
  const { sort, userId } = params;

  let orderBy: Prisma.BookOrderByWithRelationInput[] = [{ createdAt: "desc" }];

  if (sort) {
    const { field, direction } = sortFieldMap[sort];
    orderBy = [{ [field]: direction }, { id: "asc" }];
  }

  const rows = await prisma.book.findMany({
    orderBy,
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,

      // only fetch the logged in user's UserBook row
      userBooks: {
        where: { userId },
        select: { rating: true, status: true },
        take: 1,
      },
    },
  });

  return rows.map((b) => {
    const ub = b.userBooks[0];

    return {
      id: b.id,
      name: b.name,
      genre: b.genre,
      coverUrl: b.coverUrl,
      description: b.description,
      averageRating: b.averageRating,
      haveRead: b.haveRead,
      currentlyReading: b.currentlyReading,
      wantToRead: b.wantToRead,

      userRating: ub?.rating ?? null,
      userShelfStatus: (ub?.status as ShelfStatus | null) ?? null,
    };
  });
}

export async function getBookById(
  bookId: string,
  userId?: string,
): Promise<BookDTO | null> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  if (!book) return null;

  if (!userId) {
    return {
      ...book,
      userRating: null,
      userShelfStatus: null,
    };
  }

  const ub = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId, bookId } },
    select: { rating: true, status: true },
  });

  return {
    ...book,
    userRating: ub?.rating ?? null,
    userShelfStatus: (ub?.status as ShelfStatus | null) ?? null,
  };
}

export async function setShelfStatusForUser(params: {
  userId: string;
  bookId: string;
  status: ShelfStatus;
}): Promise<void> {
  const { userId, bookId, status: nextStatus } = params;

  await prisma.$transaction(async (tx) => {
    const prev = await tx.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { status: true, rating: true },
    });

    if (!prev) {
      const field = statusToField(nextStatus);

      await tx.book.update({
        where: { id: bookId },
        data: { [field]: { increment: 1 } },
      });

      await tx.userBook.create({
        data: { userId, bookId, status: nextStatus },
      });

      return;
    }

    const prevStatus = prev.status;

    if (prevStatus === nextStatus) return;

    if (prevStatus == null) {
      const nextField = statusToField(nextStatus);

      await tx.book.update({
        where: { id: bookId },
        data: { [nextField]: { increment: 1 } },
      });

      await tx.userBook.update({
        where: { userId_bookId: { userId, bookId } },
        data: { status: nextStatus },
      });

      return;
    }

    const prevField = statusToField(prevStatus as ShelfStatus);
    const nextField = statusToField(nextStatus);

    await tx.book.update({
      where: { id: bookId },
      data: {
        [prevField]: { decrement: 1 },
        [nextField]: { increment: 1 },
      },
    });

    await tx.userBook.update({
      where: { userId_bookId: { userId, bookId } },
      data: { status: nextStatus },
    });
  });
}

export async function rateBookForUser(params: {
  userId: string;
  bookId: string;
  rating: number;
}): Promise<void> {
  const { userId, bookId, rating: nextRating } = params;

  await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({
      where: { id: bookId },
      select: { averageRating: true, ratingCount: true },
    });

    if (!book) return;

    const prev = await tx.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { rating: true, status: true },
    });

    if (!prev) {
      const newCount = book.ratingCount + 1;
      const newAvg =
        (book.averageRating * book.ratingCount + nextRating) / newCount;

      await tx.book.update({
        where: { id: bookId },
        data: {
          ratingCount: { increment: 1 },
          averageRating: newAvg,
        },
      });

      await tx.userBook.create({
        data: {
          userId,
          bookId,
          status: null,
          rating: nextRating,
        },
      });

      return;
    }

    if (prev.rating == null) {
      const newCount = book.ratingCount + 1;
      const newAvg =
        (book.averageRating * book.ratingCount + nextRating) / newCount;

      await tx.book.update({
        where: { id: bookId },
        data: {
          ratingCount: { increment: 1 },
          averageRating: newAvg,
        },
      });

      await tx.userBook.update({
        where: { userId_bookId: { userId, bookId } },
        data: { rating: nextRating },
      });

      return;
    }

    if (prev.rating === nextRating) return;

    const count = book.ratingCount;

    const newAvg =
      count <= 1
        ? nextRating
        : (book.averageRating * count - prev.rating + nextRating) / count;

    await tx.book.update({
      where: { id: bookId },
      data: { averageRating: newAvg },
    });

    await tx.userBook.update({
      where: { userId_bookId: { userId, bookId } },
      data: { rating: nextRating },
    });
  });
}

export async function addBookToDb(input: {
  name: string;
  genre: string;
  coverUrl: string;
  description: string;
}): Promise<BookDTO> {
  const created = await prisma.book.create({
    data: {
      name: input.name,
      genre: input.genre,
      coverUrl: input.coverUrl,
      description: input.description,
    },
    select: {
      id: true,
      name: true,
      genre: true,
      coverUrl: true,
      description: true,
      averageRating: true,
      haveRead: true,
      currentlyReading: true,
      wantToRead: true,
    },
  });

  return {
    ...created,
    userRating: null,
    userShelfStatus: null,
  };
}
