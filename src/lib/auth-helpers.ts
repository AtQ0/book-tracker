export const SIGNUP_FIELDS = ["name", "email"] as const;
export type FieldKey = (typeof SIGNUP_FIELDS)[number]; // Type of any element in array

// Unified type for all backend error responses
export type ErrorPayload =
  | Readonly<{
      // 422 validation error shape (from Zod .flatten())
      message?: string;
      fieldErrors?: Partial<Record<FieldKey, string[]>>;
      formErrors?: string[];
    }>
  | Readonly<{
      // Problem Details for other non-422 errors (e.g. 409/403/429/500)
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      field?: FieldKey;
      message?: string;
    }>;

/** Lower-case FULL address for canonical equality. */
export function normalizeEmail(raw: string): string {
  const cleaned = raw.normalize("NFKC").trim().replace(/\s+/g, "");
  return cleaned.toLowerCase();
}

/** Trim + collapse internal whitespace to single spaces. */
export function normalizeName(raw: string): string {
  return raw.normalize("NFKC").trim().replace(/\s+/g, " ");
}

// Priority: (1) fieldErrors, (2) formErrors, (3) field, (4) generic message
export function extractFieldError(payload: ErrorPayload | null): {
  field?: FieldKey;
  message: string;
} {
  const formMsg =
    payload &&
    "formErrors" in payload &&
    Array.isArray(payload.formErrors) &&
    payload.formErrors[0];

  const fallback =
    formMsg ||
    (payload && "detail" in payload && payload.detail) ||
    (payload && "message" in payload && payload.message) ||
    "Invalid data. Please check your inputs.";

  if (payload && "fieldErrors" in payload && payload.fieldErrors) {
    for (const k of SIGNUP_FIELDS) {
      const msgs = payload.fieldErrors[k];
      if (Array.isArray(msgs) && msgs.length) {
        return { field: k, message: msgs[0] ?? fallback };
      }
    }
  }

  const field = payload && "field" in payload ? payload.field : undefined;
  return { field, message: fallback };
}

// Helper for aborting async operations after a period of time
export function timeoutSignal(ms: number): {
  signal: AbortSignal;
  cancel: () => void;
  abortNow: () => void;
} {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return {
    signal: ac.signal,
    cancel: () => clearTimeout(t),
    abortNow: () => {
      clearTimeout(t);
      ac.abort();
    },
  };
}

export async function parseJsonIfAny<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null; // body isn't JSON (or empty) => treat as no JSON
  }
}
