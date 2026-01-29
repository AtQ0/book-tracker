import { z } from "zod";

export const SORT_KEYS = [
  "read",
  "want",
  "rating",
  "name_asc",
  "name_desc",
] as const;

export const SortKeyEnum = z.enum(SORT_KEYS);
export type SortKey = (typeof SORT_KEYS)[number];

export const BookListQuerySchema = z.object({
  sort: SortKeyEnum.optional(),
});

// ✅ AddBookDTO from your spec
export const AddBookDTOSchema = z
  .object({
    name: z.string().trim().min(1),
    genre: z.string().trim().min(1),
    coverUrl: z.string().url(),
    description: z.string().trim().min(1),
  })
  .strict();

export type AddBookDTO = z.infer<typeof AddBookDTOSchema>;

// ✅ BookDTO from your spec (now includes userRating)
export const BookDTOSchema = z
  .object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1),
    genre: z.string().trim().min(1),
    coverUrl: z.string().url(),
    description: z.string().trim().min(1),

    averageRating: z.number().min(0).max(5),

    haveRead: z.number().int().nonnegative(),
    currentlyReading: z.number().int().nonnegative(),
    wantToRead: z.number().int().nonnegative(),

    // If unauthenticated, this will be null
    userRating: z.number().int().min(1).max(5).nullable(),
  })
  .strict();

export type BookDTO = z.infer<typeof BookDTOSchema>;

// Runtime lookup table for sorting
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
