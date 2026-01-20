"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { signup } from "@/lib/api/auth";

function safeNext(next: string | null) {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

export default function SignupCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const safe = safeNext(next);

  return (
    <AuthCard
      showBackButton
      title="Create an account"
      subtitle={"Join book-tracker to track, \nrate and discover books."}
    >
      <AuthForm<{
        ok: true;
        expiresAt: string;
        verificationCodeId: string;
      }>
        fields={[
          {
            id: "email",
            label: "Email",
            type: "email",
            name: "email",
            autoComplete: "email",
            placeholder: "you@example.com",
            maxLength: 254,
            required: true,
          },
          {
            id: "name",
            label: "Name",
            type: "text",
            name: "name",
            autoComplete: "name",
            placeholder: "Your name",
            maxLength: 100,
          },
        ]}
        submitLabel="Sign up"
        pendingLabel="Sending data..."
        onSubmit={signup}
        onSuccess={(data) => {
          const params = new URLSearchParams();

          if (data.verificationCodeId) {
            params.set("verificationCodeId", data.verificationCodeId);
          }
          if (safe) {
            params.set("next", safe);
          }

          const query = params.toString();
          router.replace(query ? `/verify?${query}` : "/verify");
        }}
        footer={
          <div className="mt-3 text-center">
            <p className="text-base">
              Already have an account?{" "}
              <a
                className="font-semibold underline decoration-[0.0777rem] hover:opacity-70"
                href={
                  safe ? `/signin?next=${encodeURIComponent(safe)}` : "/signin"
                }
              >
                Sign in
              </a>
            </p>
          </div>
        }
      />
    </AuthCard>
  );
}
