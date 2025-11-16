"use client";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { signup } from "@/lib/api/auth";

export default function SignupCard() {
  const router = useRouter();

  return (
    <AuthCard
      showBackButton
      title="Create an account"
      subtitle={"Join book-tracker to track, \nrate and discover books."}
    >
      <AuthForm<{
        ok: true;
        expiresAt: string;
        session: string;
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
          const session = data.session;

          if (session) {
            router.replace(`/verify?session=${encodeURIComponent(session)}`);
          } else {
            router.replace("/verify");
          }
        }}
        footer={
          <div className="mt-3 text-center">
            <p className="text-base">
              Already have an account?{" "}
              <a className="underline hover:opacity-70" href="/login">
                Log in
              </a>
            </p>
          </div>
        }
      />
    </AuthCard>
  );
}
