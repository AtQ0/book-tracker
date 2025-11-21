import { SignupSchema } from "@/lib/validations/auth";
import { normalizeEmail, normalizeName } from "@/lib/auth-helpers";
import { runSignup, type SignupResult } from "@/server/auth/signup";
import { sendSignupEmail } from "@/server/mail/sendSignupEmail";
import {
  CODE_TTL_MS,
  RESEND_COOLDOWN_MS,
  ARGON2_OPTS,
} from "@/server/auth/config";
import { json, problem } from "@/server/http";

// Force route to be run in a full Node.js environemnt instead of the default Edge runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse request body to JS object (fallback to {} if JSON is invalid)
    const body = await req.json().catch(() => ({}));
    // Validate via Zod
    const parsed = SignupSchema.safeParse(body); // safeParse returns errors instead of throwing

    // If input fails signupSchema check, return a 422 response
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return json(
        { message: formErrors[0] ?? "Invalid data", fieldErrors }, //custom error message for formErrors and generic ("invalid data") for fieldErrors
        422
      );
    }

    // Normalize email and data
    const email = normalizeEmail(parsed.data.email);
    const name = normalizeName(parsed.data.name);

    const result: SignupResult = await runSignup(
      { email, name },
      {
        ttlMs: CODE_TTL_MS,
        cooldownMs: RESEND_COOLDOWN_MS,
        argon2Opts: ARGON2_OPTS,
        sendMail: sendSignupEmail,
      }
    );

    // Handle every possible signup outcome, based on the union type
    switch (result.kind) {
      case "conflict":
        return problem(409, "Conflict", result.message, {
          field: result.field,
        });
      case "cooldown":
        return problem(
          429,
          "Too Many Requests",
          "Please wait a bit before requesting another code."
        );
      case "mail-failed":
        return problem(502, "Bad Gateway", "Could not send email. Try again.");
      case "ok":
        return json(
          {
            ok: true,
            expiresAt: result.expiresAt.toISOString(),
            session: result.session,
          },
          201
        );
      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustive: never = result; //Ensure all SignupResult cases are handled

        return problem(
          500,
          "Internal Server Error",
          "Unhandled signup result."
        );
      }
    }
  } catch (err) {
    console.error("signup error", err);
    return problem(
      500,
      "Internal Server Error",
      "Could not sign up. Please try again"
    );
  }
}
