export const signup = (values: Record<string, string>, signal: AbortSignal) =>
  fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

export const signin = (values: Record<string, string>, signal: AbortSignal) =>
  fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

export const verifySignup = (
  values: Record<string, string>,
  signal: AbortSignal
) =>
  fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });
