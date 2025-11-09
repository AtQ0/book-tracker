import Button from "../../../components/ui/Button";
import Field from "../../../components/form/Field";
import Input from "../../../components/ui/Input";
import AuthCard from "../../../components/auth/AuthCard";

export default function LoginCard() {
  return (
    <AuthCard
      showBackButton={true}
      title="Login"
      subtitle={"Log in to book-tracker to track,\nrate and discover books."}
    >
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
      <div className="mt-9 flex flex-col gap-5 justify-center items-center">
        <a href="/forgot-password">Forgot password?</a>
        <p className="text-base">
          Dont have an account:{" "}
          <a href="/signup" className="underline hover:opacity-70">
            Sign up
          </a>
          !
        </p>
      </div>
    </AuthCard>
  );
}
