import AuthCard from "../../../components/auth/AuthCard";

export default function VerifyCard() {
  return (
    <AuthCard
      showBackButton
      title="Verify your account"
      subtitle={"Enter the 6-digit code we \nsent you to your email"}
    ></AuthCard>
  );
}
