"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import { signup } from "@/lib/api/auth";

export default function SignupCard() {
  const router = useRouter();

  return (
    <AuthCard
      className="bg-pink-200"
      showBackButton
      title="Create an account"
      subtitle={"Join book-tracker to track, \nrate and discover books."}
    >
      <AuthForm
        className="bg-amber-300 gap-8"
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
        onSuccess={() => router.replace("/verify")}
        footer={
          <div className="mt-13 text-center">
            <p className="text-base">
              Already have an account?{" "}
              <a className="underline hover:opacity-70" href="/login">
                Log in
              </a>
            </p>
          </div>
        }
      ></AuthForm>
    </AuthCard>
  );
}
