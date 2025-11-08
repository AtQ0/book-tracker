import { ReactNode } from "react";
import BackButton from "../BackButton";

type AuthCardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  showBackButton?: boolean;
};

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  showBackButton = true,
}: AuthCardProps) {
  return (
    <div className="flex felx-col w-[24rem] max-[500px]:w-[20rem] h-[36rem] p-5 border-3 border-alabaster rounded-xl relative">
      {showBackButton && <BackButton />}
    </div>
  );
}
