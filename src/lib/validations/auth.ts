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

// SetPasswordSchema
export const SetPasswordSchema = z
  .object({
    verificationCodeId: z.string().min(1, "Verification Code ID is missing"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

// SigninSchema

// ResetPasswordSchema
