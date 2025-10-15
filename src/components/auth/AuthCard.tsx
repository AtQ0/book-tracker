import Input from "../ui/form/Input";

export default function AuthCard() {
  return (
    <div className="flex flex-col justify-center items-center border-2 border-alabaster p-5 rounded">
      <h2>Login</h2>
      <form>
        <label htmlFor="">
          <Input />
        </label>
      </form>
    </div>
  );
}
