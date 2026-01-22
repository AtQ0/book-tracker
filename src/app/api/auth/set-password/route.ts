import { SetPasswordSchema } from "@/lib/validations/auth";
import { setPasswordFromVerifiedSignupCode } from "@/server/auth/setPassword";
import { json, problem } from "@/server/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse JSON request body into a JavaScript object
    const body = await req.json().catch(() => ({}));

    // Validate the parsed request body using the Zod schema
    const parsed = SetPasswordSchema.safeParse(body);

    // Return 422 if the request body fails validation
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();

      return json(
        { message: formErrors[0] ?? "Invalid data", fieldErrors },
        422,
      );
    }

    const { verificationCodeId, password } = parsed.data;

    const result = await setPasswordFromVerifiedSignupCode({
      verificationCodeId,
      password,
    });

    switch (result.kind) {
      case "ok":
        return json({ ok: true, email: result.email }, 200);

      case "not-found":
        return problem(404, "Not Found", "Verification code not found.");

      case "wrong-purpose":
        return problem(
          422,
          "Unprocessable Entity",
          "Invalid verification code purpose.",
        );

      case "expired":
        return problem(
          422,
          "Unprocessable Entity",
          "Verification code has expired. Please request a new one.",
        );

      case "already-consumed":
        return problem(
          409,
          "Conflict",
          "This verification code has already been used.",
        );

      case "email-not-verified":
        return problem(
          403,
          "Forbidden",
          "Email not verified. Please verify your email first.",
        );

      case "password-already-set":
        return problem(409, "Conflict", "Password is already set.");

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustive: never = result;

        return problem(
          500,
          "Internal Server Error",
          "Unhandled set password result.",
        );
      }
    }
  } catch (err) {
    console.error("set-password error", err);
    return problem(
      500,
      "Internal Server Error",
      "Could not set password. Please try again.",
    );
  }
}
