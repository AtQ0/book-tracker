"use client";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { signup } from "@/lib/api/auth";

export default function SignupCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

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
          const verificationCodeId = data.verificationCodeId;

          const params = new URLSearchParams();

          if (verificationCodeId) {
            params.set("verificationCodeId", verificationCodeId);
          }
          if (next && next.startsWith("/")) {
            params.set("next", next);
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
                  next ? `/login?next=${encodeURIComponent(next)}` : "/login"
                }
              >
                Log in
              </a>
            </p>
          </div>
        }
      />
    </AuthCard>
  );
}
