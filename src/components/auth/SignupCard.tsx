import BackButton from "../BackButton";
import Field from "../form/Field";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function SignupCard() {
  return (
    <div className="flex flex-col gap-10 justify-center items-center border-3 border-alabaster pt-20 py-10 px-10 rounded-md relative bg-pink-500">
      <BackButton />
      <div className="flex flex-col gap-7 justify-center items-center">
        <div className="flex flex-col gap-2.5">
          <h3>Create an account</h3>
          <p className="text-center">
            Join book-tracker to track, rate and{" "}
            <span className="block">discover books.</span>
          </p>
        </div>
        <form className="bg-amber-300 flex flex-col gap-7">
          <Field id="email" label="Email">
            <Input placeholder="you@example.com" />
          </Field>
          <Field id="name" label="Name">
            <Input placeholder="Your name" />
          </Field>
          <Button className="w-full">Sign up</Button>
        </form>
      </div>
    </div>
  );
}
