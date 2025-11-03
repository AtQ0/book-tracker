import { z } from "zod";

export const SignupSchema = z
  .object({
    email: z.string().trim().min(1).email().max(254),
    name: z.string().trim().min(1).max(100),
  })
  .strict();
