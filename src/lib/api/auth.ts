import { parseJsonIfAny } from "@/lib/auth-helpers";

type SubmitError = { message: string; field?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

async function toJsonOrThrow<T>(res: Response): Promise<T> {
  const payload = await parseJsonIfAny<unknown>(res);

  if (!res.ok) {
    let message: string | undefined;
    let field: string | undefined;

    if (isRecord(payload)) {
      message = getString(payload, "message") ?? getString(payload, "detail");
      field = getString(payload, "field");
    }

    throw {
      message: message ?? "Something went wrong. Please try again.",
      field,
    } satisfies SubmitError;
  }

  // payload may be null if server returns 204 etc.
  if (payload == null) {
    throw { message: "Empty response from server." } satisfies SubmitError;
  }

  return payload as T;
}

export const signup = (values: Record<string, string>, signal: AbortSignal) =>
  fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

export const verifySignup = (
  values: Record<string, string>,
  signal: AbortSignal,
) =>
  fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

export const setPassword = (
  values: Record<string, string>,
  signal: AbortSignal,
) =>
  fetch("/api/auth/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

export async function signupJson<T>(
  values: Record<string, string>,
  signal: AbortSignal,
) {
  const res = await signup(values, signal);
  return toJsonOrThrow<T>(res);
}

export async function verifySignupJson<T>(
  values: Record<string, string>,
  signal: AbortSignal,
) {
  const res = await verifySignup(values, signal);
  return toJsonOrThrow<T>(res);
}

export async function setPasswordJson<T>(
  values: Record<string, string>,
  signal: AbortSignal,
) {
  const res = await setPassword(values, signal);
  return toJsonOrThrow<T>(res);
}
