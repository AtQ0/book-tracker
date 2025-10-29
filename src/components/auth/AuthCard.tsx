import Button from "../ui/Button";
import Field from "../form/Field";
import Input from "../ui/Input";
import BackButton from "../BackButton";

export default function AuthCard() {
  return (
    <div className="flex flex-col gap-10 justify-center items-center border-3 border-alabaster pt-20 py-10 px-13 rounded-md relative">
      <BackButton />
      <h2>Login</h2>
      <form className="flex flex-col gap-8">
        <Field id="email" label="Email">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field id="password" label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="**********"
            required
          />
        </Field>
        <Button type="submit">Log in</Button>
      </form>
      <a href="/forgot-password">Forgot password?</a>
      <div>
        <p className="text-[1rem]">
          Dont have an account:{" "}
          <a href="/signup" className="underline hover:opacity-70">
            Sign up
          </a>
          !
        </p>
      </div>
    </div>
  );
}
