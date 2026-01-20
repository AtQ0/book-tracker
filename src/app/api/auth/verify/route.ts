import { VerifySignupSchema } from "@/lib/validations/auth";
import { verifySignupCode } from "@/server/auth/verifySignup";
import { json, problem } from "@/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse JSON request body into a JavaScript object
    const body = await req.json().catch(() => ({}));

    // Validate the parsed request body using the Zod schema
    const parsed = VerifySignupSchema.safeParse(body);

    // Return 422 if the request body fails validation
    if (!parsed.success) {
      const { formErrors } = parsed.error.flatten();

      return json(
        { message: formErrors[0] ?? "Invalid verification data" },
        422,
      );
    }

    const { verificationCode, verificationCodeId } = parsed.data;

    const result = await verifySignupCode({
      verificationCodeId,
      verificationCode,
    });

    switch (result.kind) {
      case "ok":
        return json(
          { ok: true, setPasswordCodeId: result.setPasswordCodeId },
          200,
        );

      case "expired":
        return problem(
          422,
          "Unprocessable Entity",
          "Verification code has expired. Please request a new one.",
        );

      case "invalid":
      case "not-found":
        return problem(
          422,
          "Unprocessable Entity",
          "Invalid verification code. Please double check and try again.",
        );

      case "already-verified":
        return problem(409, "Conflict", "This email is already verified.");

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustive: never = result; // If all union variants are handled above, result is narrowed to never here. If a new union variant is added without a matching case, result becomes that variant, and assigning it to never causes a TypeScript error.

        return problem(
          500,
          "Internal Server Error",
          "Unhandled verify result.",
        );
      }
    }
  } catch (err) {
    console.error("verify error", err);
    return problem(
      500,
      "Internal Server Error",
      "Could not verify your email. Please try again",
    );
  }
}
