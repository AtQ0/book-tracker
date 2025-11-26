import { Suspense } from "react";
import LoginCard from "@/app/(auth)/login/LoginCard";

export default function LoginPage() {
  return (
    <section>
      <Suspense fallback={<p>Loading login...</p>}>
        <LoginCard />
      </Suspense>
    </section>
  );
}
