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

// Type for custom optional normalizer, params string, return value string
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

type AuthFormProps<Data = unknown> = {
  fields: FieldSpec[];
  submitLabel: string;
  pendingLabel?: string;
  onSubmit: (
    values: Record<string, string>,
    signal: AbortSignal
  ) => Promise<Response>;
  onSuccess?: (data: Data, res: Response) => void;
  className?: string;
  footer?: React.ReactNode;
};

export default function AuthForm<Data = unknown>({
  fields,
  submitLabel,
  pendingLabel = "Working...",
  onSubmit,
  onSuccess,
  className,
  footer,
}: AuthFormProps<Data>) {
  // Syncronous/instant flag used for preventing double form submission
  const submittingRef = useRef(false);

  const [pending, setPending] = useState(false);
  // Global form-level error message
  const [formError, setFormError] = useState("");

  // Per-field errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // If error for that field exists, copy error object and clear it (field: undefined)
  const clearError = (field: string) => () =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  // Focus helper, for focuing on e.g. a <input /> element
  const focusField = (form: HTMLFormElement, name?: string) => {
    if (!name) return;
    const el = form.elements.namedItem(name) as HTMLInputElement | null;
    if (!el) return;

    // focus element
    el.focus();

    //  Move cursor to end of value
    if (el.value) {
      const len = el.value.length;
      el.setSelectionRange?.(len, len); // put cursor after last character
    }
    el.scrollIntoView?.({ block: "center", inline: "nearest" });
  };

  // OnSubmit logic
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Create reference to the dom-element responsible for generating the event
    const form = e.currentTarget; // gives us access to form.checkValidity() and form.reportValidity()

    const showFormError = (msg: string) => {
      setFormError(msg); // update for sighted users
    };

    const clearFormError = () => {
      setFormError("");
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

    // Extract current input values from the form into a structured FormData object
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
      // Conduct a callback to login  function, passed down by LoginCard, via onSubmit prop
      const res = await onSubmit(values, signal);

      // If successful request, invoke onSuccess callback with res
      if (res.ok) {
        const payload = await parseJsonIfAny(res);
        onSuccess?.(payload as Data, res);
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
        className="text-xs text-center text-red-600"
        hidden={!formError}
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
