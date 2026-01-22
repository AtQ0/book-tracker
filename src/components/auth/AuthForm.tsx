import React, { useRef, useState } from "react";
import Field from "../form/Field";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { twMerge } from "tailwind-merge";
import {
  timeoutSignal,
  normalizeEmail,
  normalizeName,
} from "@/lib/auth-helpers";

type Normalizer = (v: string) => string;

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

type SubmitError = {
  message: string;
  field?: string;
};

type AuthFormProps<Data = unknown> = {
  fields: FieldSpec[];
  submitLabel: string;
  pendingLabel?: string;

  onSubmit: (
    values: Record<string, string>,
    signal: AbortSignal,
  ) => Promise<Data>;

  onSuccess?: (data: Data) => void;
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
  const submittingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const clearError = (field: string) => () =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const focusField = (form: HTMLFormElement, name?: string) => {
    if (!name) return;
    const el = form.elements.namedItem(name) as HTMLInputElement | null;
    if (!el) return;
    el.focus();
    if (el.value) {
      const len = el.value.length;
      el.setSelectionRange?.(len, len);
    }
    el.scrollIntoView?.({ block: "center", inline: "nearest" });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (submittingRef.current) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormError("");
    setErrors({});
    submittingRef.current = true;
    setPending(true);

    const fd = new FormData(form);

    const defaults: Partial<Record<string, Normalizer>> = {
      email: normalizeEmail,
      name: normalizeName,
    };

    const values: Record<string, string> = {};
    for (const spec of fields) {
      const raw = String(fd.get(spec.name) ?? "");
      const normalize = spec.normalize ?? defaults[spec.name];
      values[spec.name] = normalize ? normalize(raw) : raw;
    }

    const { signal, cancel } = timeoutSignal(12_000);

    try {
      const data = await onSubmit(values, signal);
      onSuccess?.(data);
    } catch (err) {
      const e = err as Partial<SubmitError>;

      if (e?.field) {
        setErrors((prev) => ({
          ...prev,
          [e.field!]: e.message || "Invalid value",
        }));
        focusField(form, e.field);
      } else {
        setFormError(e?.message || "Something went wrong. Please try again.");
      }
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
