import { Suspense } from "react";
import SignupCard from "@/app/(auth)/signup/SignupCard";

export default function SignupPage() {
  return (
    <section>
      <Suspense fallback={<p>Loading signup...</p>}>
        <SignupCard />
      </Suspense>
    </section>
  );
}
