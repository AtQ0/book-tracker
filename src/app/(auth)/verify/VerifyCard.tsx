"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import AuthCard from "@/components/auth/AuthCard";
import { verifySignup } from "@/lib/api/auth";

export default function VerifyCard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const source = searchParams.get("source");
  const fromEmail = source === "email";

  const session = searchParams.get("session") ?? "";
  const next = searchParams.get("next");

  return (
    <AuthCard
      className="gap-3"
      showBackButton={!fromEmail}
      title="Verify your account"
      subtitle={"Enter the 6-digit code\nsent to your email adresss."}
    >
      <AuthForm
        className="gap-9"
        fields={[
          {
            id: "code",
            label: "Verification code",
            type: "text",
            name: "code",
            autoComplete: "one-time-code",
            placeholder: "123456",
            maxLength: 6,
            required: true,
          },
        ]}
        submitLabel="Verify"
        pendingLabel="Checking data..."
        onSubmit={(values, signal) =>
          verifySignup({ ...values, session }, signal)
        }
        onSuccess={() => {
          if (next && next.startsWith("/")) {
            router.replace(`/login?next=${encodeURIComponent(next)}`);
          } else {
            router.replace("/login");
          }
        }}
        footer={
          <div className="text-center mt-4">
            <p className="text-base">
              Did not recieve a code?
              <span className="block">
                Check your spam folder or{" "}
                <a
                  href="" // to-be-implemented resend endpoint
                  className="font-semibold underline decoration-[0.0777rem] hover:opacity-70"
                >
                  Resend Code
                </a>
                <span className="ml-[0.025rem] font-semibold">!</span>{" "}
              </span>
            </p>
          </div>
        }
      />
    </AuthCard>
  );
}
