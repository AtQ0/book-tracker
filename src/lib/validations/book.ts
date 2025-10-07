import { z } from "zod";

// Sort option allowed in serchParams URL
export const SortKeyEnum = z.enum([
  "read",
  "want",
  "rating",
  "name_asc",
  "name_desc",
]);

/*== Query validation schema ==*/
export const BookListQuerySchema = z.object({
  sort: SortKeyEnum.optional(),
});

// Shape of a single book
export const BookDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  genre: z.string(),
  coverUrl: z.string().url(),
  averageRating: z.number(),
  haveRead: z.number(),
  currentlyReading: z.number(),
  wantToRead: z.number(),
});

export type BookDTO = z.infer<typeof BookDTOSchema>;

// Map UI sort keys corresponding to BookDTO fields and sort directions
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
