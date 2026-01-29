import { z } from "zod";

export const ShelfStatusSchema = z.enum([
  "haveRead",
  "currentlyReading",
  "wantToRead",
]);

export type ShelfStatus = z.infer<typeof ShelfStatusSchema>;

export const ShelfItemSchema = z
  .object({
    bookId: z.string().trim().min(1),
    status: ShelfStatusSchema,
  })
  .strict();

export type ShelfItem = z.infer<typeof ShelfItemSchema>;

export const UserDTOSchema = z
  .object({
    id: z.string().trim().min(1),
    username: z.string().trim().min(1),
    shelf: z.array(ShelfItemSchema),
  })
  .strict();

export type UserDTO = z.infer<typeof UserDTOSchema>;

// payload for setting shelf status for a book
export const SetShelfSchema = z
  .object({
    status: ShelfStatusSchema,
  })
  .strict();

export type SetShelfDTO = z.infer<typeof SetShelfSchema>;
