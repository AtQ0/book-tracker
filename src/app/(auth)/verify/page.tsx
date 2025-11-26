import { Suspense } from "react";
import VerifyCard from "@/app/(auth)/verify/VerifyCard";

export default function VerifyPage() {
  return (
    <section>
      <Suspense fallback={<p>Loading verify...</p>}>
        <VerifyCard />
      </Suspense>
    </section>
  );
}
