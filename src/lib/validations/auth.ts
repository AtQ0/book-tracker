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
export const VerifySignupSchema = z.object({
  verificationCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be a 6 digit number"),
  verificationCodeId: z.string().min(1, "Verification Code ID is missing"),
});

// SigninSchema

// ResetPasswordSchema
