import React, { useRef, useState } from "react";
import Field from "../form/Field";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { twMerge } from "tailwind-merge";

import {
  parseJsonIfAny,
  timeoutSignal,
  normalizeEmail,
  normalizeName,
  extractFieldError,
  type ErrorPayload,
} from "@/lib/auth-helpers";

// Type for a function that has param as string and output as string
type Normalizer = (v: string) => string;

// Description of one field in auth form
type FieldSpec = {
  id: string;
  label: string;
  type: React.ComponentPropsWithoutRef<"input">["type"];
  name: string;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  normalize?: Normalizer;
};

type AuthFormProps = {
  fields: FieldSpec[];
  submitLabel: string;
  pendingLabel?: string;
  onSubmit: (
    values: Record<string, string>, // object whose keys and values are strings
    signal: AbortSignal
  ) => Promise<Response>; // returns a promise that contains a response
  onSuccess?: (res: Response) => void;
  className?: string;
  footer?: React.ReactNode;
};

export default function AuthForm({
  fields,
  submitLabel,
  pendingLabel = "Working...",
  onSubmit,
  onSuccess,
  className,
  footer,
}: AuthFormProps) {
  const submittingRef = useRef(false);
  const [pending, setPending] = useState(false);

  // Global form-level error message
  const [formError, setFormError] = useState("");

  // Per-field errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Clear field error if it's currently showing
  const clearError = (field: string) => () =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  // Focus helper
  const focusField = (form: HTMLFormElement, name?: string) => {
    if (!name) return;
    const el = form.elements.namedItem(name) as HTMLInputElement | null;
    if (!el) return;

    // focus element
    el.focus();

    //  Move cursor to end of value
    if (el.value) {
      const len = el.value.length;
      el.setSelectionRange?.(len, len);
    }
    el.scrollIntoView?.({ block: "center", inline: "nearest" });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Global error outlet for screen readers
    const errorEl = form.querySelector<HTMLElement>("[data-form-error]");

    const showFormError = (msg: string) => {
      setFormError(msg);
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.removeAttribute("hidden");
      }
    };

    const clearFormError = () => {
      setFormError("");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.setAttribute("hidden", "");
      }
    };

    // Prevent double submission
    if (submittingRef.current) return;

    // Run HTML5 validation on inputted data
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Reset errors, lock submission, and show pending state
    clearFormError();
    setErrors({});
    submittingRef.current = true;
    setPending(true);

    const fd = new FormData(e.currentTarget);

    // central default normalizers by name
    const defaults: Partial<Record<string, Normalizer>> = {
      email: normalizeEmail,
      name: normalizeName,
    };

    // Use normalizers on input
    const values: Record<string, string> = {};
    for (const spec of fields) {
      const raw = String(fd.get(spec.name) ?? "");
      const normalize = spec.normalize ?? defaults[spec.name];

      // store normalized input data under a key matching the field name (spec.name)
      values[spec.name] = normalize ? normalize(raw) : raw;
    }

    // create an AbortSignal that auto-cancels after 12 seconds
    const { signal, cancel } = timeoutSignal(12_000);

    try {
      const res = await onSubmit(values, signal);

      // If successful request, invoke onSuccess callback with res
      if (res.ok) {
        onSuccess?.(res);
        return;
      }

      // Parse response into error management payload
      const payload = await parseJsonIfAny<ErrorPayload>(res);

      //---- Conflicts management ------

      // handle conflict (422): invalid or missing field input
      if (res.status === 422) {
        const { field, message } = extractFieldError(payload ?? null);
        if (field) {
          setErrors((prev) => ({
            ...prev,
            [field]: message || "Invalid value",
          }));
          focusField(form, field);
        } else {
          showFormError(message || "Invalid data.");
        }
        return;
      }

      // handle conflict (409): email already exists
      if (res.status === 409) {
        const msg =
          payload?.message ||
          "That email is already registered. Try signing in instead.";
        setErrors((prev) => ({ ...prev, email: msg }));
        focusField(form, "email");
        return;
      }

      // Handle conflict (429): too  many requests
      if (res.status === 429) {
        const msg =
          (payload && "detail" in payload && payload.detail) ||
          (payload && "message" in payload && payload.message) ||
          "Too many attempts. Please wait a little before trying again.";
        showFormError(msg);
        return;
      }

      // Handle generic server errors (e.g. 500/502/503/etc.)
      const generic =
        (payload && "detail" in payload && payload.detail) ||
        (payload && "message" in payload && payload.message) ||
        "Something went wrong. Please try again.";
      showFormError(generic);
    } catch {
      showFormError(
        "Network issue or timeout. Please check your connection and try again."
      );
    } finally {
      cancel();
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={twMerge("flex flex-col gap-7", className)}
      noValidate
      autoComplete="on"
    >
      {fields.map((f) => (
        <Field
          key={f.id}
          id={f.id}
          label={f.label}
          required={f.required}
          error={errors[f.name]}
        >
          <Input
            name={f.name}
            type={f.type}
            maxLength={f.maxLength}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            onInput={clearError(f.name)}
          />
        </Field>
      ))}

      <p
        data-form-error
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="text-sm text-red-600"
        hidden
      >
        {formError}
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>

      {footer}
    </form>
  );
}
