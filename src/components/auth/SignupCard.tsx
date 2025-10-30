"use client";
import BackButton from "../BackButton";
import Field from "../form/Field";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function SignupCard() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const name = String(fd.get("name"));

    console.log(email, name);
  }

  return (
    <div className="flex flex-col gap-10 justify-center items-center border-3 border-alabaster pt-17 py-10 px-10 rounded-md relative text-base h-[35.55rem]">
      <BackButton />
      <div className="flex flex-col gap-10 justify-center items-center">
        <div className="flex flex-col gap-6 justify-center items-center">
          <div className="flex flex-col gap-4">
            <h3>Create an account</h3>
            <p className="text-center">
              Join book-tracker to track, rate and
              <span className="block">discover books.</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <Field id="email" label="Email">
              <Input placeholder="you@example.com" />
            </Field>
            <Field id="name" label="Name">
              <Input placeholder="Your name" />
            </Field>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
        </div>
        <p className="text-base">
          Already have an account?{" "}
          <a className="underline hover:opacity-70" href="/login">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
