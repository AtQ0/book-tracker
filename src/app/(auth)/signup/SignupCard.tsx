"use client";
import { useRef, useState } from "react";
import Field from "../../../components/form/Field";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useRouter } from "next/navigation";

import {
  extractFieldError,
  parseJsonIfAny,
  timeoutSignal,
  normalizeEmail,
  normalizeName,
  type ErrorPayload,
} from "@/lib/auth-helpers";
import AuthCard from "../../../components/auth/AuthCard";

export default function SignupCard() {
  const submittingRef = useRef(false);
  const router = useRouter();
  const [pending, setPending] = useState(false);

  // Global form-level error message
  const [formError, setFormError] = useState<string>("");

  // Per-field errors
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  const focusField = (form: HTMLFormElement, field?: string) => {
    if (!field) return;
    (form.elements.namedItem(field) as HTMLInputElement | null)?.focus();
  };

  const clearError = (field: "email" | "name") => () =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

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

    // Use shared normalizers (client/server parity)
    const email = normalizeEmail(String(fd.get("email") ?? ""));
    const name = normalizeName(String(fd.get("name") ?? ""));

    const { signal, cancel } = timeoutSignal(12_000);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, name }),
        signal: signal, // Attach AbortController so it can abort the fetch if needed
        cache: "no-store",
        credentials: "same-origin",
      });

      if (res.ok) {
        router.replace("/verify");
        return;
      }

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
        "Something went wrong while signing up. Please try again.";
      showFormError(generic);
    } catch {
      showFormError(
        "Netword issue or timeout. Please check your connection and try again."
      );
    } finally {
      cancel(); // clear timeout created by timeoutSignal
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <AuthCard
      showBackButton
      title="Create an account"
      subtitle={"Join book-tracker to track, \nrate and discover books."}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-7"
        noValidate
        autoComplete="on"
      >
        {" "}
        <Field id="email" label="Email" required error={errors.email}>
          <Input
            name="email"
            type="email"
            maxLength={254}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            spellCheck="false"
            inputMode="email"
            enterKeyHint="send"
            onInput={clearError("email")}
          />
        </Field>
        <Field id="name" label="Name" error={errors.name}>
          <Input
            name="name"
            type="text"
            maxLength={100}
            placeholder="Your name"
            autoComplete="name"
            onInput={clearError("name")}
          />
        </Field>
        {/* Form-level error region*/}
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
          {pending ? "Sending code..." : "Sign up"}
        </Button>
      </form>
      <div className="mt-13">
        <p className="text-base">
          Already have an account?{" "}
          <a className="underline hover:opacity-70" href="/login">
            Log in
          </a>
        </p>
      </div>
    </AuthCard>
  );
}
