import { z } from "zod";

export const RateBookDTOSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
  })
  .strict();

export type RateBookDTO = z.infer<typeof RateBookDTOSchema>;
