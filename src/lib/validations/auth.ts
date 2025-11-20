import { z } from "zod";

export const SignupSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.email === data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email and name cannot be the same",
        path: [], // empty path = classify error as a form-level error
      });
    }
  });

// VerifySchema

// LoginSchema

// ResetPasswordSchema
