import { Suspense } from "react";
import SigninCard from "@/app/(auth)/signin/SigninCard";

export default function SigninPage() {
  return (
    <section>
      <Suspense fallback={<p>Loading sign in...</p>}>
        <SigninCard />
      </Suspense>
    </section>
  );
}
