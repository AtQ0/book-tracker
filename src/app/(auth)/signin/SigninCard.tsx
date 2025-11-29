"use client";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { signin } from "@/lib/api/auth";

export default function SigninCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  return (
    <AuthCard
      showBackButton
      title="Sign in"
      subtitle={"Sign in to book-tracker to track,\nrate and discover books."}
    >
      <AuthForm
        fields={[
          {
            id: "email",
            label: "Email",
            type: "email",
            name: "email",
            autoComplete: "email",
            placeholder: "you@example.com",
            required: true,
          },
          {
            id: "password",
            label: "Password",
            type: "password",
            name: "password",
            autoComplete: "current-password",
            placeholder: "**********",
            required: true,
          },
        ]}
        submitLabel="Sign in"
        pendingLabel="Signing in..."
        onSubmit={signin}
        onSuccess={() => {
          if (next && next.startsWith("/")) {
            router.replace(next);
          } else {
            router.replace("/myshelf"); // get this link straight
          }
        }}
        className="flex flex-col gap-8"
        footer={
          <div className="mt-5 flex flex-col gap-8 justify-center items-center">
            <p>
              {" "}
              <a href="/forgot-password" className="underline hover:opacity-70">
                Forgot password
              </a>
              ?
            </p>

            <p className="text-base">
              Do not have an account?{" "}
              <a
                href={
                  next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"
                }
                className="font-semibold underline decoration-[0.0777rem] hover:opacity-70"
              >
                Sign up
              </a>
            </p>
          </div>
        }
      ></AuthForm>
    </AuthCard>
  );
}
