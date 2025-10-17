import { z } from "zod";

// Allowed ?sort= values; Zod enforces at runtime and infers the TS union
export const SortKeyEnum = z.enum([
  "read",
  "want",
  "rating",
  "name_asc",
  "name_desc",
]);

// URL query schema for /api/books; `sort` is optional and must be one of SortKeyEnum
export const BookListQuerySchema = z.object({
  sort: SortKeyEnum.optional(),
});

// validates each book sent to the client matches this shape
// book.ts
export const BookDTOSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    genre: z.string().trim().min(1),
    coverUrl: z.string().url(),
    averageRating: z.number().min(0).max(5), // ← enforce 0..5
    haveRead: z.number().int().nonnegative(),
    currentlyReading: z.number().int().nonnegative(),
    wantToRead: z.number().int().nonnegative(),
  })
  .strict();

// Infer TS type from the DTO schema
export type BookDTO = z.infer<typeof BookDTOSchema>;

// Map UI sort keys corresponding to BookDTO fields and sort directions used by Prisma
export const sortFieldMap: Record<
  z.infer<typeof SortKeyEnum>,
  { field: keyof BookDTO | "createdAt"; direction: "asc" | "desc" }
> = {
  read: { field: "haveRead", direction: "desc" },
  want: { field: "wantToRead", direction: "desc" },
  rating: { field: "averageRating", direction: "desc" },
  name_asc: { field: "name", direction: "asc" },
  name_desc: { field: "name", direction: "desc" },
};
