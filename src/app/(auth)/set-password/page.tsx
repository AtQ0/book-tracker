import SetPasswordCard from "./SetPasswordCard";

type SearchParams = {
  verificationCodeId?: string;
  next?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function SetPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;

  const verificationCodeId = sp.verificationCodeId ?? "";
  const next = sp.next ?? "/books";

  return (
    <section className="flex justify-center items-center h-full">
      <SetPasswordCard verificationCodeId={verificationCodeId} next={next} />
    </section>
  );
}
