"use client";

import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { setPassword } from "@/lib/api/auth";
import { signIn } from "next-auth/react";

type SetPasswordCardProps = {
  verificationCodeId: string;
  next: string;
};

function safeNext(next: string) {
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

export default function SetPasswordCard({
  verificationCodeId,
  next,
}: SetPasswordCardProps) {
  const router = useRouter();
  const safe = safeNext(next);

  let lastPassword = "";

  return (
    <AuthCard
      title="Set password"
      subtitle={
        "Your email is verified. Choose a password\n to finish creating your account."
      }
    >
      <AuthForm<{ ok: true; email: string }>
        fields={[
          {
            id: "password",
            label: "New password",
            type: "password",
            name: "password",
            autoComplete: "new-password",
            placeholder: "Enter new password",
            required: true,
          },
          {
            id: "confirmPassword",
            label: "Confirm password",
            type: "password",
            name: "confirmPassword",
            autoComplete: "new-password",
            placeholder: "Confirm your password",
            required: true,
          },
        ]}
        submitLabel="Set password"
        pendingLabel="Setting password..."
        onSubmit={(data, signal) => {
          lastPassword = data.password;

          return setPassword(
            {
              verificationCodeId,
              password: data.password,
              confirmPassword: data.confirmPassword,
            },
            signal,
          );
        }}
        onSuccess={async (data) => {
          const callbackUrl = safe ?? "/books";

          // Credentials provider expects { email, password }.
          await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: lastPassword,
            callbackUrl,
          });

          router.replace(callbackUrl);
        }}
        className="flex flex-col gap-8"
        footer={
          <p className="text-base text-center mt-5">
            Already have an account?{" "}
            <a
              href={
                safe ? `/signin?next=${encodeURIComponent(safe)}` : "/signin"
              }
              className="underline hover:opacity-70"
            >
              Sign in
            </a>
          </p>
        }
      />
    </AuthCard>
  );
}
