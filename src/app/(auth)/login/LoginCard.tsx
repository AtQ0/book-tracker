"use client";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { login } from "@/lib/api/auth";

export default function LoginCard() {
  const router = useRouter();
  return (
    <AuthCard
      showBackButton
      title="Login"
      subtitle={"Log in to book-tracker to track,\nrate and discover books."}
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
        submitLabel="Log in"
        pendingLabel="Logging in..."
        onSubmit={login}
        onSuccess={() => router.replace("/books/[]")}
        className="flex flex-col gap-8"
        footer={
          <div className="mt-5 flex flex-col gap-8 justify-center items-center">
            <a href="/forgot-password" className="underline hover:opacity-70">
              Forgot password?
            </a>
            <p className="text-base">
              Do not have an account?{" "}
              <a href="/signup" className="underline hover:opacity-70">
                Sign up
              </a>
              .
            </p>
          </div>
        }
      ></AuthForm>
    </AuthCard>
  );
}
